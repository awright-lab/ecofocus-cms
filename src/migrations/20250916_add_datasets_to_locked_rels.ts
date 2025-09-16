import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Add datasets relation to payload_locked_documents_rels, guarded for idempotency
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "datasets_id" integer;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_datasets_fk') THEN
        ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_datasets_fk"
          FOREIGN KEY ("datasets_id") REFERENCES "public"."datasets"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_datasets_id_idx" ON "payload_locked_documents_rels" USING btree ("datasets_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_datasets_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "datasets_id";
  `)
}

