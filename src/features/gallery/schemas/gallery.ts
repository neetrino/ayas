import { z } from "zod";

import { GALLERY_CATEGORIES, GALLERY_KINDS } from "@/features/gallery/domain/gallery-item";
import { GALLERY_SORT_MAX, GALLERY_STATUSES } from "@/features/gallery/domain/gallery-rules";
import { locales } from "@/lib/i18n/config";

const copySchema = z.object({
  title: z.string().trim().min(1).max(160),
  alt: z.string().trim().min(1).max(300),
});

export const upsertSchoolGallerySchema = z.object({
  status: z.enum(GALLERY_STATUSES).default("DRAFT"),
  category: z.enum(GALLERY_CATEGORIES),
  kind: z.enum(GALLERY_KINDS),
  sortOrder: z.coerce.number().int().min(0).max(GALLERY_SORT_MAX),
  videoUrl: z.string().trim().max(500).optional(),
  translations: z
    .object({
      hy: copySchema.optional(),
      en: copySchema.optional(),
      ru: copySchema.optional(),
    })
    .refine(
      (value) => locales.some((locale) => value[locale] !== undefined),
      "Add the gallery item in at least one language.",
    ),
});

export type UpsertSchoolGalleryInput = z.output<typeof upsertSchoolGallerySchema>;

export const schoolGalleryIdSchema = z.object({
  galleryItemId: z.string().uuid(),
});

export type SchoolGalleryIdInput = z.infer<typeof schoolGalleryIdSchema>;
