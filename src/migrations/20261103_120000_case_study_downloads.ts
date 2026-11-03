import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "case_study_downloads" (
      "id" serial PRIMARY KEY NOT NULL,
      "first_name" varchar NOT NULL,
      "last_name" varchar NOT NULL,
      "email" varchar NOT NULL,
      "case_study" varchar DEFAULT 'glass-packaging-institute-2026' NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE INDEX "case_study_downloads_email_idx" ON "case_study_downloads" USING btree ("email");
    CREATE INDEX "case_study_downloads_case_study_idx" ON "case_study_downloads" USING btree ("case_study");
    CREATE INDEX "case_study_downloads_updated_at_idx" ON "case_study_downloads" USING btree ("updated_at");
    CREATE INDEX "case_study_downloads_created_at_idx" ON "case_study_downloads" USING btree ("created_at");
  `)
}
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE "case_study_downloads";`)
}
