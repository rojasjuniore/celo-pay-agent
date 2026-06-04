CREATE TABLE "accounts" (
	"wallet" varchar(42) PRIMARY KEY NOT NULL,
	"email" varchar(254),
	"full_name" varchar(128),
	"country" varchar(2),
	"kyc_verified" timestamp with time zone,
	"self_id" varchar(128),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beneficiaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_wallet" varchar(42) NOT NULL,
	"name" varchar(128) NOT NULL,
	"country" varchar(2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "beneficiaries" ADD CONSTRAINT "beneficiaries_owner_wallet_accounts_wallet_fk" FOREIGN KEY ("owner_wallet") REFERENCES "public"."accounts"("wallet") ON DELETE no action ON UPDATE no action;