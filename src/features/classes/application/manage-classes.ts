"use server";

import { and, eq, isNull } from "drizzle-orm";

import { auditLogs, schoolClasses } from "@/db/schema";
import { withTransaction } from "@/db/transaction";
import {
  classAuditDiff,
  classValues,
  revalidateSchoolClasses,
  validatedCreateClass,
  validatedUpdateClass,
  type SavedClass,
  type SavedNewClass,
} from "@/features/classes/application/class-command";
import {
  schoolClassIdSchema,
  type SchoolClassIdInput,
} from "@/features/classes/schemas/class-program";
import { requireAdmin } from "@/lib/auth/policies";
import { createId } from "@/lib/id";
import { isLocale } from "@/lib/i18n/config";
import { logger } from "@/lib/observability/logger";
import { err, ok, type Result } from "@/lib/result";

function auditRow(input: {
  actorUserId: string;
  action: string;
  targetId: string;
  beforeDiff?: Record<string, unknown>;
  afterDiff?: Record<string, unknown>;
}) {
  return {
    id: createId(),
    actorUserId: input.actorUserId,
    action: input.action,
    targetType: "school_class",
    targetId: input.targetId,
    beforeDiff: input.beforeDiff,
    afterDiff: input.afterDiff,
    correlationId: createId(),
  };
}

function logFailure(action: string, error: unknown): void {
  logger.error(action, {
    message: error instanceof Error ? error.message : "unknown",
  });
}

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  if ("code" in error && error.code === "23505") {
    return true;
  }
  if ("cause" in error) {
    return isUniqueViolation(error.cause);
  }
  return false;
}

async function insertClass(
  id: string,
  actorId: string,
  saved: SavedNewClass,
): Promise<void> {
  const code = saved.data.code;
  await withTransaction(async (tx) => {
    await tx.insert(schoolClasses).values({
      id,
      code,
      ...classValues(saved),
    });
    await tx.insert(auditLogs).values(
      auditRow({
        actorUserId: actorId,
        action: "school_class.create",
        targetId: id,
        afterDiff: classAuditDiff(saved.translations, saved.data.status, code),
      }),
    );
  });
}

function duplicateCode(): Result<never> {
  return err("CLASS_CODE_TAKEN", "That class code is already in use.");
}

/** Creates a class. The code stays stable so teachers can keep linking to it. */
export async function createSchoolClassAction(
  locale: string,
  raw: unknown,
): Promise<Result<{ id: string }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  const actor = await requireAdmin(locale);
  const validated = validatedCreateClass(raw);
  if (!validated.ok) {
    return validated;
  }

  const id = createId();
  try {
    await insertClass(id, actor.id, validated.value);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return duplicateCode();
    }
    logFailure("school_class.create_failed", error);
    return err("CLASS_CREATE_FAILED", "Unable to create class.");
  }

  revalidateSchoolClasses(locale);
  return ok({ id });
}

async function writeClassUpdate(
  classId: string,
  actorId: string,
  saved: SavedClass,
): Promise<void> {
  await withTransaction(async (tx) => {
    const [row] = await tx
      .select()
      .from(schoolClasses)
      .where(and(eq(schoolClasses.id, classId), isNull(schoolClasses.deletedAt)))
      .for("update")
      .limit(1);
    if (!row) {
      throw new Error("NOT_FOUND");
    }

    await tx
      .update(schoolClasses)
      .set(classValues(saved))
      .where(eq(schoolClasses.id, classId));
    await tx.insert(auditLogs).values(
      auditRow({
        actorUserId: actorId,
        action: "school_class.update",
        targetId: classId,
        beforeDiff: classAuditDiff(row.translations, row.status, row.code),
        afterDiff: classAuditDiff(
          saved.translations,
          saved.data.status,
          row.code,
        ),
      }),
    );
  });
}

/** Updates class copy and filters. The public code does not change. */
export async function updateSchoolClassAction(
  locale: string,
  classId: string,
  raw: unknown,
): Promise<Result<{ id: string }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }
  if (!schoolClassIdSchema.safeParse({ classId }).success) {
    return err("VALIDATION_ERROR", "Invalid class.");
  }

  const actor = await requireAdmin(locale);
  const validated = validatedUpdateClass(raw);
  if (!validated.ok) {
    return validated;
  }

  try {
    await writeClassUpdate(classId, actor.id, validated.value);
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return err("NOT_FOUND", "Class not found.");
    }
    logFailure("school_class.update_failed", error);
    return err("CLASS_UPDATE_FAILED", "Unable to update class.");
  }

  revalidateSchoolClasses(locale);
  return ok({ id: classId });
}

async function archiveClass(classId: string, actorId: string): Promise<void> {
  await withTransaction(async (tx) => {
    const [row] = await tx
      .select({
        id: schoolClasses.id,
        code: schoolClasses.code,
        status: schoolClasses.status,
        translations: schoolClasses.translations,
      })
      .from(schoolClasses)
      .where(and(eq(schoolClasses.id, classId), isNull(schoolClasses.deletedAt)))
      .for("update")
      .limit(1);
    if (!row) {
      throw new Error("NOT_FOUND");
    }
    await tx
      .update(schoolClasses)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(schoolClasses.id, row.id));
    await tx.insert(auditLogs).values(
      auditRow({
        actorUserId: actorId,
        action: "school_class.delete",
        targetId: row.id,
        beforeDiff: classAuditDiff(row.translations, row.status, row.code),
      }),
    );
  });
}

/** Soft-deletes a class so the public catalog stops showing it. */
export async function deleteSchoolClassAction(
  locale: string,
  raw: SchoolClassIdInput,
): Promise<Result<{ id: string }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  const parsed = schoolClassIdSchema.safeParse(raw);
  if (!parsed.success) {
    return err("VALIDATION_ERROR", "Invalid delete payload.");
  }

  const actor = await requireAdmin(locale);
  try {
    await archiveClass(parsed.data.classId, actor.id);
    revalidateSchoolClasses(locale);
    return ok({ id: parsed.data.classId });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return err("NOT_FOUND", "Class not found.");
    }
    logFailure("school_class.delete_failed", error);
    return err("CLASS_DELETE_FAILED", "Unable to delete class.");
  }
}
