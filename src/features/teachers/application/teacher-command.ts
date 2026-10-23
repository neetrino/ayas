import "server-only";

import { revalidatePath } from "next/cache";

import type { SchoolTeacherTranslationsJson } from "@/db/schema";
import {
  teacherRuleErrorMessage,
  validateTeacherProfile,
  type TeacherTranslations,
} from "@/features/teachers/domain/teacher-rules";
import {
  upsertSchoolTeacherSchema,
  type UpsertSchoolTeacherInput,
} from "@/features/teachers/schemas/teacher";
import { invalidateTeachersCache } from "@/lib/cache/invalidate-public";
import { locales } from "@/lib/i18n/config";
import { err, ok, type Result } from "@/lib/result";

export type SavedTeacher = {
  data: UpsertSchoolTeacherInput;
  translations: TeacherTranslations;
};

function normalizeTranslations(
  input: UpsertSchoolTeacherInput["translations"],
): TeacherTranslations {
  const next: TeacherTranslations = {};
  for (const locale of locales) {
    const copy = input[locale];
    if (!copy) {
      continue;
    }
    next[locale] = {
      name: copy.name.trim(),
      experience: copy.experience.trim(),
      biography: copy.biography.trim(),
    };
  }
  return next;
}

export function validatedTeacher(raw: unknown): Result<SavedTeacher> {
  const parsed = upsertSchoolTeacherSchema.safeParse(raw);
  if (!parsed.success) {
    return err("VALIDATION_ERROR", "Invalid teacher payload.");
  }

  const translations = normalizeTranslations(parsed.data.translations);
  const classIds = [...new Set(parsed.data.classIds)];
  const profileError = validateTeacherProfile({
    role: parsed.data.role,
    classIds,
    sortOrder: parsed.data.sortOrder,
    translations,
  });
  if (profileError) {
    return err(profileError, teacherRuleErrorMessage(profileError));
  }

  return ok({
    data: { ...parsed.data, classIds },
    translations,
  });
}

export function teacherValues(saved: SavedTeacher) {
  return {
    status: saved.data.status,
    role: saved.data.role,
    classIds: [...saved.data.classIds],
    sortOrder: saved.data.sortOrder,
    translations: saved.translations,
    updatedAt: new Date(),
  };
}

export function revalidateSchoolTeachers(locale: string): void {
  revalidatePath(`/${locale}/admin/teachers`);
  for (const loc of locales) {
    revalidatePath(`/${loc}`);
    revalidatePath(`/${loc}/about`);
    revalidatePath(`/${loc}/teachers`);
  }
  invalidateTeachersCache();
}

export function teacherAuditDiff(
  translations: TeacherTranslations | SchoolTeacherTranslationsJson | null | undefined,
  status: string,
  role: string,
): Record<string, unknown> {
  const names = locales.flatMap((loc) => {
    const name = translations?.[loc]?.name;
    return name ? [name] : [];
  });
  return { status, role, names };
}
