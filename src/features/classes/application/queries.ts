import "server-only";

import { and, asc, inArray, isNull } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { getDb } from "@/db/client";
import { schoolClasses, type SchoolClassTranslationsJson } from "@/db/schema";
import {
  resolveClassTranslation,
  type ClassAge,
  type ClassDirection,
  type ClassLevel,
  type ClassStatus,
  type ClassOption,
  type ClassTranslations,
} from "@/features/classes/domain/class-rules";
import {
  CACHE_TAGS,
  PUBLIC_CACHE_REVALIDATE_SECONDS,
} from "@/lib/cache/tags";
import type { Locale } from "@/lib/i18n/config";
import { logger } from "@/lib/observability/logger";

export type PublicSchoolClass = {
  code: string;
  title: string;
  summary: string;
  direction: ClassDirection;
  age: ClassAge;
  level: ClassLevel;
};

export type SchoolClassCatalog = {
  published: PublicSchoolClass[];
  total: number;
};

export type AdminClassListItem = {
  id: string;
  code: string;
  status: ClassStatus;
  direction: ClassDirection;
  age: ClassAge;
  level: ClassLevel;
  sortOrder: number;
  title: string;
  translations: ClassTranslations;
};

type SchoolClassRow = typeof schoolClasses.$inferSelect;

function asTranslations(value: SchoolClassTranslationsJson): ClassTranslations {
  return value;
}

function toPublicClass(row: SchoolClassRow, locale: Locale): PublicSchoolClass | null {
  const copy = resolveClassTranslation(asTranslations(row.translations), locale);
  if (!copy) {
    return null;
  }
  return {
    code: row.code,
    title: copy.title,
    summary: copy.summary,
    direction: row.direction,
    age: row.age,
    level: row.level,
  };
}

function toAdminItem(row: SchoolClassRow, locale: Locale): AdminClassListItem {
  const copy = resolveClassTranslation(asTranslations(row.translations), locale);
  return {
    id: row.id,
    code: row.code,
    status: row.status,
    direction: row.direction,
    age: row.age,
    level: row.level,
    sortOrder: row.sortOrder,
    title: copy?.title ?? row.code,
    translations: asTranslations(row.translations),
  };
}

/** Admin catalog, including drafts. Excludes soft-deleted rows. */
export async function listAdminClasses(
  locale: Locale,
): Promise<AdminClassListItem[]> {
  const rows = await getDb()
    .select()
    .from(schoolClasses)
    .where(isNull(schoolClasses.deletedAt))
    .orderBy(asc(schoolClasses.sortOrder), asc(schoolClasses.createdAt));

  return rows.map((row) => toAdminItem(row, locale));
}

/** Codes and titles for the teacher class picker. */
export async function listAdminClassOptions(locale: Locale): Promise<ClassOption[]> {
  const rows = await listAdminClasses(locale);
  return rows.map((row) => ({ code: row.code, title: row.title }));
}

/** Codes that are not an active class. Empty input returns an empty list. */
export async function missingClassCodes(
  codes: readonly string[],
): Promise<string[]> {
  const unique = [...new Set(codes)];
  if (unique.length === 0) {
    return [];
  }

  const rows = await getDb()
    .select({ code: schoolClasses.code })
    .from(schoolClasses)
    .where(
      and(inArray(schoolClasses.code, unique), isNull(schoolClasses.deletedAt)),
    );

  const found = new Set(rows.map((row) => row.code));
  return unique.filter((code) => !found.has(code));
}

async function loadCatalog(locale: Locale): Promise<SchoolClassCatalog> {
  const rows = await getDb()
    .select()
    .from(schoolClasses)
    .where(isNull(schoolClasses.deletedAt))
    .orderBy(asc(schoolClasses.sortOrder), asc(schoolClasses.createdAt));

  const published = rows.flatMap((row) => {
    if (row.status !== "PUBLISHED") {
      return [];
    }
    const item = toPublicClass(row, locale);
    return item ? [item] : [];
  });

  return { published, total: rows.length };
}

function isMissingRelation(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  if ("code" in error && error.code === "42P01") {
    return true;
  }
  if ("cause" in error) {
    return isMissingRelation(error.cause);
  }
  return false;
}

/** Published classes plus a count of every non-deleted row. */
export async function listSchoolClassCatalog(
  locale: Locale,
): Promise<SchoolClassCatalog> {
  try {
    return await unstable_cache(
      async () => loadCatalog(locale),
      ["school-class-catalog", locale],
      {
        tags: [CACHE_TAGS.classes],
        revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
      },
    )();
  } catch (error) {
    if (!isMissingRelation(error)) {
      throw error;
    }
    logger.warn("school_class.catalog_unavailable", {
      message: error instanceof Error ? error.message : "missing relation",
    });
    return { published: [], total: 0 };
  }
}
