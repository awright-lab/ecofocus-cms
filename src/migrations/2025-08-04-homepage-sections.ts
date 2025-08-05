import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- HERO SECTION
    CREATE TABLE hero_section (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      headline TEXT NOT NULL,
      subheadline TEXT,
      background_image UUID,
      background_video UUID,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE hero_section_cta_buttons (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      hero_section_id UUID REFERENCES hero_section(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      url TEXT NOT NULL
    );

    -- QUICK STATS
    CREATE TABLE quick_stats (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE quick_stats_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      quick_stats_id UUID REFERENCES quick_stats(id) ON DELETE CASCADE,
      value TEXT NOT NULL,
      description TEXT NOT NULL
    );

    -- FEATURED REPORT
    CREATE TABLE featured_report (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      price TEXT,
      cta_label TEXT,
      cta_url TEXT,
      image UUID,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- DASHBOARD PROMO
    CREATE TABLE dashboard_promo (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      headline TEXT,
      description TEXT,
      cta_label TEXT,
      cta_url TEXT,
      image UUID,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- ECO NUGGETS
    CREATE TABLE eco_nuggets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      heading TEXT,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- WHY CHOOSE
    CREATE TABLE why_choose (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE why_choose_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      why_choose_id UUID REFERENCES why_choose(id) ON DELETE CASCADE,
      title TEXT,
      description TEXT
    );

    -- TRUSTED BY
    CREATE TABLE trusted_by (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE trusted_by_logos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      trusted_by_id UUID REFERENCES trusted_by(id) ON DELETE CASCADE,
      logo UUID
    );

    -- CTA BANNER
    CREATE TABLE cta_banner (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      text TEXT,
      button_label TEXT,
      button_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS hero_section_cta_buttons CASCADE;
    DROP TABLE IF EXISTS hero_section CASCADE;
    DROP TABLE IF EXISTS quick_stats_items CASCADE;
    DROP TABLE IF EXISTS quick_stats CASCADE;
    DROP TABLE IF EXISTS featured_report CASCADE;
    DROP TABLE IF EXISTS dashboard_promo CASCADE;
    DROP TABLE IF EXISTS eco_nuggets CASCADE;
    DROP TABLE IF EXISTS why_choose_items CASCADE;
    DROP TABLE IF EXISTS why_choose CASCADE;
    DROP TABLE IF EXISTS trusted_by_logos CASCADE;
    DROP TABLE IF EXISTS trusted_by CASCADE;
    DROP TABLE IF EXISTS cta_banner CASCADE;
  `)
}
