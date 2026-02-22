CREATE TABLE "transactions" (
	"id" varchar(27) PRIMARY KEY NOT NULL,
	"user_id" varchar(27) NOT NULL,
	"email" varchar(255) NOT NULL,
	"exchange" varchar(50) NOT NULL,
	"operation_date" varchar(32) NOT NULL,
	"operation" varchar(128) NOT NULL,
	"base_currency" varchar(20) NOT NULL,
	"base_amount" numeric(28, 10) NOT NULL,
	"fee" numeric(28, 10) NOT NULL,
	"currency_price" numeric(28, 10) NOT NULL,
	"quote_amount" numeric(28, 10) NOT NULL,
	"final_balance" numeric(28, 10) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(27) PRIMARY KEY NOT NULL,
	"username" varchar(128) NOT NULL,
	"email" varchar(255) NOT NULL,
	"cognito_sub" varchar(255) NOT NULL,
	"user_confirmed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_cognito_sub_unique" UNIQUE("cognito_sub")
);
