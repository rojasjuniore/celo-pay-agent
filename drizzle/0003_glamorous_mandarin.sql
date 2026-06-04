CREATE TABLE "used_nonces" (
	"nonce" varchar(64) PRIMARY KEY NOT NULL,
	"wallet" varchar(42) NOT NULL,
	"used_at" timestamp with time zone DEFAULT now() NOT NULL
);
