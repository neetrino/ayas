import { z } from "zod";

import { SCHOOL_EVENT_STATUSES } from "@/features/events/domain/event-rules";
import { locales } from "@/lib/i18n/config";

const copySchema = z.object({
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(4000),
  venue: z.string().trim().min(1).max(160),
  address: z.string().trim().min(1).max(240),
});

export const upsertSchoolEventSchema = z.object({
  status: z.enum(SCHOOL_EVENT_STATUSES).default("DRAFT"),
  date: z.string().trim(),
  startTime: z.string().trim(),
  durationMinutes: z.coerce.number().int(),
  priceAmount: z.coerce.number().int(),
  slug: z.string().trim().min(1).max(160),
  ageRestriction: z
    .string()
    .trim()
    .max(40)
    .optional()
    .nullable()
    .transform((value) => {
      const trimmed = value?.trim() ?? "";
      return trimmed.length > 0 ? trimmed : null;
    }),
  translations: z
    .object({
      hy: copySchema.optional(),
      en: copySchema.optional(),
      ru: copySchema.optional(),
    })
    .refine(
      (value) => locales.some((locale) => value[locale] !== undefined),
      "Add the event in at least one language.",
    ),
});

export type UpsertSchoolEventInput = z.output<typeof upsertSchoolEventSchema>;

export const schoolEventIdSchema = z.object({
  eventId: z.string().uuid(),
});

export type SchoolEventIdInput = z.infer<typeof schoolEventIdSchema>;
