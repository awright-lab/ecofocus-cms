import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum__posts_v_blocks_cta_group_ctas_style" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum__posts_v_blocks_chart_j_s_chart_type" AS ENUM('bar', 'line', 'area', 'pie', 'doughnut', 'scatter');
  CREATE TYPE "public"."enum__posts_v_blocks_chart_j_s_orientation" AS ENUM('column', 'row');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TABLE "_posts_v_blocks_paragraph" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "content" jsonb,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_posts_v_blocks_image_block" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "image_id" integer,
    "caption" varchar,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_posts_v_blocks_pull_quote" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "quote" varchar,
    "attribution" varchar,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_posts_v_blocks_key_takeaways_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "text" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_posts_v_blocks_key_takeaways" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_posts_v_blocks_cta_group_ctas" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "href" varchar,
    "style" "enum__posts_v_blocks_cta_group_ctas_style" DEFAULT 'primary',
    "_uuid" varchar
  );

  CREATE TABLE "_posts_v_blocks_cta_group" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_posts_v_blocks_chart_j_s_y_fields" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "field" varchar,
    "label" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_posts_v_blocks_chart_j_s_color_palette" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "color" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_posts_v_blocks_chart_j_s" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "chart_type" "enum__posts_v_blocks_chart_j_s_chart_type" DEFAULT 'bar',
    "orientation" "enum__posts_v_blocks_chart_j_s_orientation" DEFAULT 'column',
    "x_field" varchar,
    "series_label_field" varchar,
    "data_source_dataset_id" integer,
    "data_source_inline_data" jsonb,
    "stacked" boolean DEFAULT false,
    "legend" boolean DEFAULT true,
    "unit" varchar,
    "height" numeric DEFAULT 320,
    "grid_show_x" boolean DEFAULT true,
    "grid_show_y" boolean DEFAULT true,
    "grid_draw_border" boolean DEFAULT false,
    "grid_dim" boolean DEFAULT true,
    "grid_color" varchar,
    "bar_radius" numeric DEFAULT 8,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_posts_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_title" varchar,
    "version_slug" varchar,
    "version_dek" varchar,
    "version_author_id" integer,
    "version_published_at" timestamp(3) with time zone,
    "version_read_time" numeric,
    "version_hero_image_id" integer,
    "version_seo_meta_title" varchar,
    "version_seo_meta_description" varchar,
    "version_seo_og_image_id" integer,
    "version_status" "enum__posts_v_version_status" DEFAULT 'draft',
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__posts_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "latest" boolean
  );

  CREATE TABLE "_posts_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "topics_id" integer
  );

  CREATE TABLE "payload_jobs_log" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "executed_at" timestamp(3) with time zone NOT NULL,
    "completed_at" timestamp(3) with time zone NOT NULL,
    "task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
    "task_i_d" varchar NOT NULL,
    "input" jsonb,
    "output" jsonb,
    "state" "enum_payload_jobs_log_state" NOT NULL,
    "error" jsonb
  );

  CREATE TABLE "payload_jobs" (
    "id" serial PRIMARY KEY NOT NULL,
    "input" jsonb,
    "completed_at" timestamp(3) with time zone,
    "total_tried" numeric DEFAULT 0,
    "has_error" boolean DEFAULT false,
    "error" jsonb,
    "task_slug" "enum_payload_jobs_task_slug",
    "queue" varchar DEFAULT 'default',
    "wait_until" timestamp(3) with time zone,
    "processing" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "posts_blocks_paragraph" ALTER COLUMN "content" DROP NOT NULL;
  ALTER TABLE "posts_blocks_image_block" ALTER COLUMN "image_id" DROP NOT NULL;
  ALTER TABLE "posts_blocks_pull_quote" ALTER COLUMN "quote" DROP NOT NULL;
  ALTER TABLE "posts_blocks_key_takeaways_items" ALTER COLUMN "text" DROP NOT NULL;
  ALTER TABLE "posts_blocks_cta_group_ctas" ALTER COLUMN "label" DROP NOT NULL;
  ALTER TABLE "posts_blocks_cta_group_ctas" ALTER COLUMN "href" DROP NOT NULL;
  ALTER TABLE "posts_blocks_chart_j_s_y_fields" ALTER COLUMN "field" DROP NOT NULL;
  ALTER TABLE "posts_blocks_chart_j_s_color_palette" ALTER COLUMN "color" DROP NOT NULL;
  ALTER TABLE "posts_blocks_chart_j_s" ALTER COLUMN "chart_type" DROP NOT NULL;
  ALTER TABLE "posts_blocks_chart_j_s" ALTER COLUMN "x_field" DROP NOT NULL;
  ALTER TABLE "posts" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "posts" ALTER COLUMN "author_id" DROP NOT NULL;
  ALTER TABLE "posts" ALTER COLUMN "status" DROP NOT NULL;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  ALTER TABLE "posts" ADD COLUMN "_status" "enum_posts_status" DEFAULT 'draft';
  UPDATE "posts" SET "_status" = 'published' WHERE "status" = 'published';
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "payload_jobs_id" integer;
  ALTER TABLE "_posts_v_blocks_paragraph" ADD CONSTRAINT "_posts_v_blocks_paragraph_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_image_block" ADD CONSTRAINT "_posts_v_blocks_image_block_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_image_block" ADD CONSTRAINT "_posts_v_blocks_image_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_pull_quote" ADD CONSTRAINT "_posts_v_blocks_pull_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_key_takeaways_items" ADD CONSTRAINT "_posts_v_blocks_key_takeaways_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_key_takeaways"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_key_takeaways" ADD CONSTRAINT "_posts_v_blocks_key_takeaways_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_cta_group_ctas" ADD CONSTRAINT "_posts_v_blocks_cta_group_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_cta_group"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_cta_group" ADD CONSTRAINT "_posts_v_blocks_cta_group_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_chart_j_s_y_fields" ADD CONSTRAINT "_posts_v_blocks_chart_j_s_y_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_chart_j_s"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_chart_j_s_color_palette" ADD CONSTRAINT "_posts_v_blocks_chart_j_s_color_palette_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_chart_j_s"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_chart_j_s" ADD CONSTRAINT "_posts_v_blocks_chart_j_s_data_source_dataset_id_datasets_id_fk" FOREIGN KEY ("data_source_dataset_id") REFERENCES "public"."datasets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_chart_j_s" ADD CONSTRAINT "_posts_v_blocks_chart_j_s_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_author_id_authors_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "_posts_v_blocks_paragraph_order_idx" ON "_posts_v_blocks_paragraph" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_paragraph_parent_id_idx" ON "_posts_v_blocks_paragraph" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_paragraph_path_idx" ON "_posts_v_blocks_paragraph" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_image_block_order_idx" ON "_posts_v_blocks_image_block" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_image_block_parent_id_idx" ON "_posts_v_blocks_image_block" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_image_block_path_idx" ON "_posts_v_blocks_image_block" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_image_block_image_idx" ON "_posts_v_blocks_image_block" USING btree ("image_id");
  CREATE INDEX "_posts_v_blocks_pull_quote_order_idx" ON "_posts_v_blocks_pull_quote" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_pull_quote_parent_id_idx" ON "_posts_v_blocks_pull_quote" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_pull_quote_path_idx" ON "_posts_v_blocks_pull_quote" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_key_takeaways_items_order_idx" ON "_posts_v_blocks_key_takeaways_items" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_key_takeaways_items_parent_id_idx" ON "_posts_v_blocks_key_takeaways_items" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_key_takeaways_order_idx" ON "_posts_v_blocks_key_takeaways" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_key_takeaways_parent_id_idx" ON "_posts_v_blocks_key_takeaways" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_key_takeaways_path_idx" ON "_posts_v_blocks_key_takeaways" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_cta_group_ctas_order_idx" ON "_posts_v_blocks_cta_group_ctas" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_cta_group_ctas_parent_id_idx" ON "_posts_v_blocks_cta_group_ctas" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_cta_group_order_idx" ON "_posts_v_blocks_cta_group" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_cta_group_parent_id_idx" ON "_posts_v_blocks_cta_group" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_cta_group_path_idx" ON "_posts_v_blocks_cta_group" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_chart_j_s_y_fields_order_idx" ON "_posts_v_blocks_chart_j_s_y_fields" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_chart_j_s_y_fields_parent_id_idx" ON "_posts_v_blocks_chart_j_s_y_fields" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_chart_j_s_color_palette_order_idx" ON "_posts_v_blocks_chart_j_s_color_palette" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_chart_j_s_color_palette_parent_id_idx" ON "_posts_v_blocks_chart_j_s_color_palette" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_chart_j_s_order_idx" ON "_posts_v_blocks_chart_j_s" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_chart_j_s_parent_id_idx" ON "_posts_v_blocks_chart_j_s" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_chart_j_s_path_idx" ON "_posts_v_blocks_chart_j_s" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_chart_j_s_data_source_data_source_dataset_idx" ON "_posts_v_blocks_chart_j_s" USING btree ("data_source_dataset_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_author_idx" ON "_posts_v" USING btree ("version_author_id");
  CREATE INDEX "_posts_v_version_version_hero_image_idx" ON "_posts_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_posts_v_version_seo_version_seo_og_image_idx" ON "_posts_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_topics_id_idx" ON "_posts_v_rels" USING btree ("topics_id");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_jobs_fk" FOREIGN KEY ("payload_jobs_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "payload_locked_documents_rels_payload_jobs_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_jobs_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "_posts_v_blocks_paragraph" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_image_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_pull_quote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_key_takeaways_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_key_takeaways" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_cta_group_ctas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_cta_group" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_chart_j_s_y_fields" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_chart_j_s_color_palette" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_chart_j_s" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs_log" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_posts_v_blocks_paragraph" CASCADE;
  DROP TABLE "_posts_v_blocks_image_block" CASCADE;
  DROP TABLE "_posts_v_blocks_pull_quote" CASCADE;
  DROP TABLE "_posts_v_blocks_key_takeaways_items" CASCADE;
  DROP TABLE "_posts_v_blocks_key_takeaways" CASCADE;
  DROP TABLE "_posts_v_blocks_cta_group_ctas" CASCADE;
  DROP TABLE "_posts_v_blocks_cta_group" CASCADE;
  DROP TABLE "_posts_v_blocks_chart_j_s_y_fields" CASCADE;
  DROP TABLE "_posts_v_blocks_chart_j_s_color_palette" CASCADE;
  DROP TABLE "_posts_v_blocks_chart_j_s" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_payload_jobs_fk";
  DROP TABLE "payload_jobs" CASCADE;

  DROP INDEX "posts__status_idx";
  DROP INDEX "payload_locked_documents_rels_payload_jobs_id_idx";
  ALTER TABLE "posts_blocks_paragraph" ALTER COLUMN "content" SET NOT NULL;
  ALTER TABLE "posts_blocks_image_block" ALTER COLUMN "image_id" SET NOT NULL;
  ALTER TABLE "posts_blocks_pull_quote" ALTER COLUMN "quote" SET NOT NULL;
  ALTER TABLE "posts_blocks_key_takeaways_items" ALTER COLUMN "text" SET NOT NULL;
  ALTER TABLE "posts_blocks_cta_group_ctas" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "posts_blocks_cta_group_ctas" ALTER COLUMN "href" SET NOT NULL;
  ALTER TABLE "posts_blocks_chart_j_s_y_fields" ALTER COLUMN "field" SET NOT NULL;
  ALTER TABLE "posts_blocks_chart_j_s_color_palette" ALTER COLUMN "color" SET NOT NULL;
  ALTER TABLE "posts_blocks_chart_j_s" ALTER COLUMN "chart_type" SET NOT NULL;
  ALTER TABLE "posts_blocks_chart_j_s" ALTER COLUMN "x_field" SET NOT NULL;
  ALTER TABLE "posts" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "posts" ALTER COLUMN "author_id" SET NOT NULL;
  ALTER TABLE "posts" ALTER COLUMN "status" SET NOT NULL;
  ALTER TABLE "posts" DROP COLUMN "_status";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "payload_jobs_id";
  DROP TYPE "public"."enum__posts_v_blocks_cta_group_ctas_style";
  DROP TYPE "public"."enum__posts_v_blocks_chart_j_s_chart_type";
  DROP TYPE "public"."enum__posts_v_blocks_chart_j_s_orientation";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`)
}
