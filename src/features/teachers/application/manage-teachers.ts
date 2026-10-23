"use server";

import { and, eq, isNull } from "drizzle-orm";

import { auditLogs, schoolTeachers } from "@/db/schema";
import { withTransaction } from "@/db/transaction";
import { applyTeacherPortrait } from "@/features/teachers/application/persist-teacher-portrait";
import {
  revalidateSchoolTeachers,
  teacherAuditDiff,
  teacherValues,
  validatedTeacher,
  type SavedTeacher,
} from "@/features/teachers/application/teacher-command";
import {
  schoolTeacherIdSchema,
  type SchoolTeacherIdInput,
} from "@/features/teachers/schemas/teacher";
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
    targetType: "school_teacher",
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

async function writeTeacherUpdate(
  teacherId: string,
  actorId: string,
  saved: SavedTeacher,
): Promise<{ portraitKey: string | null }> {
  return withTransaction(async (tx) => {
    const [row] = await tx
      .select()
      .from(schoolTeachers)
      .where(and(eq(schoolTeachers.id, teacherId), isNull(schoolTeachers.deletedAt)))
      .for("update")
      .limit(1);
    if (!row) {
      throw new Error("NOT_FOUND");
    }

    await tx
      .update(schoolTeachers)
      .set(teacherValues(saved))
      .where(eq(schoolTeachers.id, teacherId));
    await tx.insert(auditLogs).values(
      auditRow({
        actorUserId: actorId,
        action: "school_teacher.update",
        targetId: teacherId,
        beforeDiff: teacherAuditDiff(row.translations, row.status, row.role),
        afterDiff: teacherAuditDiff(
          saved.translations,
          saved.data.status,
          saved.data.role,
        ),
      }),
    );
    return { portraitKey: row.portraitKey };
  });
}

/** Creates a teacher and an optional portrait. */
export async function createSchoolTeacherAction(
  locale: string,
  raw: unknown,
  mediaForm?: FormData,
): Promise<Result<{ id: string }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  const actor = await requireAdmin(locale);
  const validated = validatedTeacher(raw);
  if (!validated.ok) {
    return validated;
  }

  const id = createId();
  try {
    await withTransaction(async (tx) => {
      await tx.insert(schoolTeachers).values({
        id,
        ...teacherValues(validated.value),
      });
      await tx.insert(auditLogs).values(
        auditRow({
          actorUserId: actor.id,
          action: "school_teacher.create",
          targetId: id,
          afterDiff: teacherAuditDiff(
            validated.value.translations,
            validated.value.data.status,
            validated.value.data.role,
          ),
        }),
      );
    });
  } catch (error) {
    logFailure("school_teacher.create_failed", error);
    return err("TEACHER_CREATE_FAILED", "Unable to create teacher.");
  }

  const media = await applyTeacherPortrait(id, null, mediaForm);
  revalidateSchoolTeachers(locale);
  if (media.error) {
    return err("VALIDATION_ERROR", media.error);
  }
  return ok({ id });
}

/** Updates teacher copy, classes, and portrait. */
export async function updateSchoolTeacherAction(
  locale: string,
  teacherId: string,
  raw: unknown,
  mediaForm?: FormData,
): Promise<Result<{ id: string }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }
  if (!schoolTeacherIdSchema.safeParse({ teacherId }).success) {
    return err("VALIDATION_ERROR", "Invalid teacher.");
  }

  const actor = await requireAdmin(locale);
  const validated = validatedTeacher(raw);
  if (!validated.ok) {
    return validated;
  }

  try {
    const existing = await writeTeacherUpdate(teacherId, actor.id, validated.value);
    const media = await applyTeacherPortrait(
      teacherId,
      existing.portraitKey,
      mediaForm,
    );
    revalidateSchoolTeachers(locale);
    if (media.error) {
      return err("VALIDATION_ERROR", media.error);
    }
    return ok({ id: teacherId });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return err("NOT_FOUND", "Teacher not found.");
    }
    logFailure("school_teacher.update_failed", error);
    return err("TEACHER_UPDATE_FAILED", "Unable to update teacher.");
  }
}

async function archiveTeacher(
  teacherId: string,
  actorId: string,
): Promise<void> {
  await withTransaction(async (tx) => {
    const [row] = await tx
      .select({
        id: schoolTeachers.id,
        status: schoolTeachers.status,
        role: schoolTeachers.role,
        translations: schoolTeachers.translations,
      })
      .from(schoolTeachers)
      .where(and(eq(schoolTeachers.id, teacherId), isNull(schoolTeachers.deletedAt)))
      .for("update")
      .limit(1);
    if (!row) {
      throw new Error("NOT_FOUND");
    }
    await tx
      .update(schoolTeachers)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(schoolTeachers.id, row.id));
    await tx.insert(auditLogs).values(
      auditRow({
        actorUserId: actorId,
        action: "school_teacher.delete",
        targetId: row.id,
        beforeDiff: teacherAuditDiff(row.translations, row.status, row.role),
      }),
    );
  });
}

async function toggleTeacherFeatured(
  teacherId: string,
  actorId: string,
): Promise<boolean> {
  return withTransaction(async (tx) => {
    const [row] = await tx
      .select({
        id: schoolTeachers.id,
        isFeatured: schoolTeachers.isFeatured,
      })
      .from(schoolTeachers)
      .where(and(eq(schoolTeachers.id, teacherId), isNull(schoolTeachers.deletedAt)))
      .for("update")
      .limit(1);
    if (!row) {
      throw new Error("NOT_FOUND");
    }
    const isFeatured = !row.isFeatured;
    await tx
      .update(schoolTeachers)
      .set({ isFeatured, updatedAt: new Date() })
      .where(eq(schoolTeachers.id, row.id));
    await tx.insert(auditLogs).values(
      auditRow({
        actorUserId: actorId,
        action: "school_teacher.feature",
        targetId: row.id,
        beforeDiff: { isFeatured: row.isFeatured },
        afterDiff: { isFeatured },
      }),
    );
    return isFeatured;
  });
}

/** Toggles whether a published teacher appears in the home coaches block. */
export async function toggleSchoolTeacherFeaturedAction(
  locale: string,
  raw: SchoolTeacherIdInput,
): Promise<Result<{ isFeatured: boolean }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  const parsed = schoolTeacherIdSchema.safeParse(raw);
  if (!parsed.success) {
    return err("VALIDATION_ERROR", "Invalid teacher payload.");
  }

  const actor = await requireAdmin(locale);
  try {
    const isFeatured = await toggleTeacherFeatured(parsed.data.teacherId, actor.id);
    revalidateSchoolTeachers(locale);
    return ok({ isFeatured });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return err("NOT_FOUND", "Teacher not found.");
    }
    logFailure("school_teacher.feature_failed", error);
    return err("TEACHER_FEATURE_FAILED", "Unable to update the home page flag.");
  }
}

/** Soft-deletes a teacher so the public site stops showing them. */
export async function deleteSchoolTeacherAction(
  locale: string,
  raw: SchoolTeacherIdInput,
): Promise<Result<{ id: string }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  const parsed = schoolTeacherIdSchema.safeParse(raw);
  if (!parsed.success) {
    return err("VALIDATION_ERROR", "Invalid delete payload.");
  }

  const actor = await requireAdmin(locale);
  try {
    await archiveTeacher(parsed.data.teacherId, actor.id);
    revalidateSchoolTeachers(locale);
    return ok({ id: parsed.data.teacherId });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return err("NOT_FOUND", "Teacher not found.");
    }
    logFailure("school_teacher.delete_failed", error);
    return err("TEACHER_DELETE_FAILED", "Unable to delete teacher.");
  }
}
