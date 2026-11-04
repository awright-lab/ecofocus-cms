import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Payload includes every collection in its polymorphic document relationship,
// even when that collection has lockDocuments: false.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "case_study_downloads_id" integer;
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_case_study_downloads_fk"
      FOREIGN KEY ("case_study_downloads_id") REFERENCES "public"."case_study_downloads"("id")
      ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "payload_locked_documents_rels_case_study_downloads_id_idx"
      ON "payload_locked_documents_rels" USING btree ("case_study_downloads_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "case_study_downloads_id";`)
}
