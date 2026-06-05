import type { PaymentIntent } from "@/modules/agent/payment-intent";

/**
 * Categorías contables de un pago. Lógica pura para derivar una categoría por
 * defecto desde el intent; el usuario/LLM puede sobreescribirla.
 */
export const CATEGORIES = [
  "remittance",
  "subscription",
  "bill",
  "family",
  "business",
  "other",
] as const;
export type Category = (typeof CATEGORIES)[number];

/** Etiquetas legibles (ES) para mostrar. */
export const CATEGORY_LABELS: Record<Category, string> = {
  remittance: "Remesas",
  subscription: "Suscripciones",
  bill: "Facturas",
  family: "Familia",
  business: "Negocio",
  other: "Otros",
};

const SUBSCRIPTION_RE = /netflix|spotify|disney|hbo|prime|youtube|suscrip|subscription/i;
const BILL_RE = /factura|bill|utilit|electric|water|agua|luz|internet|phone|celular/i;
const FAMILY_RE = /mam[aá]|pap[aá]|herman|family|familia|mom|dad|son|hija|hijo/i;

/** Deriva la categoría por defecto del intent (recipient + type). */
export function deriveCategory(intent: Pick<PaymentIntent, "type" | "recipient">): Category {
  const r = intent.recipient;
  if (SUBSCRIPTION_RE.test(r)) return "subscription";
  if (BILL_RE.test(r)) return "bill";
  if (FAMILY_RE.test(r)) return "family";
  if (intent.type === "remittance") return "remittance";
  return "other";
}

/** Valida/normaliza una categoría provista; cae en "other" si no es válida. */
export function normalizeCategory(value: string | null | undefined): Category {
  const v = (value ?? "").toLowerCase();
  return (CATEGORIES as readonly string[]).includes(v) ? (v as Category) : "other";
}
