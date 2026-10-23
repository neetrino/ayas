import "server-only";

import { and, eq, inArray } from "drizzle-orm";

import { getProviders } from "@/config/providers";
import { getDb } from "@/db/client";
import { mediaAssets } from "@/db/schema";
import { BLOG_GALLERY_LIMIT } from "@/features/blog/domain/blog-article";
import { createId } from "@/lib/id";
import {
  extensionForImageMime,
  validateImageFile,
} from "@/lib/media/image-file";

/** Saves a cover image for a blog post via object storage. */
export async function persistBlogCoverImage(
  blogPostId: string,
  file: File,
): Promise<{ error: string | null }> {
  const validationError = validateImageFile(file);
  if (validationError) {
    return { error: validationError };
  }

  const db = getDb();
  const storage = getProviders().storage;
  const existing = await db
    .select({ objectKey: mediaAssets.objectKey })
    .from(mediaAssets)
    .where(
      and(
        eq(mediaAssets.blogPostId, blogPostId),
        eq(mediaAssets.role, "COVER"),
      ),
    );

  await db
    .delete(mediaAssets)
    .where(
      and(
        eq(mediaAssets.blogPostId, blogPostId),
        eq(mediaAssets.role, "COVER"),
      ),
    );
  await Promise.all(existing.map((row) => storage.deleteObject(row.objectKey)));

  const id = createId();
  const objectKey = `uploads/blog/${blogPostId}/${id}.${extensionForImageMime(file.type)}`;
  await storage.putObject({
    objectKey,
    body: Buffer.from(await file.arrayBuffer()),
    contentType: file.type,
  });

  await db.insert(mediaAssets).values({
    id,
    objectKey,
    mimeType: file.type,
    byteSize: file.size,
    uploadStatus: "READY",
    role: "COVER",
    sortOrder: 0,
    isPrimary: true,
    blogPostId,
  });

  return { error: null };
}

async function removeGalleryRows(
  blogPostId: string,
  removeIds: string[],
): Promise<number> {
  if (removeIds.length === 0) {
    return 0;
  }

  const db = getDb();
  const storage = getProviders().storage;
  const rows = await db
    .select({ id: mediaAssets.id, objectKey: mediaAssets.objectKey })
    .from(mediaAssets)
    .where(
      and(
        eq(mediaAssets.blogPostId, blogPostId),
        eq(mediaAssets.role, "GALLERY"),
        inArray(mediaAssets.id, removeIds),
      ),
    );

  if (rows.length === 0) {
    return 0;
  }

  await db.delete(mediaAssets).where(
    inArray(
      mediaAssets.id,
      rows.map((row) => row.id),
    ),
  );
  await Promise.all(rows.map((row) => storage.deleteObject(row.objectKey)));
  return rows.length;
}

async function insertGalleryFiles(
  blogPostId: string,
  files: File[],
  sortStart: number,
): Promise<void> {
  const db = getDb();
  const storage = getProviders().storage;
  let sortOrder = sortStart;

  for (const file of files) {
    const id = createId();
    const objectKey = `uploads/blog/${blogPostId}/gallery/${id}.${extensionForImageMime(file.type)}`;
    await storage.putObject({
      objectKey,
      body: Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
    });
    await db.insert(mediaAssets).values({
      id,
      objectKey,
      mimeType: file.type,
      byteSize: file.size,
      uploadStatus: "READY",
      role: "GALLERY",
      sortOrder,
      isPrimary: false,
      blogPostId,
    });
    sortOrder += 1;
  }
}

/** Adds and removes gallery images for one blog post. */
export async function syncBlogGalleryImages(
  blogPostId: string,
  files: File[],
  removeIds: string[],
): Promise<{ error: string | null }> {
  const uploads = files.filter((file) => file.size > 0);
  for (const file of uploads) {
    const validationError = validateImageFile(file);
    if (validationError) {
      return { error: validationError };
    }
  }

  if (uploads.length === 0 && removeIds.length === 0) {
    return { error: null };
  }

  const existing = await getDb()
    .select({ id: mediaAssets.id })
    .from(mediaAssets)
    .where(
      and(
        eq(mediaAssets.blogPostId, blogPostId),
        eq(mediaAssets.role, "GALLERY"),
      ),
    );
  const removeSet = new Set(removeIds);
  const removableCount = existing.filter((row) => removeSet.has(row.id)).length;
  const remaining = existing.length - removableCount;
  if (remaining + uploads.length > BLOG_GALLERY_LIMIT) {
    return {
      error: `A post can have up to ${BLOG_GALLERY_LIMIT} gallery images.`,
    };
  }

  await removeGalleryRows(blogPostId, removeIds);
  await insertGalleryFiles(blogPostId, uploads, remaining);
  return { error: null };
}

/** Removes cover media for a blog post and deletes the stored object. */
export async function removeBlogCoverImage(blogPostId: string): Promise<void> {
  const db = getDb();
  const storage = getProviders().storage;
  const existing = await db
    .select({ objectKey: mediaAssets.objectKey })
    .from(mediaAssets)
    .where(
      and(
        eq(mediaAssets.blogPostId, blogPostId),
        eq(mediaAssets.role, "COVER"),
      ),
    );

  await db
    .delete(mediaAssets)
    .where(
      and(
        eq(mediaAssets.blogPostId, blogPostId),
        eq(mediaAssets.role, "COVER"),
      ),
    );
  await Promise.all(existing.map((row) => storage.deleteObject(row.objectKey)));
}
