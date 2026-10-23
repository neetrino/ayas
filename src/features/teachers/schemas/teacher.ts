import { z } from "zod";

import {
  CLASS_CODE_MAX,
  CLASS_CODE_PATTERN,
} from "@/features/classes/domain/class-rules";
import {
  TEACHER_ROLES,
  TEACHER_SORT_MAX,
  TEACHER_STATUSES,
} from "@/features/teachers/domain/teacher-rules";
import { locales } from "@/lib/i18n/config";

const copySchema = z.object({
  name: z.string().trim().min(1).max(120),
  experience: z.string().trim().min(1).max(400),
  biography: z.string().trim().min(1).max(2000),
});

export const upsertSchoolTeacherSchema = z.object({
  status: z.enum(TEACHER_STATUSES).default("DRAFT"),
  role: z.enum(TEACHER_ROLES),
  classIds: z
    .array(z.string().trim().min(1).max(CLASS_CODE_MAX).regex(CLASS_CODE_PATTERN))
    .max(32),
  sortOrder: z.coerce.number().int().min(0).max(TEACHER_SORT_MAX),
  translations: z
    .object({
      hy: copySchema.optional(),
      en: copySchema.optional(),
      ru: copySchema.optional(),
    })
    .refine(
      (value) => locales.some((locale) => value[locale] !== undefined),
      "Add the teacher in at least one language.",
    ),
});

export type UpsertSchoolTeacherInput = z.output<typeof upsertSchoolTeacherSchema>;

export const schoolTeacherIdSchema = z.object({
  teacherId: z.string().uuid(),
});

export type SchoolTeacherIdInput = z.infer<typeof schoolTeacherIdSchema>;
