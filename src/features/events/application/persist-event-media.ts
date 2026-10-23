import "server-only";

import { eq } from "drizzle-orm";

import { getProviders } from "@/config/providers";
import { getDb } from "@/db/client";
import { schoolEvents } from "@/db/schema";
import { EVENT_GALLERY_LIMIT } from "@/features/events/domain/event-rules";
import { isDeletableObjectKey } from "@/features/events/application/event-assets";
import { createId } from "@/lib/id";
import {
  extensionForImageMime,
  validateImageFile,
} from "@/lib/media/image-file";

type MediaState = {
  posterKey: string | null;
  seatingPlanKey: string | null;
  galleryKeys: string[];
};

type MediaChange = {
  poster: File | null;
  seating: File | null;
  galleryFiles: File[];
  removePoster: boolean;
  removeSeating: boolean;
  keptGallery: string[];
  removedGallery: string[];
};

function namedFile(form: FormData, field: string): File | null {
  const value = form.get(field);
  return value instanceof File && value.size > 0 ? value : null;
}

function validateFiles(files: Array<File | null>): string | null {
  for (const file of files) {
    if (!file) {
      continue;
    }
    const validationError = validateImageFile(file);
    if (validationError) {
      return validationError;
    }
  }
  return null;
}

async function storeImage(
  eventId: string,
  folder: string,
  file: File,
): Promise<string> {
  const id = createId();
  const objectKey = `uploads/events/${eventId}/${folder}/${id}.${extensionForImageMime(file.type)}`;
  await getProviders().storage.putObject({
    objectKey,
    body: Buffer.from(await file.arrayBuffer()),
    contentType: file.type,
  });
  return objectKey;
}

async function deleteStoredKey(key: string | null): Promise<void> {
  if (!key || !isDeletableObjectKey(key)) {
    return;
  }
  await getProviders().storage.deleteObject(key);
}

async function nextSingleKey(
  eventId: string,
  folder: string,
  current: string | null,
  file: File | null,
  remove: boolean,
): Promise<string | null> {
  if (file) {
    const key = await storeImage(eventId, folder, file);
    await deleteStoredKey(current);
    return key;
  }
  if (remove) {
    await deleteStoredKey(current);
    return null;
  }
  return current;
}

async function writeMedia(
  eventId: string,
  current: MediaState,
  change: MediaChange,
): Promise<MediaState> {
  const posterKey = await nextSingleKey(
    eventId,
    "poster",
    current.posterKey,
    change.poster,
    change.removePoster,
  );
  const seatingPlanKey = await nextSingleKey(
    eventId,
    "seating",
    current.seatingPlanKey,
    change.seating,
    change.removeSeating,
  );
  const added: string[] = [];
  for (const file of change.galleryFiles) {
    added.push(await storeImage(eventId, "gallery", file));
  }
  await Promise.all(change.removedGallery.map((key) => deleteStoredKey(key)));
  return {
    posterKey,
    seatingPlanKey,
    galleryKeys: [...change.keptGallery, ...added],
  };
}

function readChange(current: MediaState, form: FormData): MediaChange | { error: string } {
  const poster = namedFile(form, "poster");
  const seating = namedFile(form, "seating");
  const galleryFiles = form
    .getAll("gallery")
    .filter((value): value is File => value instanceof File && value.size > 0);
  const removeGallery = new Set(
    form
      .getAll("removeGallery")
      .map((value) => String(value))
      .filter((value) => value.length > 0),
  );
  const validationError = validateFiles([poster, seating, ...galleryFiles]);
  if (validationError) {
    return { error: validationError };
  }

  const keptGallery = current.galleryKeys.filter((key) => !removeGallery.has(key));
  if (keptGallery.length + galleryFiles.length > EVENT_GALLERY_LIMIT) {
    return {
      error: `An event can have up to ${EVENT_GALLERY_LIMIT} gallery images.`,
    };
  }

  return {
    poster,
    seating,
    galleryFiles,
    removePoster: form.get("removePoster") === "1",
    removeSeating: form.get("removeSeating") === "1",
    keptGallery,
    removedGallery: current.galleryKeys.filter((key) => removeGallery.has(key)),
  };
}

/** Uploads poster, seating plan, and gallery images for one event. */
export async function applyEventMedia(
  eventId: string,
  current: MediaState,
  form: FormData | undefined,
): Promise<{ error: string | null }> {
  if (!form) {
    return { error: null };
  }

  const change = readChange(current, form);
  if ("error" in change) {
    return { error: change.error };
  }

  const next = await writeMedia(eventId, current, change);
  await getDb()
    .update(schoolEvents)
    .set({
      posterKey: next.posterKey,
      seatingPlanKey: next.seatingPlanKey,
      galleryKeys: next.galleryKeys,
      updatedAt: new Date(),
    })
    .where(eq(schoolEvents.id, eventId));

  return { error: null };
}
