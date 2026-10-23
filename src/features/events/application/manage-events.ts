"use server";

import { and, eq, isNull } from "drizzle-orm";

import { auditLogs, schoolEvents } from "@/db/schema";
import { withTransaction } from "@/db/transaction";
import {
  eventValues,
  isSlugConflict,
  revalidateSchoolEvents,
  translationSlugs,
  validatedEvent,
} from "@/features/events/application/event-command";
import { applyEventMedia } from "@/features/events/application/persist-event-media";
import { schoolEventIdSchema, type SchoolEventIdInput } from "@/features/events/schemas/event";
import { requireAdmin } from "@/lib/auth/policies";
import { createId } from "@/lib/id";
import { isLocale } from "@/lib/i18n/config";
import { logger } from "@/lib/observability/logger";
import { err, ok, type Result } from "@/lib/result";

/** Creates a school event and optional poster, seating plan, and gallery. */
export async function createSchoolEventAction(
  locale: string,
  raw: unknown,
  mediaForm?: FormData,
): Promise<Result<{ id: string }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  const actor = await requireAdmin(locale);
  const validated = validatedEvent(raw);
  if (!validated.ok) {
    return validated;
  }

  const id = createId();
  try {
    await withTransaction(async (tx) => {
      await tx.insert(schoolEvents).values({
        id,
        ...eventValues(validated.value),
      });
      await tx.insert(auditLogs).values({
        id: createId(),
        actorUserId: actor.id,
        action: "school_event.create",
        targetType: "school_event",
        targetId: id,
        afterDiff: {
          status: validated.value.data.status,
          slugs: translationSlugs(validated.value.translations),
        },
        correlationId: createId(),
      });
    });
  } catch (error) {
    if (isSlugConflict(error)) {
      return err("SLUG_TAKEN", "That slug is already in use.");
    }
    logger.error("school_event.create_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return err("EVENT_CREATE_FAILED", "Unable to create event.");
  }

  const media = await applyEventMedia(
    id,
    { posterKey: null, seatingPlanKey: null, galleryKeys: [] },
    mediaForm,
  );
  revalidateSchoolEvents(locale, translationSlugs(validated.value.translations));
  if (media.error) {
    return err("VALIDATION_ERROR", media.error);
  }
  return ok({ id });
}

/** Updates event copy, schedule, and media. */
export async function updateSchoolEventAction(
  locale: string,
  eventId: string,
  raw: unknown,
  mediaForm?: FormData,
): Promise<Result<{ id: string }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }
  if (!schoolEventIdSchema.safeParse({ eventId }).success) {
    return err("VALIDATION_ERROR", "Invalid event.");
  }

  const actor = await requireAdmin(locale);
  const validated = validatedEvent(raw);
  if (!validated.ok) {
    return validated;
  }

  try {
    const existing = await withTransaction(async (tx) => {
      const [row] = await tx
        .select()
        .from(schoolEvents)
        .where(and(eq(schoolEvents.id, eventId), isNull(schoolEvents.deletedAt)))
        .for("update")
        .limit(1);
      if (!row) {
        throw new Error("NOT_FOUND");
      }

      await tx
        .update(schoolEvents)
        .set(eventValues(validated.value))
        .where(eq(schoolEvents.id, eventId));
      await tx.insert(auditLogs).values({
        id: createId(),
        actorUserId: actor.id,
        action: "school_event.update",
        targetType: "school_event",
        targetId: eventId,
        beforeDiff: { status: row.status, slugs: translationSlugs(row.translations) },
        afterDiff: {
          status: validated.value.data.status,
          slugs: translationSlugs(validated.value.translations),
        },
        correlationId: createId(),
      });
      return row;
    });

    const media = await applyEventMedia(
      eventId,
      {
        posterKey: existing.posterKey,
        seatingPlanKey: existing.seatingPlanKey,
        galleryKeys: existing.galleryKeys,
      },
      mediaForm,
    );
    revalidateSchoolEvents(locale, [
      ...translationSlugs(existing.translations),
      ...translationSlugs(validated.value.translations),
    ]);
    if (media.error) {
      return err("VALIDATION_ERROR", media.error);
    }
    return ok({ id: eventId });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return err("NOT_FOUND", "Event not found.");
    }
    if (isSlugConflict(error)) {
      return err("SLUG_TAKEN", "That slug is already in use.");
    }
    logger.error("school_event.update_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return err("EVENT_UPDATE_FAILED", "Unable to update event.");
  }
}

/** Soft-deletes an event so the public site stops showing it. */
export async function deleteSchoolEventAction(
  locale: string,
  raw: SchoolEventIdInput,
): Promise<Result<{ id: string }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  const parsed = schoolEventIdSchema.safeParse(raw);
  if (!parsed.success) {
    return err("VALIDATION_ERROR", "Invalid delete payload.");
  }

  const actor = await requireAdmin(locale);
  try {
    const existing = await withTransaction(async (tx) => {
      const [row] = await tx
        .select()
        .from(schoolEvents)
        .where(
          and(
            eq(schoolEvents.id, parsed.data.eventId),
            isNull(schoolEvents.deletedAt),
          ),
        )
        .for("update")
        .limit(1);
      if (!row) {
        throw new Error("NOT_FOUND");
      }
      await tx
        .update(schoolEvents)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(schoolEvents.id, row.id));
      await tx.insert(auditLogs).values({
        id: createId(),
        actorUserId: actor.id,
        action: "school_event.delete",
        targetType: "school_event",
        targetId: row.id,
        beforeDiff: { status: row.status, slugs: translationSlugs(row.translations) },
        correlationId: createId(),
      });
      return row;
    });

    revalidateSchoolEvents(locale, translationSlugs(existing.translations));
    return ok({ id: existing.id });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return err("NOT_FOUND", "Event not found.");
    }
    logger.error("school_event.delete_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return err("EVENT_DELETE_FAILED", "Unable to delete event.");
  }
}
