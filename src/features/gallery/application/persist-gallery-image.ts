import "server-only";

import { eq } from "drizzle-orm";

import { getProviders } from "@/config/providers";
import { getDb } from "@/db/client";
import { schoolGalleryItems } from "@/db/schema";
import { createId } from "@/lib/id";
import {
  extensionForImageMime,
  validateImageFile,
} from "@/lib/media/image-file";
import { mediaPublicUrl } from "@/lib/media/public-url";

/** Resolves a stored image key or an already-public path. */
export function resolveGalleryImageUrl(key: string | null): string | null {
  if (!key) {
    return null;
  }
  if (
    key.startsWith("/") ||
    key.startsWith("http://") ||
    key.startsWith("https://")
  ) {
    return key;
  }
  return mediaPublicUrl(key);
}

function isDeletableObjectKey(key: string): boolean {
  return (
    !key.startsWith("/") &&
    !key.startsWith("http://") &&
    !key.startsWith("https://")
  );
}

function namedFile(form: FormData, field: string): File | null {
  const value = form.get(field);
  return value instanceof File && value.size > 0 ? value : null;
}

async function storeImage(itemId: string, file: File): Promise<string> {
  const objectKey = `uploads/gallery/${itemId}/image/${createId()}.${extensionForImageMime(file.type)}`;
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

async function nextImageKey(
  itemId: string,
  current: string | null,
  file: File | null,
  remove: boolean,
): Promise<string | null> {
  if (file) {
    const key = await storeImage(itemId, file);
    await deleteStoredKey(current);
    return key;
  }
  if (remove) {
    await deleteStoredKey(current);
    return null;
  }
  return current;
}

/** Uploads or removes the still image for one gallery item. */
export async function applyGalleryImage(
  itemId: string,
  currentKey: string | null,
  form: FormData | undefined,
): Promise<{ error: string | null }> {
  if (!form) {
    return { error: null };
  }

  const file = namedFile(form, "image");
  if (file) {
    const validationError = validateImageFile(file);
    if (validationError) {
      return { error: validationError };
    }
  }

  const nextKey = await nextImageKey(
    itemId,
    currentKey,
    file,
    form.get("removeImage") === "1",
  );
  if (nextKey === currentKey) {
    return { error: null };
  }

  await getDb()
    .update(schoolGalleryItems)
    .set({ imageKey: nextKey, updatedAt: new Date() })
    .where(eq(schoolGalleryItems.id, itemId));

  return { error: null };
}
