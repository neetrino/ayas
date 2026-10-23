import "server-only";

import { revalidatePath } from "next/cache";

import type { SchoolClassTranslationsJson } from "@/db/schema";
import {
  classRuleErrorMessage,
  validateClassProfile,
  type ClassTranslations,
} from "@/features/classes/domain/class-rules";
import {
  createSchoolClassSchema,
  schoolClassFieldsSchema,
  type CreateSchoolClassInput,
  type SchoolClassFieldsInput,
} from "@/features/classes/schemas/class-program";
import { invalidateClassesCache } from "@/lib/cache/invalidate-public";
import { locales } from "@/lib/i18n/config";
import { err, ok, type Result } from "@/lib/result";

export type SavedClass = {
  data: SchoolClassFieldsInput;
  translations: ClassTranslations;
};

export type SavedNewClass = SavedClass & {
  data: CreateSchoolClassInput;
};

function normalizeTranslations(
  input: SchoolClassFieldsInput["translations"],
): ClassTranslations {
  const next: ClassTranslations = {};
  for (const locale of locales) {
    const copy = input[locale];
    if (!copy) {
      continue;
    }
    next[locale] = { title: copy.title.trim(), summary: copy.summary.trim() };
  }
  return next;
}

function profileError(
  data: SchoolClassFieldsInput,
  translations: ClassTranslations,
  code?: string,
): Result<SavedClass> {
  const error = validateClassProfile({
    code,
    direction: data.direction,
    age: data.age,
    level: data.level,
    sortOrder: data.sortOrder,
    translations,
  });
  if (error) {
    return err(error, classRuleErrorMessage(error));
  }
  return ok({ data, translations });
}

export function validatedCreateClass(raw: unknown): Result<SavedNewClass> {
  const parsed = createSchoolClassSchema.safeParse(raw);
  if (!parsed.success) {
    return err("VALIDATION_ERROR", "Invalid class payload.");
  }
  const translations = normalizeTranslations(parsed.data.translations);
  const checked = profileError(parsed.data, translations, parsed.data.code);
  if (!checked.ok) {
    return checked;
  }
  return ok({ data: parsed.data, translations });
}

export function validatedUpdateClass(raw: unknown): Result<SavedClass> {
  const parsed = schoolClassFieldsSchema.safeParse(raw);
  if (!parsed.success) {
    return err("VALIDATION_ERROR", "Invalid class payload.");
  }
  const translations = normalizeTranslations(parsed.data.translations);
  return profileError(parsed.data, translations);
}

export function classValues(saved: SavedClass) {
  return {
    status: saved.data.status,
    direction: saved.data.direction,
    age: saved.data.age,
    level: saved.data.level,
    sortOrder: saved.data.sortOrder,
    translations: saved.translations,
    updatedAt: new Date(),
  };
}

export function revalidateSchoolClasses(locale: string): void {
  revalidatePath(`/${locale}/admin/classes`);
  revalidatePath(`/${locale}/admin/teachers`);
  for (const loc of locales) {
    revalidatePath(`/${loc}/classes`);
    revalidatePath(`/${loc}/teachers`);
  }
  invalidateClassesCache();
}

export function classAuditDiff(
  translations: ClassTranslations | SchoolClassTranslationsJson | null | undefined,
  status: string,
  code: string,
): Record<string, unknown> {
  const titles = locales.flatMap((loc) => {
    const title = translations?.[loc]?.title;
    return title ? [title] : [];
  });
  return { status, code, titles };
}
