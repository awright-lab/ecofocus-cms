import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "hero_section" ALTER COLUMN "subheadline" SET NOT NULL;
  ALTER TABLE "hero_section" ADD COLUMN "highlighted_word" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "hero_section" ALTER COLUMN "subheadline" DROP NOT NULL;
  ALTER TABLE "hero_section" DROP COLUMN "highlighted_word";`)
}
