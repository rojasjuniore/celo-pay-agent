import { z } from "zod";

/**
 * PaymentIntent — el resultado estructurado de interpretar lenguaje natural.
 * Es el contrato entre el cerebro (LLM) y la ejecución onchain. Validado en el
 * borde con Zod: si el LLM devuelve algo inválido, falla fuerte (no fallback).
 */

export const PAYMENT_TYPES = ["remittance", "payment", "recurring"] as const;
export const SCHEDULES = ["once", "weekly", "biweekly", "monthly"] as const;

/**
 * País destino del off-ramp en ISO-3166 alpha-2. El producto es GLOBAL: Noah
 * resuelve el corredor por país. Colombia (CO) es el caso de demo, no el límite.
 * Default CO cuando el usuario no especifica.
 */
export const PaymentIntentSchema = z.object({
  type: z.enum(PAYMENT_TYPES),
  amountUsd: z.number().positive(),
  recipient: z.string().min(1),
  /** ISO-3166 alpha-2 (ej: CO, MX, BR, AR). Default CO. */
  country: z
    .string()
    .length(2)
    .transform((c) => c.toUpperCase())
    .default("CO"),
  schedule: z.enum(SCHEDULES),
});

export type PaymentIntent = z.infer<typeof PaymentIntentSchema>;
