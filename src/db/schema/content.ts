import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import {
  createdAtColumn,
  deletedAtColumn,
  idColumn,
  updatedAtColumn,
} from "@/db/schema/columns";
import {
  blogCategoryEnum,
  blogPostStatusEnum,
  schoolClassAgeEnum,
  schoolClassDirectionEnum,
  schoolClassLevelEnum,
  schoolClassStatusEnum,
  schoolEventStatusEnum,
  schoolGalleryCategoryEnum,
  schoolGalleryKindEnum,
  schoolGalleryStatusEnum,
  schoolTeacherRoleEnum,
  schoolTeacherStatusEnum,
} from "@/db/schema/enums";
import { users } from "@/db/schema/identity";

export type HeroTranslation = {
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  buttonUrl?: string;
};

export type HeroTranslationsJson = Partial<
  Record<"hy" | "en" | "ru", HeroTranslation>
>;

export type BlogTranslation = {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type BlogTranslationsJson = Partial<
  Record<"hy" | "en" | "ru", BlogTranslation>
>;

export type SchoolEventTranslation = {
  name: string;
  slug: string;
  description: string;
  venue: string;
  address: string;
};

export type SchoolEventTranslationsJson = Partial<
  Record<"hy" | "en" | "ru", SchoolEventTranslation>
>;

export type SchoolTeacherTranslation = {
  name: string;
  experience: string;
  biography: string;
};

export type SchoolTeacherTranslationsJson = Partial<
  Record<"hy" | "en" | "ru", SchoolTeacherTranslation>
>;

export type SchoolClassTranslation = {
  title: string;
  summary: string;
};

export type SchoolClassTranslationsJson = Partial<
  Record<"hy" | "en" | "ru", SchoolClassTranslation>
>;

export type SchoolGalleryTranslation = {
  title: string;
  alt: string;
};

export type SchoolGalleryTranslationsJson = Partial<
  Record<"hy" | "en" | "ru", SchoolGalleryTranslation>
>;

export const heroSlides = pgTable(
  "hero_slides",
  {
    id: idColumn(),
    translations: jsonb("translations").$type<HeroTranslationsJson>().notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(false),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    index("hero_slides_active_sort_idx").on(table.isActive, table.sortOrder),
  ],
);

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: idColumn(),
    authorUserId: uuid("author_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    status: blogPostStatusEnum("status").notNull().default("DRAFT"),
    category: blogCategoryEnum("category").notNull().default("NEWS"),
    publishedAt: timestamp("published_at", {
      withTimezone: true,
      mode: "date",
    }),
    videoUrl: text("video_url"),
    relatedPostIds: jsonb("related_post_ids")
      .$type<string[]>()
      .notNull()
      .default([]),
    translations: jsonb("translations").$type<BlogTranslationsJson>().notNull(),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
    deletedAt: deletedAtColumn(),
  },
  (table) => [
    index("blog_posts_status_published_idx").on(
      table.status,
      table.publishedAt,
    ),
    index("blog_posts_category_status_idx").on(table.category, table.status),
    uniqueIndex("blog_posts_slug_hy_uidx")
      .on(sql`(${table.translations}->'hy'->>'slug')`)
      .where(sql`${table.translations}->'hy'->>'slug' IS NOT NULL`),
    uniqueIndex("blog_posts_slug_en_uidx")
      .on(sql`(${table.translations}->'en'->>'slug')`)
      .where(sql`${table.translations}->'en'->>'slug' IS NOT NULL`),
    uniqueIndex("blog_posts_slug_ru_uidx")
      .on(sql`(${table.translations}->'ru'->>'slug')`)
      .where(sql`${table.translations}->'ru'->>'slug' IS NOT NULL`),
  ],
);

export const schoolEvents = pgTable(
  "school_events",
  {
    id: idColumn(),
    status: schoolEventStatusEnum("status").notNull().default("DRAFT"),
    eventDate: text("event_date").notNull(),
    startTime: text("start_time").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    priceAmount: integer("price_amount").notNull(),
    ageRestriction: text("age_restriction"),
    posterKey: text("poster_key"),
    seatingPlanKey: text("seating_plan_key"),
    galleryKeys: jsonb("gallery_keys").$type<string[]>().notNull().default([]),
    translations: jsonb("translations")
      .$type<SchoolEventTranslationsJson>()
      .notNull(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
    deletedAt: deletedAtColumn(),
  },
  (table) => [
    index("school_events_status_date_idx").on(
      table.status,
      table.eventDate,
      table.startTime,
    ),
    uniqueIndex("school_events_slug_hy_uidx")
      .on(sql`(${table.translations}->'hy'->>'slug')`)
      .where(
        sql`${table.deletedAt} IS NULL AND ${table.translations}->'hy'->>'slug' IS NOT NULL`,
      ),
    uniqueIndex("school_events_slug_en_uidx")
      .on(sql`(${table.translations}->'en'->>'slug')`)
      .where(
        sql`${table.deletedAt} IS NULL AND ${table.translations}->'en'->>'slug' IS NOT NULL`,
      ),
    uniqueIndex("school_events_slug_ru_uidx")
      .on(sql`(${table.translations}->'ru'->>'slug')`)
      .where(
        sql`${table.deletedAt} IS NULL AND ${table.translations}->'ru'->>'slug' IS NOT NULL`,
      ),
    check(
      "school_events_duration_chk",
      sql`${table.durationMinutes} >= 1 AND ${table.durationMinutes} <= 1440`,
    ),
    check(
      "school_events_price_chk",
      sql`${table.priceAmount} >= 0`,
    ),
  ],
);

export const schoolTeachers = pgTable(
  "school_teachers",
  {
    id: idColumn(),
    status: schoolTeacherStatusEnum("status").notNull().default("DRAFT"),
    role: schoolTeacherRoleEnum("role").notNull(),
    classIds: jsonb("class_ids").$type<string[]>().notNull().default([]),
    sortOrder: integer("sort_order").notNull().default(0),
    isFeatured: boolean("is_featured").notNull().default(false),
    portraitKey: text("portrait_key"),
    translations: jsonb("translations")
      .$type<SchoolTeacherTranslationsJson>()
      .notNull(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
    deletedAt: deletedAtColumn(),
  },
  (table) => [
    index("school_teachers_status_sort_idx").on(table.status, table.sortOrder),
    check(
      "school_teachers_sort_chk",
      sql`${table.sortOrder} >= 0 AND ${table.sortOrder} <= 9999`,
    ),
  ],
);

export const schoolClasses = pgTable(
  "school_classes",
  {
    id: idColumn(),
    code: text("code").notNull(),
    status: schoolClassStatusEnum("status").notNull().default("DRAFT"),
    direction: schoolClassDirectionEnum("direction").notNull(),
    age: schoolClassAgeEnum("age").notNull(),
    level: schoolClassLevelEnum("level").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    translations: jsonb("translations")
      .$type<SchoolClassTranslationsJson>()
      .notNull(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
    deletedAt: deletedAtColumn(),
  },
  (table) => [
    uniqueIndex("school_classes_code_uidx")
      .on(table.code)
      .where(sql`${table.deletedAt} IS NULL`),
    index("school_classes_status_sort_idx").on(table.status, table.sortOrder),
    check(
      "school_classes_sort_chk",
      sql`${table.sortOrder} >= 0 AND ${table.sortOrder} <= 9999`,
    ),
    check(
      "school_classes_code_chk",
      sql`${table.code} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`,
    ),
  ],
);

export const schoolGalleryItems = pgTable(
  "school_gallery_items",
  {
    id: idColumn(),
    status: schoolGalleryStatusEnum("status").notNull().default("DRAFT"),
    category: schoolGalleryCategoryEnum("category").notNull(),
    kind: schoolGalleryKindEnum("kind").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    imageKey: text("image_key"),
    videoUrl: text("video_url"),
    translations: jsonb("translations")
      .$type<SchoolGalleryTranslationsJson>()
      .notNull(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
    deletedAt: deletedAtColumn(),
  },
  (table) => [
    index("school_gallery_items_status_sort_idx").on(
      table.status,
      table.sortOrder,
    ),
    check(
      "school_gallery_items_sort_chk",
      sql`${table.sortOrder} >= 0 AND ${table.sortOrder} <= 9999`,
    ),
  ],
);
