import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Create normalized tables for Posts blocks and relationships expected by Payload
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  -- Blocks: Paragraph
  CREATE TABLE IF NOT EXISTS "posts_blocks_paragraph" (
    "_order" integer NOT NULL,
    "_path" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "_parent_id" integer NOT NULL,
    "content" jsonb,
    "block_name" varchar
  );

  -- Blocks: ImageBlock
  CREATE TABLE IF NOT EXISTS "posts_blocks_image_block" (
    "_order" integer NOT NULL,
    "_path" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "_parent_id" integer NOT NULL,
    "image_id" integer,
    "caption" varchar,
    "block_name" varchar
  );

  -- Blocks: PullQuote
  CREATE TABLE IF NOT EXISTS "posts_blocks_pull_quote" (
    "_order" integer NOT NULL,
    "_path" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "_parent_id" integer NOT NULL,
    "quote" varchar,
    "attribution" varchar,
    "block_name" varchar
  );

  -- Blocks: KeyTakeaways + nested items
  CREATE TABLE IF NOT EXISTS "posts_blocks_key_takeaways" (
    "_order" integer NOT NULL,
    "_path" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "_parent_id" integer NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "posts_blocks_key_takeaways_items" (
    "_order" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "_parent_id" varchar NOT NULL,
    "text" varchar
  );

  -- Blocks: CTAGroup + nested ctas
  CREATE TABLE IF NOT EXISTS "posts_blocks_cta_group" (
    "_order" integer NOT NULL,
    "_path" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "_parent_id" integer NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "posts_blocks_cta_group_ctas" (
    "_order" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "_parent_id" varchar NOT NULL,
    "label" varchar,
    "href" varchar,
    "style" varchar
  );

  -- Generic relationships table for hasMany topics
  CREATE TABLE IF NOT EXISTS "posts_rels" (
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "topics_id" integer
  );

  -- Foreign keys
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_blocks_paragraph_parent_fk') THEN
      ALTER TABLE "posts_blocks_paragraph" ADD CONSTRAINT "posts_blocks_paragraph_parent_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_blocks_image_block_parent_fk') THEN
      ALTER TABLE "posts_blocks_image_block" ADD CONSTRAINT "posts_blocks_image_block_parent_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_blocks_image_block_image_fk') THEN
      ALTER TABLE "posts_blocks_image_block" ADD CONSTRAINT "posts_blocks_image_block_image_fk"
        FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_blocks_pull_quote_parent_fk') THEN
      ALTER TABLE "posts_blocks_pull_quote" ADD CONSTRAINT "posts_blocks_pull_quote_parent_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_blocks_key_takeaways_parent_fk') THEN
      ALTER TABLE "posts_blocks_key_takeaways" ADD CONSTRAINT "posts_blocks_key_takeaways_parent_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_blocks_key_takeaways_items_parent_fk') THEN
      ALTER TABLE "posts_blocks_key_takeaways_items" ADD CONSTRAINT "posts_blocks_key_takeaways_items_parent_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_key_takeaways"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_blocks_cta_group_parent_fk') THEN
      ALTER TABLE "posts_blocks_cta_group" ADD CONSTRAINT "posts_blocks_cta_group_parent_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_blocks_cta_group_ctas_parent_fk') THEN
      ALTER TABLE "posts_blocks_cta_group_ctas" ADD CONSTRAINT "posts_blocks_cta_group_ctas_parent_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_cta_group"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_rels_parent_fk') THEN
      ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_rels_topics_fk') THEN
      ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_topics_fk"
        FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;

  -- Indexes
  CREATE INDEX IF NOT EXISTS "posts_blocks_paragraph_order_idx" ON "posts_blocks_paragraph" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "posts_blocks_paragraph_parent_id_idx" ON "posts_blocks_paragraph" USING btree ("_parent_id");

  CREATE INDEX IF NOT EXISTS "posts_blocks_image_block_order_idx" ON "posts_blocks_image_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "posts_blocks_image_block_parent_id_idx" ON "posts_blocks_image_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "posts_blocks_image_block_image_id_idx" ON "posts_blocks_image_block" USING btree ("image_id");

  CREATE INDEX IF NOT EXISTS "posts_blocks_pull_quote_order_idx" ON "posts_blocks_pull_quote" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "posts_blocks_pull_quote_parent_id_idx" ON "posts_blocks_pull_quote" USING btree ("_parent_id");

  CREATE INDEX IF NOT EXISTS "posts_blocks_key_takeaways_order_idx" ON "posts_blocks_key_takeaways" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "posts_blocks_key_takeaways_parent_id_idx" ON "posts_blocks_key_takeaways" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "posts_blocks_key_takeaways_items_order_idx" ON "posts_blocks_key_takeaways_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "posts_blocks_key_takeaways_items_parent_id_idx" ON "posts_blocks_key_takeaways_items" USING btree ("_parent_id");

  CREATE INDEX IF NOT EXISTS "posts_blocks_cta_group_order_idx" ON "posts_blocks_cta_group" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "posts_blocks_cta_group_parent_id_idx" ON "posts_blocks_cta_group" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "posts_blocks_cta_group_ctas_order_idx" ON "posts_blocks_cta_group_ctas" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "posts_blocks_cta_group_ctas_parent_id_idx" ON "posts_blocks_cta_group_ctas" USING btree ("_parent_id");

  CREATE INDEX IF NOT EXISTS "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "posts_rels_parent_id_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "posts_rels_topics_id_idx" ON "posts_rels" USING btree ("topics_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE IF EXISTS "posts_rels";
  DROP TABLE IF EXISTS "posts_blocks_cta_group_ctas";
  DROP TABLE IF EXISTS "posts_blocks_cta_group";
  DROP TABLE IF EXISTS "posts_blocks_key_takeaways_items";
  DROP TABLE IF EXISTS "posts_blocks_key_takeaways";
  DROP TABLE IF EXISTS "posts_blocks_pull_quote";
  DROP TABLE IF EXISTS "posts_blocks_image_block";
  DROP TABLE IF EXISTS "posts_blocks_paragraph";
  `)
}
