CREATE TYPE "public"."blog_category" AS ENUM('NEWS', 'COMPETITION', 'PERFORMANCE', 'EVENT', 'WORKSHOP', 'INTERVIEW', 'TIP');--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "category" "blog_category" DEFAULT 'NEWS' NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "video_url" text;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "related_post_ids" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
CREATE INDEX "blog_posts_category_status_idx" ON "blog_posts" USING btree ("category","status");