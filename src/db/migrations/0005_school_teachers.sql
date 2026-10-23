CREATE TYPE "public"."school_teacher_role" AS ENUM('ballet', 'contemporary', 'traditional', 'team');--> statement-breakpoint
CREATE TYPE "public"."school_teacher_status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TABLE "school_teachers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"status" "school_teacher_status" DEFAULT 'DRAFT' NOT NULL,
	"role" "school_teacher_role" NOT NULL,
	"class_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"portrait_key" text,
	"translations" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "school_teachers_sort_chk" CHECK ("school_teachers"."sort_order" >= 0 AND "school_teachers"."sort_order" <= 9999)
);
--> statement-breakpoint
CREATE INDEX "school_teachers_status_sort_idx" ON "school_teachers" USING btree ("status","sort_order");