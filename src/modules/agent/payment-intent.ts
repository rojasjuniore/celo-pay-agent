import { z } from "zod";

/**
 * PaymentIntent — el resultado estructurado de interpretar lenguaje natural.
 * Es el contrato entre el cerebro (LLM) y la ejecución onchain. Validado en el
 * borde con Zod: si el LLM devuelve algo inválido, falla fuerte (no fallback).
 */

export const PAYMENT_TYPES = ["remittance", "payment", "recurring"] as const;
export const SCHEDULES = ["once", "weekly", "biweekly", "monthly"] as const;

/** Países soportados para off-ramp (de momento solo Colombia). */
export const COUNTRIES = ["CO"] as const;

export const PaymentIntentSchema = z.object({
  type: z.enum(PAYMENT_TYPES),
  amountUsd: z.number().positive(),
  recipient: z.string().min(1),
  country: z.enum(COUNTRIES),
  schedule: z.enum(SCHEDULES),
});

export type PaymentIntent = z.infer<typeof PaymentIntentSchema>;
