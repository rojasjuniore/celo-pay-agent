import { PaymentIntentSchema, type PaymentIntent, type SCHEDULES } from "./payment-intent";
import { assertWithinPolicy } from "./policy";

/**
 * parseIntent — convierte lenguaje natural (ES/EN) en un PaymentIntent tipado.
 *
 * Parser determinista para los patrones canónicos (rápido, testeable, sin red).
 * Funciona en inglés y español. En runtime el LLM (OpenRouter) cubre los casos
 * abiertos en cualquier idioma y delega aquí la validación con el mismo schema.
 * Falla fuerte ante entradas inválidas (sin fallback silencioso).
 *
 * Sin valores hardcodeados de negocio: límites viven en policy.ts, países y
 * enums en payment-intent.ts. Aquí solo vocabulario de NLU, declarado en tablas.
 */

type Schedule = (typeof SCHEDULES)[number];

/** Vocabulario de frecuencia (ES + EN), declarado una sola vez. */
const SCHEDULE_PATTERNS: ReadonlyArray<[RegExp, Schedule]> = [
  [/quincen|cada\s+15\s+d[ií]as|every\s+two\s+weeks|biweekly|fortnight/i, "biweekly"],
  [/mensual|cada\s+mes|monthly|every\s+month/i, "monthly"],
  [/semanal|cada\s+semana|weekly|every\s+week/i, "weekly"],
];

/** Preposiciones de destinatario (ES + EN). */
const RECIPIENT_PREP = /\b(?:a|to)\s+(?:mi|my)?\s*/i;
/** Cláusulas de lugar (ES + EN), para limpiarlas antes de aislar al destinatario. */
const PLACE_CLAUSE = /\s+(?:en|in)\s+[\wáéíóúñ]+/gi;
/** Sufijos de frecuencia a remover del texto antes de extraer destinatario. */
const SCHEDULE_CLAUSE =
  /\b(?:cada\s+[\wáéíóúñ]+|quincenal|mensual|semanal|biweekly|monthly|weekly|every\s+\w+(?:\s+weeks?)?)\b/gi;

/** Señales de destino Colombia (ES + EN). */
const COLOMBIA_SIGNAL = /(colombia|bogot[aá]|medell[ií]n|cali|cartagena|cop|pesos)/i;

function detectSchedule(text: string): Schedule {
  for (const [re, schedule] of SCHEDULE_PATTERNS) {
    if (re.test(text)) return schedule;
  }
  return "once";
}

function extractAmountUsd(text: string): number {
  const match = text.match(
    /\$\s*([\d.,]+)|\b([\d.,]+)\s*(?:usd|d[oó]lares?|dollars?)\b/i,
  );
  if (!match) {
    throw new Error("No amount found in the message. / No se encontró un monto.");
  }
  const raw = (match[1] ?? match[2]).replace(/,/g, "");
  const amount = Number.parseFloat(raw);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid amount detected. / El monto detectado no es válido.");
  }
  return amount;
}

function extractRecipient(text: string): string {
  const cleaned = text
    .replace(SCHEDULE_CLAUSE, "")
    .replace(PLACE_CLAUSE, "")
    .trim();
  const match = cleaned.match(new RegExp(`${RECIPIENT_PREP.source}([\\wáéíóúñ ]+?)\\s*$`, "i"));
  if (match) return match[1].trim();
  return "recipient";
}

function detectType(text: string, schedule: Schedule): PaymentIntent["type"] {
  if (schedule !== "once") {
    return COLOMBIA_SIGNAL.test(text) ? "remittance" : "recurring";
  }
  return "payment";
}

export function parseIntent(text: string): PaymentIntent {
  const amountUsd = extractAmountUsd(text);
  assertWithinPolicy(amountUsd);

  const schedule = detectSchedule(text);
  const intent: PaymentIntent = {
    type: detectType(text, schedule),
    amountUsd,
    recipient: extractRecipient(text),
    country: "CO",
    schedule,
  };

  return PaymentIntentSchema.parse(intent);
}
