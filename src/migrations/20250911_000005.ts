import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Ensure posts_rels has an auto-incrementing primary key `id`
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Add id column if missing
    ALTER TABLE "posts_rels" ADD COLUMN IF NOT EXISTS "id" integer;

    -- Create sequence if missing
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'posts_rels_id_seq') THEN
        CREATE SEQUENCE posts_rels_id_seq OWNED BY posts_rels.id;
      END IF;
    END $$;

    -- Set default from sequence
    ALTER TABLE "posts_rels" ALTER COLUMN "id" SET DEFAULT nextval('posts_rels_id_seq');

    -- Backfill null ids
    UPDATE "posts_rels" SET "id" = nextval('posts_rels_id_seq') WHERE "id" IS NULL;

    -- Add PK if missing
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conrelid = 'posts_rels'::regclass AND contype = 'p'
      ) THEN
        ALTER TABLE "posts_rels" ADD PRIMARY KEY ("id");
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Drop primary key if exists
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conrelid = 'posts_rels'::regclass AND contype = 'p'
      ) THEN
        ALTER TABLE "posts_rels" DROP CONSTRAINT (SELECT conname FROM pg_constraint WHERE conrelid = 'posts_rels'::regclass AND contype = 'p' LIMIT 1);
      END IF;
    END $$;

    -- Remove default and column
    ALTER TABLE "posts_rels" ALTER COLUMN "id" DROP DEFAULT;
    ALTER TABLE "posts_rels" DROP COLUMN IF EXISTS "id";

    -- Drop sequence if exists
    DROP SEQUENCE IF EXISTS posts_rels_id_seq;
  `)
}

