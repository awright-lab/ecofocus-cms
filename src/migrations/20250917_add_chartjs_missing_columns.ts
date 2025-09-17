import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

// Adds missing columns for ChartJS block + yFields.label
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  // 1) Add 'label' to yFields sub-table (if not exists)
  await payload.db.drizzle.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'posts_blocks_chart_j_s_y_fields'
          AND column_name = 'label'
      ) THEN
        ALTER TABLE "posts_blocks_chart_j_s_y_fields"
          ADD COLUMN "label" text;
      END IF;
    END$$;
  `)

  // 2) Ensure enum has 'doughnut' value (Chart.js spelling)
  await payload.db.drizzle.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'enum_posts_blocks_chart_j_s_chart_type'
          AND e.enumlabel = 'doughnut'
      ) THEN
        ALTER TYPE "enum_posts_blocks_chart_j_s_chart_type" ADD VALUE 'doughnut';
      END IF;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END$$;
  `)

  // 3) Add missing columns on posts_blocks_chart_j_s (orientation, grid*, bar_radius)
  await payload.db.drizzle.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'posts_blocks_chart_j_s' AND column_name = 'orientation'
      ) THEN
        ALTER TABLE "posts_blocks_chart_j_s" ADD COLUMN "orientation" varchar DEFAULT 'column';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'posts_blocks_chart_j_s' AND column_name = 'grid_show_x'
      ) THEN
        ALTER TABLE "posts_blocks_chart_j_s" ADD COLUMN "grid_show_x" boolean DEFAULT true;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'posts_blocks_chart_j_s' AND column_name = 'grid_show_y'
      ) THEN
        ALTER TABLE "posts_blocks_chart_j_s" ADD COLUMN "grid_show_y" boolean DEFAULT true;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'posts_blocks_chart_j_s' AND column_name = 'grid_draw_border'
      ) THEN
        ALTER TABLE "posts_blocks_chart_j_s" ADD COLUMN "grid_draw_border" boolean DEFAULT false;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'posts_blocks_chart_j_s' AND column_name = 'grid_dim'
      ) THEN
        ALTER TABLE "posts_blocks_chart_j_s" ADD COLUMN "grid_dim" boolean DEFAULT true;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'posts_blocks_chart_j_s' AND column_name = 'grid_color'
      ) THEN
        ALTER TABLE "posts_blocks_chart_j_s" ADD COLUMN "grid_color" varchar;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'posts_blocks_chart_j_s' AND column_name = 'bar_radius'
      ) THEN
        ALTER TABLE "posts_blocks_chart_j_s" ADD COLUMN "bar_radius" numeric DEFAULT 8;
      END IF;
    END$$;
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  // Safe best-effort drops for the columns added above
  await payload.db.drizzle.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'posts_blocks_chart_j_s_y_fields' AND column_name = 'label'
      ) THEN
        ALTER TABLE "posts_blocks_chart_j_s_y_fields" DROP COLUMN "label";
      END IF;
    END$$;
  `)

  await payload.db.drizzle.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts_blocks_chart_j_s' AND column_name = 'orientation') THEN
        ALTER TABLE "posts_blocks_chart_j_s" DROP COLUMN "orientation";
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts_blocks_chart_j_s' AND column_name = 'grid_show_x') THEN
        ALTER TABLE "posts_blocks_chart_j_s" DROP COLUMN "grid_show_x";
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts_blocks_chart_j_s' AND column_name = 'grid_show_y') THEN
        ALTER TABLE "posts_blocks_chart_j_s" DROP COLUMN "grid_show_y";
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts_blocks_chart_j_s' AND column_name = 'grid_draw_border') THEN
        ALTER TABLE "posts_blocks_chart_j_s" DROP COLUMN "grid_draw_border";
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts_blocks_chart_j_s' AND column_name = 'grid_dim') THEN
        ALTER TABLE "posts_blocks_chart_j_s" DROP COLUMN "grid_dim";
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts_blocks_chart_j_s' AND column_name = 'grid_color') THEN
        ALTER TABLE "posts_blocks_chart_j_s" DROP COLUMN "grid_color";
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts_blocks_chart_j_s' AND column_name = 'bar_radius') THEN
        ALTER TABLE "posts_blocks_chart_j_s" DROP COLUMN "bar_radius";
      END IF;
    END$$;
  `)

  // Note: We do not attempt to remove the added enum value 'doughnut'. Reverting enum values is non-trivial and unnecessary.
}
