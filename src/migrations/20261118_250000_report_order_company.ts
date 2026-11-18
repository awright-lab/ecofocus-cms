import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "report_orders" ADD COLUMN "company_name" varchar;
    CREATE INDEX "report_orders_company_name_idx" ON "report_orders" USING btree ("company_name");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "report_orders" DROP COLUMN "company_name";`)
}
