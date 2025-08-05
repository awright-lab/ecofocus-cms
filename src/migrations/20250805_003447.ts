import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "hero_section_cta_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "hero_section" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar NOT NULL,
  	"subheadline" varchar,
  	"background_image_id" integer,
  	"background_video_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "quick_stats_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"description" varchar NOT NULL
  );
  
  CREATE TABLE "quick_stats" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "featured_report" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"price" varchar,
  	"cta_label" varchar,
  	"cta_url" varchar,
  	"image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "dashboard_promo" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"description" varchar,
  	"cta_label" varchar,
  	"cta_url" varchar,
  	"image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "eco_nuggets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "why_choose_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "why_choose" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "trusted_by_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"logo_id" integer
  );
  
  CREATE TABLE "trusted_by" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cta_banner" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"button_label" varchar,
  	"button_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"hero_section_id" integer,
  	"quick_stats_id" integer,
  	"featured_report_id" integer,
  	"dashboard_promo_id" integer,
  	"eco_nuggets_id" integer,
  	"why_choose_id" integer,
  	"trusted_by_id" integer,
  	"cta_banner_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hero_section_cta_buttons" ADD CONSTRAINT "hero_section_cta_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hero_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hero_section" ADD CONSTRAINT "hero_section_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hero_section" ADD CONSTRAINT "hero_section_background_video_id_media_id_fk" FOREIGN KEY ("background_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quick_stats_stats" ADD CONSTRAINT "quick_stats_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quick_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "featured_report" ADD CONSTRAINT "featured_report_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "dashboard_promo" ADD CONSTRAINT "dashboard_promo_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "why_choose_items" ADD CONSTRAINT "why_choose_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."why_choose"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trusted_by_logos" ADD CONSTRAINT "trusted_by_logos_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trusted_by_logos" ADD CONSTRAINT "trusted_by_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."trusted_by"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_hero_section_fk" FOREIGN KEY ("hero_section_id") REFERENCES "public"."hero_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_quick_stats_fk" FOREIGN KEY ("quick_stats_id") REFERENCES "public"."quick_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_featured_report_fk" FOREIGN KEY ("featured_report_id") REFERENCES "public"."featured_report"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_dashboard_promo_fk" FOREIGN KEY ("dashboard_promo_id") REFERENCES "public"."dashboard_promo"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_eco_nuggets_fk" FOREIGN KEY ("eco_nuggets_id") REFERENCES "public"."eco_nuggets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_why_choose_fk" FOREIGN KEY ("why_choose_id") REFERENCES "public"."why_choose"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_trusted_by_fk" FOREIGN KEY ("trusted_by_id") REFERENCES "public"."trusted_by"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cta_banner_fk" FOREIGN KEY ("cta_banner_id") REFERENCES "public"."cta_banner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "hero_section_cta_buttons_order_idx" ON "hero_section_cta_buttons" USING btree ("_order");
  CREATE INDEX "hero_section_cta_buttons_parent_id_idx" ON "hero_section_cta_buttons" USING btree ("_parent_id");
  CREATE INDEX "hero_section_background_image_idx" ON "hero_section" USING btree ("background_image_id");
  CREATE INDEX "hero_section_background_video_idx" ON "hero_section" USING btree ("background_video_id");
  CREATE INDEX "hero_section_updated_at_idx" ON "hero_section" USING btree ("updated_at");
  CREATE INDEX "hero_section_created_at_idx" ON "hero_section" USING btree ("created_at");
  CREATE INDEX "quick_stats_stats_order_idx" ON "quick_stats_stats" USING btree ("_order");
  CREATE INDEX "quick_stats_stats_parent_id_idx" ON "quick_stats_stats" USING btree ("_parent_id");
  CREATE INDEX "quick_stats_updated_at_idx" ON "quick_stats" USING btree ("updated_at");
  CREATE INDEX "quick_stats_created_at_idx" ON "quick_stats" USING btree ("created_at");
  CREATE INDEX "featured_report_image_idx" ON "featured_report" USING btree ("image_id");
  CREATE INDEX "featured_report_updated_at_idx" ON "featured_report" USING btree ("updated_at");
  CREATE INDEX "featured_report_created_at_idx" ON "featured_report" USING btree ("created_at");
  CREATE INDEX "dashboard_promo_image_idx" ON "dashboard_promo" USING btree ("image_id");
  CREATE INDEX "dashboard_promo_updated_at_idx" ON "dashboard_promo" USING btree ("updated_at");
  CREATE INDEX "dashboard_promo_created_at_idx" ON "dashboard_promo" USING btree ("created_at");
  CREATE INDEX "eco_nuggets_updated_at_idx" ON "eco_nuggets" USING btree ("updated_at");
  CREATE INDEX "eco_nuggets_created_at_idx" ON "eco_nuggets" USING btree ("created_at");
  CREATE INDEX "why_choose_items_order_idx" ON "why_choose_items" USING btree ("_order");
  CREATE INDEX "why_choose_items_parent_id_idx" ON "why_choose_items" USING btree ("_parent_id");
  CREATE INDEX "why_choose_updated_at_idx" ON "why_choose" USING btree ("updated_at");
  CREATE INDEX "why_choose_created_at_idx" ON "why_choose" USING btree ("created_at");
  CREATE INDEX "trusted_by_logos_order_idx" ON "trusted_by_logos" USING btree ("_order");
  CREATE INDEX "trusted_by_logos_parent_id_idx" ON "trusted_by_logos" USING btree ("_parent_id");
  CREATE INDEX "trusted_by_logos_logo_idx" ON "trusted_by_logos" USING btree ("logo_id");
  CREATE INDEX "trusted_by_updated_at_idx" ON "trusted_by" USING btree ("updated_at");
  CREATE INDEX "trusted_by_created_at_idx" ON "trusted_by" USING btree ("created_at");
  CREATE INDEX "cta_banner_updated_at_idx" ON "cta_banner" USING btree ("updated_at");
  CREATE INDEX "cta_banner_created_at_idx" ON "cta_banner" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_hero_section_id_idx" ON "payload_locked_documents_rels" USING btree ("hero_section_id");
  CREATE INDEX "payload_locked_documents_rels_quick_stats_id_idx" ON "payload_locked_documents_rels" USING btree ("quick_stats_id");
  CREATE INDEX "payload_locked_documents_rels_featured_report_id_idx" ON "payload_locked_documents_rels" USING btree ("featured_report_id");
  CREATE INDEX "payload_locked_documents_rels_dashboard_promo_id_idx" ON "payload_locked_documents_rels" USING btree ("dashboard_promo_id");
  CREATE INDEX "payload_locked_documents_rels_eco_nuggets_id_idx" ON "payload_locked_documents_rels" USING btree ("eco_nuggets_id");
  CREATE INDEX "payload_locked_documents_rels_why_choose_id_idx" ON "payload_locked_documents_rels" USING btree ("why_choose_id");
  CREATE INDEX "payload_locked_documents_rels_trusted_by_id_idx" ON "payload_locked_documents_rels" USING btree ("trusted_by_id");
  CREATE INDEX "payload_locked_documents_rels_cta_banner_id_idx" ON "payload_locked_documents_rels" USING btree ("cta_banner_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "hero_section_cta_buttons" CASCADE;
  DROP TABLE "hero_section" CASCADE;
  DROP TABLE "quick_stats_stats" CASCADE;
  DROP TABLE "quick_stats" CASCADE;
  DROP TABLE "featured_report" CASCADE;
  DROP TABLE "dashboard_promo" CASCADE;
  DROP TABLE "eco_nuggets" CASCADE;
  DROP TABLE "why_choose_items" CASCADE;
  DROP TABLE "why_choose" CASCADE;
  DROP TABLE "trusted_by_logos" CASCADE;
  DROP TABLE "trusted_by" CASCADE;
  DROP TABLE "cta_banner" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;`)
}
