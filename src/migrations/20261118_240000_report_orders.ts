import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { backfillReportOrders, stripeRequest } from '../lib/report-order-sync.mjs'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_report_orders_payment_status" AS ENUM ('paid', 'partially_refunded', 'refunded');
    CREATE TABLE "report_orders" (
      "id" serial PRIMARY KEY NOT NULL,
      "order_reference" varchar NOT NULL,
      "buyer_name" varchar,
      "buyer_email" varchar,
      "reports_summary" varchar,
      "paid_total" varchar NOT NULL,
      "payment_status" "enum_report_orders_payment_status" NOT NULL,
      "order_date" timestamp(3) with time zone NOT NULL,
      "livemode" boolean NOT NULL,
      "stripe_dashboard_url" varchar NOT NULL,
      "stripe_session_id" varchar NOT NULL,
      "stripe_payment_intent_id" varchar,
      "stripe_customer_id" varchar,
      "currency" varchar NOT NULL,
      "amount_total" numeric NOT NULL,
      "amount_tax" numeric NOT NULL,
      "amount_discount" numeric NOT NULL,
      "amount_refunded" numeric NOT NULL,
      "report_ids" jsonb NOT NULL,
      "line_items" jsonb NOT NULL,
      "last_synced_at" timestamp(3) with time zone NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE UNIQUE INDEX "report_orders_stripe_session_id_idx" ON "report_orders" ("stripe_session_id");
    CREATE INDEX "report_orders_order_reference_idx" ON "report_orders" ("order_reference");
    CREATE INDEX "report_orders_buyer_email_idx" ON "report_orders" ("buyer_email");
    CREATE INDEX "report_orders_order_date_idx" ON "report_orders" ("order_date");
    CREATE INDEX "report_orders_stripe_payment_intent_id_idx" ON "report_orders" ("stripe_payment_intent_id");
    CREATE INDEX "report_orders_updated_at_idx" ON "report_orders" ("updated_at");
    CREATE INDEX "report_orders_created_at_idx" ON "report_orders" ("created_at");
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "report_orders_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_report_orders_fk"
      FOREIGN KEY ("report_orders_id") REFERENCES "public"."report_orders"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "payload_locked_documents_rels_report_orders_id_idx" ON "payload_locked_documents_rels" ("report_orders_id");
  `)
  const count = await backfillReportOrders(payload, stripeRequest(), req)
  payload.logger.info(`Imported ${count} verified historical report orders.`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "report_orders_id";
    DROP TABLE "report_orders";
    DROP TYPE "public"."enum_report_orders_payment_status";
  `)
}
