import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Scoped to the storefront; prior hand-written CMS migrations are preserved.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
CREATE TYPE "public"."enum_reports_type" AS ENUM('report', 'brief', 'dataset');
CREATE TYPE "public"."enum_reports_access" AS ENUM('Free', 'Premium');
CREATE TYPE "public"."enum_reports_status" AS ENUM('draft', 'published');
CREATE TYPE "public"."enum__reports_v_version_type" AS ENUM('report', 'brief', 'dataset');
CREATE TYPE "public"."enum__reports_v_version_access" AS ENUM('Free', 'Premium');
CREATE TYPE "public"."enum__reports_v_version_status" AS ENUM('draft', 'published');
CREATE TABLE "reports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"subtitle" varchar,
  	"description" varchar,
  	"body" varchar,
  	"year" numeric,
  	"type" "enum_reports_type" DEFAULT 'report',
  	"topic" varchar,
  	"wave" varchar,
  	"pages" numeric,
  	"format" varchar DEFAULT 'PDF',
  	"cover_id" integer,
  	"access" "enum_reports_access" DEFAULT 'Premium',
  	"price" numeric DEFAULT 0,
  	"download_file_id" integer,
  	"free_href" varchar,
  	"sample_href" varchar,
  	"stripe_product_id" varchar,
  	"price_id" varchar,
  	"stripe_synced_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_reports_status" DEFAULT 'draft'
  );
CREATE TABLE "reports_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
CREATE TABLE "_reports_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_subtitle" varchar,
  	"version_description" varchar,
  	"version_body" varchar,
  	"version_year" numeric,
  	"version_type" "enum__reports_v_version_type" DEFAULT 'report',
  	"version_topic" varchar,
  	"version_wave" varchar,
  	"version_pages" numeric,
  	"version_format" varchar DEFAULT 'PDF',
  	"version_cover_id" integer,
  	"version_access" "enum__reports_v_version_access" DEFAULT 'Premium',
  	"version_price" numeric DEFAULT 0,
  	"version_download_file_id" integer,
  	"version_free_href" varchar,
  	"version_sample_href" varchar,
  	"version_stripe_product_id" varchar,
  	"version_price_id" varchar,
  	"version_stripe_synced_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__reports_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
CREATE TABLE "_reports_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
CREATE TABLE "report_files" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
ALTER TABLE "users" ADD COLUMN "enable_a_p_i_key" boolean;
ALTER TABLE "users" ADD COLUMN "api_key" varchar;
ALTER TABLE "users" ADD COLUMN "api_key_index" varchar;
ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "reports_id" integer;
ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "report_files_id" integer;
ALTER TABLE "reports" ADD CONSTRAINT "reports_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "reports" ADD CONSTRAINT "reports_download_file_id_report_files_id_fk" FOREIGN KEY ("download_file_id") REFERENCES "public"."report_files"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "reports_texts" ADD CONSTRAINT "reports_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_reports_v" ADD CONSTRAINT "_reports_v_parent_id_reports_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reports"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_reports_v" ADD CONSTRAINT "_reports_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_reports_v" ADD CONSTRAINT "_reports_v_version_download_file_id_report_files_id_fk" FOREIGN KEY ("version_download_file_id") REFERENCES "public"."report_files"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_reports_v_texts" ADD CONSTRAINT "_reports_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_reports_v"("id") ON DELETE cascade ON UPDATE no action;
CREATE UNIQUE INDEX "reports_slug_idx" ON "reports" USING btree ("slug");
CREATE INDEX "reports_cover_idx" ON "reports" USING btree ("cover_id");
CREATE INDEX "reports_download_file_idx" ON "reports" USING btree ("download_file_id");
CREATE INDEX "reports_updated_at_idx" ON "reports" USING btree ("updated_at");
CREATE INDEX "reports_created_at_idx" ON "reports" USING btree ("created_at");
CREATE INDEX "reports__status_idx" ON "reports" USING btree ("_status");
CREATE INDEX "reports_texts_order_parent_idx" ON "reports_texts" USING btree ("order","parent_id");
CREATE INDEX "_reports_v_parent_idx" ON "_reports_v" USING btree ("parent_id");
CREATE INDEX "_reports_v_version_version_slug_idx" ON "_reports_v" USING btree ("version_slug");
CREATE INDEX "_reports_v_version_version_cover_idx" ON "_reports_v" USING btree ("version_cover_id");
CREATE INDEX "_reports_v_version_version_download_file_idx" ON "_reports_v" USING btree ("version_download_file_id");
CREATE INDEX "_reports_v_version_version_updated_at_idx" ON "_reports_v" USING btree ("version_updated_at");
CREATE INDEX "_reports_v_version_version_created_at_idx" ON "_reports_v" USING btree ("version_created_at");
CREATE INDEX "_reports_v_version_version__status_idx" ON "_reports_v" USING btree ("version__status");
CREATE INDEX "_reports_v_created_at_idx" ON "_reports_v" USING btree ("created_at");
CREATE INDEX "_reports_v_updated_at_idx" ON "_reports_v" USING btree ("updated_at");
CREATE INDEX "_reports_v_latest_idx" ON "_reports_v" USING btree ("latest");
CREATE INDEX "_reports_v_texts_order_parent_idx" ON "_reports_v_texts" USING btree ("order","parent_id");
CREATE INDEX "report_files_updated_at_idx" ON "report_files" USING btree ("updated_at");
CREATE INDEX "report_files_created_at_idx" ON "report_files" USING btree ("created_at");
CREATE UNIQUE INDEX "report_files_filename_idx" ON "report_files" USING btree ("filename");
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reports_fk" FOREIGN KEY ("reports_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_report_files_fk" FOREIGN KEY ("report_files_id") REFERENCES "public"."report_files"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "payload_locked_documents_rels_reports_id_idx" ON "payload_locked_documents_rels" USING btree ("reports_id");
CREATE INDEX "payload_locked_documents_rels_report_files_id_idx" ON "payload_locked_documents_rels" USING btree ("report_files_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "reports_id";
ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "report_files_id";
DROP TABLE "_reports_v_texts", "reports_texts", "_reports_v", "reports", "report_files" CASCADE;
ALTER TABLE "users" DROP COLUMN "enable_a_p_i_key", DROP COLUMN "api_key", DROP COLUMN "api_key_index";
DROP TYPE "enum_reports_type", "enum_reports_access", "enum_reports_status", "enum__reports_v_version_type", "enum__reports_v_version_access", "enum__reports_v_version_status";
  `)
}
