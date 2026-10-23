CREATE TYPE "public"."school_gallery_category" AS ENUM('classes', 'performances', 'competitions', 'backstage', 'workshops');--> statement-breakpoint
CREATE TYPE "public"."school_gallery_kind" AS ENUM('photo', 'video');--> statement-breakpoint
CREATE TYPE "public"."school_gallery_status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TABLE "school_gallery_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"status" "school_gallery_status" DEFAULT 'DRAFT' NOT NULL,
	"category" "school_gallery_category" NOT NULL,
	"kind" "school_gallery_kind" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"image_key" text,
	"video_url" text,
	"translations" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "school_gallery_items_sort_chk" CHECK ("school_gallery_items"."sort_order" >= 0 AND "school_gallery_items"."sort_order" <= 9999)
);
--> statement-breakpoint
CREATE INDEX "school_gallery_items_status_sort_idx" ON "school_gallery_items" USING btree ("status","sort_order");