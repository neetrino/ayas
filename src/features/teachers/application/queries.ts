import "server-only";

import { and, asc, eq, isNull } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { getDb } from "@/db/client";
import { schoolTeachers, type SchoolTeacherTranslationsJson } from "@/db/schema";
import { resolveTeacherPortraitUrl } from "@/features/teachers/application/persist-teacher-portrait";
import {
  resolveTeacherTranslation,
  type TeacherRole,
  type TeacherStatus,
  type TeacherTranslations,
} from "@/features/teachers/domain/teacher-rules";
import {
  CACHE_TAGS,
  PUBLIC_CACHE_REVALIDATE_SECONDS,
} from "@/lib/cache/tags";
import type { Locale } from "@/lib/i18n/config";

export type PublicTeacher = {
  id: string;
  name: string;
  roleId: TeacherRole;
  experience: string;
  biography: string;
  classIds: string[];
  imageSrc: string | null;
};

export type AdminTeacherListItem = {
  id: string;
  status: TeacherStatus;
  role: TeacherRole;
  classIds: string[];
  sortOrder: number;
  isFeatured: boolean;
  name: string;
  portraitKey: string | null;
  portraitUrl: string | null;
  translations: TeacherTranslations;
};

type SchoolTeacherRow = typeof schoolTeachers.$inferSelect;

function asTranslations(value: SchoolTeacherTranslationsJson): TeacherTranslations {
  return value;
}

function toPublicTeacher(row: SchoolTeacherRow, locale: Locale): PublicTeacher | null {
  const copy = resolveTeacherTranslation(asTranslations(row.translations), locale);
  if (!copy) {
    return null;
  }

  return {
    id: row.id,
    name: copy.name,
    roleId: row.role,
    experience: copy.experience,
    biography: copy.biography,
    classIds: row.classIds,
    imageSrc: resolveTeacherPortraitUrl(row.portraitKey),
  };
}

function toAdminItem(row: SchoolTeacherRow, locale: Locale): AdminTeacherListItem {
  const copy = resolveTeacherTranslation(asTranslations(row.translations), locale);
  return {
    id: row.id,
    status: row.status,
    role: row.role,
    classIds: row.classIds,
    sortOrder: row.sortOrder,
    isFeatured: row.isFeatured,
    name: copy?.name ?? "Untitled",
    portraitKey: row.portraitKey,
    portraitUrl: resolveTeacherPortraitUrl(row.portraitKey),
    translations: asTranslations(row.translations),
  };
}

/** Admin roster, including drafts. Excludes soft-deleted rows. */
export async function listAdminTeachers(
  locale: Locale,
): Promise<AdminTeacherListItem[]> {
  const rows = await getDb()
    .select()
    .from(schoolTeachers)
    .where(isNull(schoolTeachers.deletedAt))
    .orderBy(asc(schoolTeachers.sortOrder), asc(schoolTeachers.createdAt));

  return rows.map((row) => toAdminItem(row, locale));
}

async function loadPublishedTeachers(
  locale: Locale,
  featuredOnly: boolean,
): Promise<PublicTeacher[]> {
  const rows = await getDb()
    .select()
    .from(schoolTeachers)
    .where(
      and(
        eq(schoolTeachers.status, "PUBLISHED"),
        isNull(schoolTeachers.deletedAt),
        featuredOnly ? eq(schoolTeachers.isFeatured, true) : undefined,
      ),
    )
    .orderBy(asc(schoolTeachers.sortOrder), asc(schoolTeachers.createdAt));

  return rows.flatMap((row) => {
    const teacher = toPublicTeacher(row, locale);
    return teacher ? [teacher] : [];
  });
}

/** Published teachers for the public roster, in sort order. */
export async function listPublishedTeachers(
  locale: Locale,
): Promise<PublicTeacher[]> {
  return unstable_cache(
    async () => loadPublishedTeachers(locale, false),
    ["published-school-teachers", locale],
    {
      tags: [CACHE_TAGS.teachers],
      revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    },
  )();
}

/** Published teachers marked for the home-page coaches block. */
export async function listHomeTeachers(locale: Locale): Promise<PublicTeacher[]> {
  return unstable_cache(
    async () => loadPublishedTeachers(locale, true),
    ["home-school-teachers", locale],
    {
      tags: [CACHE_TAGS.teachers],
      revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    },
  )();
}
