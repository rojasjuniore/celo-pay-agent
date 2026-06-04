CREATE TYPE "public"."intent_status" AS ENUM('pending', 'executing', 'done', 'failed');--> statement-breakpoint
CREATE TABLE "payment_intents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(16) NOT NULL,
	"amount_usd" numeric NOT NULL,
	"recipient" varchar(128) NOT NULL,
	"country" varchar(2) NOT NULL,
	"schedule" varchar(16) NOT NULL,
	"status" "intent_status" DEFAULT 'pending' NOT NULL,
	"next_run_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tx_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"intent_id" uuid,
	"kind" varchar(16) NOT NULL,
	"chain" varchar(16) NOT NULL,
	"tx_hash" varchar(66) NOT NULL,
	"status" varchar(16) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tx_log" ADD CONSTRAINT "tx_log_intent_id_payment_intents_id_fk" FOREIGN KEY ("intent_id") REFERENCES "public"."payment_intents"("id") ON DELETE no action ON UPDATE no action;