import { z } from "zod";

import {
  CLASS_AGES,
  CLASS_CODE_MAX,
  CLASS_CODE_PATTERN,
  CLASS_DIRECTIONS,
  CLASS_LEVELS,
  CLASS_SORT_MAX,
  CLASS_STATUSES,
} from "@/features/classes/domain/class-rules";
import { locales } from "@/lib/i18n/config";

const copySchema = z.object({
  title: z.string().trim().min(1).max(160),
  summary: z.string().trim().min(1).max(800),
});

const translationsSchema = z
  .object({
    hy: copySchema.optional(),
    en: copySchema.optional(),
    ru: copySchema.optional(),
  })
  .refine(
    (value) => locales.some((locale) => value[locale] !== undefined),
    "Add the class in at least one language.",
  );

export const schoolClassFieldsSchema = z.object({
  status: z.enum(CLASS_STATUSES).default("DRAFT"),
  direction: z.enum(CLASS_DIRECTIONS),
  age: z.enum(CLASS_AGES),
  level: z.enum(CLASS_LEVELS),
  sortOrder: z.coerce.number().int().min(0).max(CLASS_SORT_MAX),
  translations: translationsSchema,
});

export const createSchoolClassSchema = schoolClassFieldsSchema.extend({
  code: z.string().trim().min(1).max(CLASS_CODE_MAX).regex(CLASS_CODE_PATTERN),
});

export type CreateSchoolClassInput = z.output<typeof createSchoolClassSchema>;
export type SchoolClassFieldsInput = z.output<typeof schoolClassFieldsSchema>;

export const schoolClassIdSchema = z.object({
  classId: z.string().uuid(),
});

export type SchoolClassIdInput = z.infer<typeof schoolClassIdSchema>;
