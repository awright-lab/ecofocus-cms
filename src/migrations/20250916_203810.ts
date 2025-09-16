import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_posts_blocks_cta_group_ctas_style" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum_posts_blocks_chart_j_s_chart_type" AS ENUM('bar', 'line', 'area', 'pie', 'donut', 'scatter');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TABLE "authors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"title" varchar,
  	"bio" jsonb,
  	"headshot_id" integer,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "topics" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "datasets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"source_url" varchar,
  	"data" jsonb NOT NULL,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "posts_blocks_paragraph" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_image_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_pull_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar NOT NULL,
  	"attribution" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_key_takeaways_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "posts_blocks_key_takeaways" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_cta_group_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"style" "enum_posts_blocks_cta_group_ctas_style" DEFAULT 'primary'
  );
  
  CREATE TABLE "posts_blocks_cta_group" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_chart_j_s_y_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" varchar NOT NULL
  );
  
  CREATE TABLE "posts_blocks_chart_j_s_color_palette" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"color" varchar NOT NULL
  );
  
  CREATE TABLE "posts_blocks_chart_j_s" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"chart_type" "enum_posts_blocks_chart_j_s_chart_type" DEFAULT 'bar' NOT NULL,
  	"x_field" varchar NOT NULL,
  	"series_label_field" varchar,
  	"data_source_dataset_id" integer,
  	"data_source_inline_data" jsonb,
  	"stacked" boolean DEFAULT false,
  	"legend" boolean DEFAULT true,
  	"unit" varchar,
  	"height" numeric DEFAULT 320,
  	"x_label" varchar,
  	"y_label" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"dek" varchar,
  	"author_id" integer NOT NULL,
  	"published_at" timestamp(3) with time zone,
  	"read_time" numeric,
  	"hero_image_id" integer,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_og_image_id" integer,
  	"status" "enum_posts_status" DEFAULT 'draft' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"topics_id" integer
  );
  
  ALTER TABLE "hero_section" ALTER COLUMN "headline" SET DATA TYPE jsonb;
  ALTER TABLE "users" ADD COLUMN "role" "enum_users_role" DEFAULT 'editor' NOT NULL;
  ALTER TABLE "media" ADD COLUMN "alt_text" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "authors_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "topics_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "datasets_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "authors" ADD CONSTRAINT "authors_headshot_id_media_id_fk" FOREIGN KEY ("headshot_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_paragraph" ADD CONSTRAINT "posts_blocks_paragraph_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_image_block" ADD CONSTRAINT "posts_blocks_image_block_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_image_block" ADD CONSTRAINT "posts_blocks_image_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_pull_quote" ADD CONSTRAINT "posts_blocks_pull_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_key_takeaways_items" ADD CONSTRAINT "posts_blocks_key_takeaways_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_key_takeaways"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_key_takeaways" ADD CONSTRAINT "posts_blocks_key_takeaways_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_cta_group_ctas" ADD CONSTRAINT "posts_blocks_cta_group_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_cta_group"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_cta_group" ADD CONSTRAINT "posts_blocks_cta_group_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_chart_j_s_y_fields" ADD CONSTRAINT "posts_blocks_chart_j_s_y_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_chart_j_s"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_chart_j_s_color_palette" ADD CONSTRAINT "posts_blocks_chart_j_s_color_palette_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_chart_j_s"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_chart_j_s" ADD CONSTRAINT "posts_blocks_chart_j_s_data_source_dataset_id_datasets_id_fk" FOREIGN KEY ("data_source_dataset_id") REFERENCES "public"."datasets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_chart_j_s" ADD CONSTRAINT "posts_blocks_chart_j_s_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "authors_headshot_idx" ON "authors" USING btree ("headshot_id");
  CREATE UNIQUE INDEX "authors_slug_idx" ON "authors" USING btree ("slug");
  CREATE INDEX "authors_updated_at_idx" ON "authors" USING btree ("updated_at");
  CREATE INDEX "authors_created_at_idx" ON "authors" USING btree ("created_at");
  CREATE UNIQUE INDEX "topics_label_idx" ON "topics" USING btree ("label");
  CREATE UNIQUE INDEX "topics_slug_idx" ON "topics" USING btree ("slug");
  CREATE INDEX "topics_updated_at_idx" ON "topics" USING btree ("updated_at");
  CREATE INDEX "topics_created_at_idx" ON "topics" USING btree ("created_at");
  CREATE UNIQUE INDEX "datasets_slug_idx" ON "datasets" USING btree ("slug");
  CREATE INDEX "datasets_updated_at_idx" ON "datasets" USING btree ("updated_at");
  CREATE INDEX "datasets_created_at_idx" ON "datasets" USING btree ("created_at");
  CREATE INDEX "posts_blocks_paragraph_order_idx" ON "posts_blocks_paragraph" USING btree ("_order");
  CREATE INDEX "posts_blocks_paragraph_parent_id_idx" ON "posts_blocks_paragraph" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_paragraph_path_idx" ON "posts_blocks_paragraph" USING btree ("_path");
  CREATE INDEX "posts_blocks_image_block_order_idx" ON "posts_blocks_image_block" USING btree ("_order");
  CREATE INDEX "posts_blocks_image_block_parent_id_idx" ON "posts_blocks_image_block" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_image_block_path_idx" ON "posts_blocks_image_block" USING btree ("_path");
  CREATE INDEX "posts_blocks_image_block_image_idx" ON "posts_blocks_image_block" USING btree ("image_id");
  CREATE INDEX "posts_blocks_pull_quote_order_idx" ON "posts_blocks_pull_quote" USING btree ("_order");
  CREATE INDEX "posts_blocks_pull_quote_parent_id_idx" ON "posts_blocks_pull_quote" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_pull_quote_path_idx" ON "posts_blocks_pull_quote" USING btree ("_path");
  CREATE INDEX "posts_blocks_key_takeaways_items_order_idx" ON "posts_blocks_key_takeaways_items" USING btree ("_order");
  CREATE INDEX "posts_blocks_key_takeaways_items_parent_id_idx" ON "posts_blocks_key_takeaways_items" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_key_takeaways_order_idx" ON "posts_blocks_key_takeaways" USING btree ("_order");
  CREATE INDEX "posts_blocks_key_takeaways_parent_id_idx" ON "posts_blocks_key_takeaways" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_key_takeaways_path_idx" ON "posts_blocks_key_takeaways" USING btree ("_path");
  CREATE INDEX "posts_blocks_cta_group_ctas_order_idx" ON "posts_blocks_cta_group_ctas" USING btree ("_order");
  CREATE INDEX "posts_blocks_cta_group_ctas_parent_id_idx" ON "posts_blocks_cta_group_ctas" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_cta_group_order_idx" ON "posts_blocks_cta_group" USING btree ("_order");
  CREATE INDEX "posts_blocks_cta_group_parent_id_idx" ON "posts_blocks_cta_group" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_cta_group_path_idx" ON "posts_blocks_cta_group" USING btree ("_path");
  CREATE INDEX "posts_blocks_chart_j_s_y_fields_order_idx" ON "posts_blocks_chart_j_s_y_fields" USING btree ("_order");
  CREATE INDEX "posts_blocks_chart_j_s_y_fields_parent_id_idx" ON "posts_blocks_chart_j_s_y_fields" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_chart_j_s_color_palette_order_idx" ON "posts_blocks_chart_j_s_color_palette" USING btree ("_order");
  CREATE INDEX "posts_blocks_chart_j_s_color_palette_parent_id_idx" ON "posts_blocks_chart_j_s_color_palette" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_chart_j_s_order_idx" ON "posts_blocks_chart_j_s" USING btree ("_order");
  CREATE INDEX "posts_blocks_chart_j_s_parent_id_idx" ON "posts_blocks_chart_j_s" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_chart_j_s_path_idx" ON "posts_blocks_chart_j_s" USING btree ("_path");
  CREATE INDEX "posts_blocks_chart_j_s_data_source_data_source_dataset_idx" ON "posts_blocks_chart_j_s" USING btree ("data_source_dataset_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_author_idx" ON "posts" USING btree ("author_id");
  CREATE INDEX "posts_hero_image_idx" ON "posts" USING btree ("hero_image_id");
  CREATE INDEX "posts_seo_seo_og_image_idx" ON "posts" USING btree ("seo_og_image_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_topics_id_idx" ON "posts_rels" USING btree ("topics_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_datasets_fk" FOREIGN KEY ("datasets_id") REFERENCES "public"."datasets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_authors_id_idx" ON "payload_locked_documents_rels" USING btree ("authors_id");
  CREATE INDEX "payload_locked_documents_rels_topics_id_idx" ON "payload_locked_documents_rels" USING btree ("topics_id");
  CREATE INDEX "payload_locked_documents_rels_datasets_id_idx" ON "payload_locked_documents_rels" USING btree ("datasets_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "authors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "topics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "datasets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_paragraph" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_image_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_pull_quote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_key_takeaways_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_key_takeaways" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_cta_group_ctas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_cta_group" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_chart_j_s_y_fields" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_chart_j_s_color_palette" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_chart_j_s" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "authors" CASCADE;
  DROP TABLE "topics" CASCADE;
  DROP TABLE "datasets" CASCADE;
  DROP TABLE "posts_blocks_paragraph" CASCADE;
  DROP TABLE "posts_blocks_image_block" CASCADE;
  DROP TABLE "posts_blocks_pull_quote" CASCADE;
  DROP TABLE "posts_blocks_key_takeaways_items" CASCADE;
  DROP TABLE "posts_blocks_key_takeaways" CASCADE;
  DROP TABLE "posts_blocks_cta_group_ctas" CASCADE;
  DROP TABLE "posts_blocks_cta_group" CASCADE;
  DROP TABLE "posts_blocks_chart_j_s_y_fields" CASCADE;
  DROP TABLE "posts_blocks_chart_j_s_color_palette" CASCADE;
  DROP TABLE "posts_blocks_chart_j_s" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_authors_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_topics_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_datasets_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_posts_fk";
  
  DROP INDEX "payload_locked_documents_rels_authors_id_idx";
  DROP INDEX "payload_locked_documents_rels_topics_id_idx";
  DROP INDEX "payload_locked_documents_rels_datasets_id_idx";
  DROP INDEX "payload_locked_documents_rels_posts_id_idx";
  ALTER TABLE "hero_section" ALTER COLUMN "headline" SET DATA TYPE varchar;
  ALTER TABLE "users" DROP COLUMN "role";
  ALTER TABLE "media" DROP COLUMN "alt_text";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "authors_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "topics_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "datasets_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "posts_id";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_posts_blocks_cta_group_ctas_style";
  DROP TYPE "public"."enum_posts_blocks_chart_j_s_chart_type";
  DROP TYPE "public"."enum_posts_status";`)
}
