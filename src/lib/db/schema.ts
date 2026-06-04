import {
  pgTable,
  uuid,
  varchar,
  numeric,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

/**
 * Esquema de persistencia. payment_intents guarda lo que el agente debe pagar
 * (programado/recurrente); tx_log registra cada tx onchain real. Datos reales,
 * sin mocks. Audit fields created_at/updated_at en cada tabla.
 */

export const intentStatus = pgEnum("intent_status", [
  "pending",
  "executing",
  "done",
  "failed",
]);

export const paymentIntents = pgTable("payment_intents", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: varchar("type", { length: 16 }).notNull(),
  amountUsd: numeric("amount_usd").notNull(),
  recipient: varchar("recipient", { length: 128 }).notNull(),
  country: varchar("country", { length: 2 }).notNull(),
  schedule: varchar("schedule", { length: 16 }).notNull(),
  status: intentStatus("status").notNull().default("pending"),
  nextRunAt: timestamp("next_run_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const txLog = pgTable("tx_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  intentId: uuid("intent_id").references(() => paymentIntents.id),
  /** kind: transfer | x402 | bridge | ramp | register */
  kind: varchar("kind", { length: 16 }).notNull(),
  chain: varchar("chain", { length: 16 }).notNull(),
  txHash: varchar("tx_hash", { length: 66 }).notNull(),
  status: varchar("status", { length: 16 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Cuenta de usuario: la wallet (login thirdweb) es la identidad. KYC vía Self. */
export const accounts = pgTable("accounts", {
  /** Dirección de la wallet del usuario (clave). */
  wallet: varchar("wallet", { length: 42 }).primaryKey(),
  email: varchar("email", { length: 254 }),
  fullName: varchar("full_name", { length: 128 }),
  country: varchar("country", { length: 2 }),
  /** Verificado con Self (proof-of-human). */
  kycVerified: timestamp("kyc_verified", { withTimezone: true }),
  /** userIdentifier devuelto por Self. */
  selfId: varchar("self_id", { length: 128 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Beneficiarios (a quién le manda el usuario). */
export const beneficiaries = pgTable("beneficiaries", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerWallet: varchar("owner_wallet", { length: 42 })
    .notNull()
    .references(() => accounts.wallet),
  name: varchar("name", { length: 128 }).notNull(),
  country: varchar("country", { length: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
