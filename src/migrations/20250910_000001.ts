import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Adds blog schema: authors, topics, posts, join table, and media.alt_text
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  -- Authors
  CREATE TABLE IF NOT EXISTS "authors" (
    "id" serial PRIMARY KEY NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "name" varchar NOT NULL,
    "title" varchar,
    "bio" jsonb,
    "headshot_id" integer,
    "slug" varchar
  );

  -- Topics
  CREATE TABLE IF NOT EXISTS "topics" (
    "id" serial PRIMARY KEY NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "label" varchar NOT NULL,
    "slug" varchar
  );

  -- Posts
  CREATE TABLE IF NOT EXISTS "posts" (
    "id" serial PRIMARY KEY NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "title" varchar NOT NULL,
    "slug" varchar,
    "dek" varchar,
    "author_id" integer NOT NULL,
    "published_at" timestamp(3) with time zone,
    "read_time" numeric,
    "hero_image_id" integer,
    "body" jsonb,
    "seo_meta_title" varchar,
    "seo_meta_description" varchar,
    "seo_og_image_id" integer,
    "status" varchar NOT NULL
  );

  -- Posts <-> Topics (hasMany relationship)
  CREATE TABLE IF NOT EXISTS "posts_topics" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "topic_id" integer
  );

  -- Add alt_text to media for aliasing
  DO $$
  BEGIN
    BEGIN
      ALTER TABLE "media" ADD COLUMN "alt_text" varchar;
    EXCEPTION WHEN duplicate_column THEN
      -- ignore if it already exists
      NULL;
    END;
  END $$;

  -- Foreign keys
  ALTER TABLE "authors" ADD CONSTRAINT IF NOT EXISTS "authors_headshot_id_media_id_fk"
    FOREIGN KEY ("headshot_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

  ALTER TABLE "posts" ADD CONSTRAINT IF NOT EXISTS "posts_author_id_authors_id_fk"
    FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE restrict ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT IF NOT EXISTS "posts_hero_image_id_media_id_fk"
    FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT IF NOT EXISTS "posts_seo_og_image_id_media_id_fk"
    FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

  ALTER TABLE "posts_topics" ADD CONSTRAINT IF NOT EXISTS "posts_topics_parent_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_topics" ADD CONSTRAINT IF NOT EXISTS "posts_topics_topic_fk"
    FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;

  -- Indexes & constraints
  CREATE INDEX IF NOT EXISTS "authors_updated_at_idx" ON "authors" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "authors_created_at_idx" ON "authors" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "authors_slug_idx" ON "authors" USING btree ("slug");

  CREATE INDEX IF NOT EXISTS "topics_updated_at_idx" ON "topics" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "topics_created_at_idx" ON "topics" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "topics_label_idx" ON "topics" USING btree ("label");
  CREATE UNIQUE INDEX IF NOT EXISTS "topics_slug_idx" ON "topics" USING btree ("slug");

  CREATE INDEX IF NOT EXISTS "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "posts_slug_idx" ON "posts" USING btree ("slug");

  CREATE INDEX IF NOT EXISTS "posts_topics_order_idx" ON "posts_topics" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "posts_topics_parent_id_idx" ON "posts_topics" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "posts_topics_topic_id_idx" ON "posts_topics" USING btree ("topic_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  -- Drop FKs first where needed
  ALTER TABLE IF EXISTS "posts_topics" DROP CONSTRAINT IF EXISTS "posts_topics_parent_fk";
  ALTER TABLE IF EXISTS "posts_topics" DROP CONSTRAINT IF EXISTS "posts_topics_topic_fk";
  ALTER TABLE IF EXISTS "posts" DROP CONSTRAINT IF EXISTS "posts_author_id_authors_id_fk";
  ALTER TABLE IF EXISTS "posts" DROP CONSTRAINT IF EXISTS "posts_hero_image_id_media_id_fk";
  ALTER TABLE IF EXISTS "posts" DROP CONSTRAINT IF EXISTS "posts_seo_og_image_id_media_id_fk";
  ALTER TABLE IF EXISTS "authors" DROP CONSTRAINT IF EXISTS "authors_headshot_id_media_id_fk";

  -- Drop tables
  DROP TABLE IF EXISTS "posts_topics";
  DROP TABLE IF EXISTS "posts";
  DROP TABLE IF EXISTS "topics";
  DROP TABLE IF EXISTS "authors";

  -- Remove added column
  ALTER TABLE IF EXISTS "media" DROP COLUMN IF EXISTS "alt_text";
  `)
}

