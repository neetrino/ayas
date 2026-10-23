CREATE TYPE "public"."school_class_age" AS ENUM('children', 'teens', 'adults', 'youth', 'all');--> statement-breakpoint
CREATE TYPE "public"."school_class_direction" AS ENUM('ballet', 'contemporary', 'traditional', 'open');--> statement-breakpoint
CREATE TYPE "public"."school_class_level" AS ENUM('beginner', 'intermediate', 'advanced', 'all');--> statement-breakpoint
CREATE TYPE "public"."school_class_status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TABLE "school_classes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"status" "school_class_status" DEFAULT 'DRAFT' NOT NULL,
	"direction" "school_class_direction" NOT NULL,
	"age" "school_class_age" NOT NULL,
	"level" "school_class_level" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"translations" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "school_classes_sort_chk" CHECK ("school_classes"."sort_order" >= 0 AND "school_classes"."sort_order" <= 9999),
	CONSTRAINT "school_classes_code_chk" CHECK ("school_classes"."code" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE UNIQUE INDEX "school_classes_code_uidx" ON "school_classes" USING btree ("code") WHERE "school_classes"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "school_classes_status_sort_idx" ON "school_classes" USING btree ("status","sort_order");