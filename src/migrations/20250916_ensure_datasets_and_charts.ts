import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  // 1) Enum for chart types (safe if it already exists)
  await payload.db.drizzle.execute(sql`
    DO $$
    BEGIN
      CREATE TYPE "enum_posts_blocks_chart_j_s_chart_type" AS ENUM ('bar','line','area','pie','donut','scatter');
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END$$;
  `)

  // 2) datasets table
  await payload.db.drizzle.execute(sql`
    CREATE TABLE IF NOT EXISTS "datasets" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "slug" varchar,
      "source_url" varchar,
      "data" jsonb NOT NULL,
      "notes" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
  `)
  await payload.db.drizzle.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "datasets_slug_idx" ON "datasets" ("slug");`)
  await payload.db.drizzle.execute(sql`CREATE INDEX IF NOT EXISTS "datasets_updated_at_idx" ON "datasets" ("updated_at");`)
  await payload.db.drizzle.execute(sql`CREATE INDEX IF NOT EXISTS "datasets_created_at_idx" ON "datasets" ("created_at");`)

  // 3) posts_blocks_chart_j_s (the ChartJS block rows)
  await payload.db.drizzle.execute(sql`
    CREATE TABLE IF NOT EXISTS "posts_blocks_chart_j_s" (
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
  `)

  // indexes
  await payload.db.drizzle.execute(sql`CREATE INDEX IF NOT EXISTS "posts_blocks_chart_j_s_order_idx" ON "posts_blocks_chart_j_s" ("_order");`)
  await payload.db.drizzle.execute(sql`CREATE INDEX IF NOT EXISTS "posts_blocks_chart_j_s_parent_id_idx" ON "posts_blocks_chart_j_s" ("_parent_id");`)
  await payload.db.drizzle.execute(sql`CREATE INDEX IF NOT EXISTS "posts_blocks_chart_j_s_path_idx" ON "posts_blocks_chart_j_s" ("_path");`)
  await payload.db.drizzle.execute(sql`CREATE INDEX IF NOT EXISTS "posts_blocks_chart_j_s_data_source_dataset_idx" ON "posts_blocks_chart_j_s" ("data_source_dataset_id");`)

  // FKs (wrapped to avoid failing if they already exist)
  await payload.db.drizzle.execute(sql`
    DO $$
    BEGIN
      ALTER TABLE "posts_blocks_chart_j_s"
        ADD CONSTRAINT "posts_blocks_chart_j_s_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END$$;
  `)
  await payload.db.drizzle.execute(sql`
    DO $$
    BEGIN
      ALTER TABLE "posts_blocks_chart_j_s"
        ADD CONSTRAINT "posts_blocks_chart_j_s_data_source_dataset_id_datasets_id_fk"
        FOREIGN KEY ("data_source_dataset_id") REFERENCES "public"."datasets"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END$$;
  `)

  // 4) yFields sub-table
  await payload.db.drizzle.execute(sql`
    CREATE TABLE IF NOT EXISTS "posts_blocks_chart_j_s_y_fields" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "field" varchar NOT NULL
    );
  `)
  await payload.db.drizzle.execute(sql`CREATE INDEX IF NOT EXISTS "posts_blocks_chart_j_s_y_fields_order_idx" ON "posts_blocks_chart_j_s_y_fields" ("_order");`)
  await payload.db.drizzle.execute(sql`CREATE INDEX IF NOT EXISTS "posts_blocks_chart_j_s_y_fields_parent_id_idx" ON "posts_blocks_chart_j_s_y_fields" ("_parent_id");`)
  await payload.db.drizzle.execute(sql`
    DO $$
    BEGIN
      ALTER TABLE "posts_blocks_chart_j_s_y_fields"
        ADD CONSTRAINT "posts_blocks_chart_j_s_y_fields_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_chart_j_s"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END$$;
  `)

  // 5) colorPalette sub-table
  await payload.db.drizzle.execute(sql`
    CREATE TABLE IF NOT EXISTS "posts_blocks_chart_j_s_color_palette" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "color" varchar NOT NULL
    );
  `)
  await payload.db.drizzle.execute(sql`CREATE INDEX IF NOT EXISTS "posts_blocks_chart_j_s_color_palette_order_idx" ON "posts_blocks_chart_j_s_color_palette" ("_order");`)
  await payload.db.drizzle.execute(sql`CREATE INDEX IF NOT EXISTS "posts_blocks_chart_j_s_color_palette_parent_id_idx" ON "posts_blocks_chart_j_s_color_palette" ("_parent_id");`)
  await payload.db.drizzle.execute(sql`
    DO $$
    BEGIN
      ALTER TABLE "posts_blocks_chart_j_s_color_palette"
        ADD CONSTRAINT "posts_blocks_chart_j_s_color_palette_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_chart_j_s"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END$$;
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  // Drop in reverse order (guarded)
  await payload.db.drizzle.execute(sql`DROP TABLE IF EXISTS "posts_blocks_chart_j_s_color_palette";`)
  await payload.db.drizzle.execute(sql`DROP TABLE IF EXISTS "posts_blocks_chart_j_s_y_fields";`)
  await payload.db.drizzle.execute(sql`DROP TABLE IF EXISTS "posts_blocks_chart_j_s";`)
  // Keeping datasets since you likely want to keep data; drop only if you truly need to revert:
  // await payload.db.drizzle.execute(sql`DROP TABLE IF EXISTS "datasets";`)
  // Enum cannot use IF EXISTS directly; wrap:
  await payload.db.drizzle.execute(sql`
    DO $$
    BEGIN
      DROP TYPE IF EXISTS "enum_posts_blocks_chart_j_s_chart_type";
    EXCEPTION WHEN undefined_object THEN NULL;
    END$$;
  `)
}
