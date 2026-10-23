"use server";

import { and, eq, isNull } from "drizzle-orm";

import { auditLogs, schoolGalleryItems } from "@/db/schema";
import { withTransaction } from "@/db/transaction";
import {
  galleryAuditDiff,
  galleryValues,
  revalidateSchoolGallery,
  validatedGalleryItem,
  type SavedGalleryItem,
} from "@/features/gallery/application/gallery-command";
import { applyGalleryImage } from "@/features/gallery/application/persist-gallery-image";
import { schoolGalleryIdSchema } from "@/features/gallery/schemas/gallery";
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
    targetType: "school_gallery_item",
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

function savedDiff(saved: SavedGalleryItem): Record<string, unknown> {
  return galleryAuditDiff(
    saved.translations,
    saved.data.status,
    saved.data.category,
    saved.data.kind,
  );
}

async function writeGalleryUpdate(
  itemId: string,
  actorId: string,
  saved: SavedGalleryItem,
): Promise<{ imageKey: string | null }> {
  return withTransaction(async (tx) => {
    const [row] = await tx
      .select()
      .from(schoolGalleryItems)
      .where(and(eq(schoolGalleryItems.id, itemId), isNull(schoolGalleryItems.deletedAt)))
      .for("update")
      .limit(1);
    if (!row) {
      throw new Error("NOT_FOUND");
    }

    await tx
      .update(schoolGalleryItems)
      .set(galleryValues(saved))
      .where(eq(schoolGalleryItems.id, itemId));
    await tx.insert(auditLogs).values(
      auditRow({
        actorUserId: actorId,
        action: "school_gallery_item.update",
        targetId: itemId,
        beforeDiff: galleryAuditDiff(row.translations, row.status, row.category, row.kind),
        afterDiff: savedDiff(saved),
      }),
    );
    return { imageKey: row.imageKey };
  });
}

/** Creates a gallery item and an optional still image. */
export async function createSchoolGalleryItemAction(
  locale: string,
  raw: unknown,
  mediaForm?: FormData,
): Promise<Result<{ id: string }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  const actor = await requireAdmin(locale);
  const validated = validatedGalleryItem(raw);
  if (!validated.ok) {
    return validated;
  }

  const id = createId();
  try {
    await withTransaction(async (tx) => {
      await tx.insert(schoolGalleryItems).values({
        id,
        ...galleryValues(validated.value),
      });
      await tx.insert(auditLogs).values(
        auditRow({
          actorUserId: actor.id,
          action: "school_gallery_item.create",
          targetId: id,
          afterDiff: savedDiff(validated.value),
        }),
      );
    });
  } catch (error) {
    logFailure("school_gallery_item.create_failed", error);
    return err("GALLERY_CREATE_FAILED", "Unable to create gallery item.");
  }

  const media = await applyGalleryImage(id, null, mediaForm);
  revalidateSchoolGallery(locale);
  if (media.error) {
    return err("VALIDATION_ERROR", media.error);
  }
  return ok({ id });
}

/** Updates gallery copy, media kind, and still image. */
export async function updateSchoolGalleryItemAction(
  locale: string,
  galleryItemId: string,
  raw: unknown,
  mediaForm?: FormData,
): Promise<Result<{ id: string }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }
  if (!schoolGalleryIdSchema.safeParse({ galleryItemId }).success) {
    return err("VALIDATION_ERROR", "Invalid gallery item.");
  }

  const actor = await requireAdmin(locale);
  const validated = validatedGalleryItem(raw);
  if (!validated.ok) {
    return validated;
  }

  try {
    const existing = await writeGalleryUpdate(galleryItemId, actor.id, validated.value);
    const media = await applyGalleryImage(galleryItemId, existing.imageKey, mediaForm);
    revalidateSchoolGallery(locale);
    if (media.error) {
      return err("VALIDATION_ERROR", media.error);
    }
    return ok({ id: galleryItemId });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return err("NOT_FOUND", "Gallery item not found.");
    }
    logFailure("school_gallery_item.update_failed", error);
    return err("GALLERY_UPDATE_FAILED", "Unable to update gallery item.");
  }
}

async function archiveGalleryItem(itemId: string, actorId: string): Promise<void> {
  await withTransaction(async (tx) => {
    const [row] = await tx
      .select({
        id: schoolGalleryItems.id,
        status: schoolGalleryItems.status,
        category: schoolGalleryItems.category,
        kind: schoolGalleryItems.kind,
        translations: schoolGalleryItems.translations,
      })
      .from(schoolGalleryItems)
      .where(and(eq(schoolGalleryItems.id, itemId), isNull(schoolGalleryItems.deletedAt)))
      .for("update")
      .limit(1);
    if (!row) {
      throw new Error("NOT_FOUND");
    }
    await tx
      .update(schoolGalleryItems)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(schoolGalleryItems.id, row.id));
    await tx.insert(auditLogs).values(
      auditRow({
        actorUserId: actorId,
        action: "school_gallery_item.delete",
        targetId: row.id,
        beforeDiff: galleryAuditDiff(row.translations, row.status, row.category, row.kind),
      }),
    );
  });
}

/** Soft-deletes a gallery item so the public site stops showing it. */
export async function deleteSchoolGalleryItemAction(
  locale: string,
  raw: unknown,
): Promise<Result<{ id: string }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  const parsed = schoolGalleryIdSchema.safeParse(raw);
  if (!parsed.success) {
    return err("VALIDATION_ERROR", "Invalid delete payload.");
  }

  const actor = await requireAdmin(locale);
  try {
    await archiveGalleryItem(parsed.data.galleryItemId, actor.id);
    revalidateSchoolGallery(locale);
    return ok({ id: parsed.data.galleryItemId });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return err("NOT_FOUND", "Gallery item not found.");
    }
    logFailure("school_gallery_item.delete_failed", error);
    return err("GALLERY_DELETE_FAILED", "Unable to delete gallery item.");
  }
}
