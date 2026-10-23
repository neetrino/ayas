ALTER TABLE "school_teachers" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE "school_teachers" SET "is_featured" = true WHERE "status" = 'PUBLISHED' AND "deleted_at" IS NULL;
