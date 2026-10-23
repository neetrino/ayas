import "server-only";

import {
  and,
  asc,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  or,
  sql,
} from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { cache } from "react";

import { getDb } from "@/db/client";
import { blogPosts, mediaAssets } from "@/db/schema";
import type { BlogCategory } from "@/features/blog/domain/blog-article";
import {
  resolveBlogTranslation,
  type BlogLocaleCopy,
  type BlogPostStatus,
  type BlogTranslations,
} from "@/features/blog/domain/blog-rules";
import {
  CACHE_TAGS,
  PUBLIC_CACHE_REVALIDATE_SECONDS,
} from "@/lib/cache/tags";
import { locales, type Locale } from "@/lib/i18n/config";
import { mediaPublicUrl } from "@/lib/media/public-url";

export type AdminBlogPost = typeof blogPosts.$inferSelect;

export type BlogGalleryItem = {
  id: string;
  url: string;
};

export type AdminBlogListItem = {
  id: string;
  status: BlogPostStatus;
  category: BlogCategory;
  publishedAt: string | null;
  title: string;
  excerpt: string;
  slug: string;
  path: string;
  coverUrl: string | null;
  videoUrl: string | null;
  gallery: BlogGalleryItem[];
  relatedPostIds: string[];
  tags: string[];
  translations: BlogTranslations;
};

export type StorefrontBlogPostListItem = {
  id: string;
  category: BlogCategory;
  /** ISO-8601 string — Date cannot survive `unstable_cache` JSON round-trip. */
  publishedAt: string | null;
  tags: string[];
  coverUrl: string | null;
  copy: BlogLocaleCopy;
};

export type StorefrontBlogPost = StorefrontBlogPostListItem & {
  videoUrl: string | null;
  gallery: BlogGalleryItem[];
  relatedPostIds: string[];
};

function toPublishedAtIso(value: Date | string | null): string | null {
  if (value == null) {
    return null;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

type BlogMediaBundle = {
  coverUrl: string | null;
  gallery: BlogGalleryItem[];
};

function emptyMedia(): BlogMediaBundle {
  return { coverUrl: null, gallery: [] };
}

async function loadBlogMedia(
  blogPostIds: string[],
): Promise<Map<string, BlogMediaBundle>> {
  const images = new Map<string, BlogMediaBundle>();
  for (const id of blogPostIds) {
    images.set(id, emptyMedia());
  }
  if (blogPostIds.length === 0) {
    return images;
  }

  const mediaRows = await getDb()
    .select({
      id: mediaAssets.id,
      blogPostId: mediaAssets.blogPostId,
      objectKey: mediaAssets.objectKey,
      role: mediaAssets.role,
    })
    .from(mediaAssets)
    .where(
      and(
        inArray(mediaAssets.blogPostId, blogPostIds),
        eq(mediaAssets.uploadStatus, "READY"),
        or(
          eq(mediaAssets.role, "COVER"),
          eq(mediaAssets.role, "PRIMARY"),
          eq(mediaAssets.role, "GALLERY"),
          eq(mediaAssets.isPrimary, true),
        ),
      ),
    )
    .orderBy(asc(mediaAssets.sortOrder));

  for (const media of mediaRows) {
    if (!media.blogPostId) continue;
    const bundle = images.get(media.blogPostId) ?? emptyMedia();
    const url = mediaPublicUrl(media.objectKey);
    if (media.role === "GALLERY") {
      bundle.gallery.push({ id: media.id, url });
    } else if (!bundle.coverUrl) {
      bundle.coverUrl = url;
    }
    images.set(media.blogPostId, bundle);
  }

  return images;
}

/** Lists all non-deleted blog posts for admin UI. */
export async function listAdminBlogPosts(
  locale: Locale,
): Promise<AdminBlogListItem[]> {
  const rows = await getDb()
    .select()
    .from(blogPosts)
    .where(isNull(blogPosts.deletedAt))
    .orderBy(desc(blogPosts.updatedAt), desc(blogPosts.createdAt));

  const images = await loadBlogMedia(rows.map((row) => row.id));

  return rows.map((row) => {
    const copy = resolveBlogTranslation(row.translations, locale);
    const slug = copy?.slug ?? "";
    const media = images.get(row.id) ?? emptyMedia();
    return {
      id: row.id,
      status: row.status,
      category: row.category,
      publishedAt: toPublishedAtIso(row.publishedAt)?.slice(0, 10) ?? null,
      title: copy?.title ?? "Untitled",
      excerpt: copy?.excerpt ?? "",
      slug,
      path: slug ? `/blog/${slug}` : "/blog",
      coverUrl: media.coverUrl,
      videoUrl: row.videoUrl,
      gallery: media.gallery,
      relatedPostIds: row.relatedPostIds,
      tags: row.tags,
      translations: row.translations,
    };
  });
}

/** Loads one blog post by id for admin. */
export async function getAdminBlogPostById(
  id: string,
): Promise<AdminBlogPost | null> {
  const [row] = await getDb()
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.id, id), isNull(blogPosts.deletedAt)))
    .limit(1);

  return row ?? null;
}

async function loadPublishedBlogPosts(
  locale: Locale,
): Promise<StorefrontBlogPostListItem[]> {
  const rows = await getDb()
    .select()
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.status, "PUBLISHED"),
        isNull(blogPosts.deletedAt),
        isNotNull(blogPosts.publishedAt),
      ),
    )
    .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt));

  const images = await loadBlogMedia(rows.map((row) => row.id));

  return rows
    .map((row) => {
      const copy = resolveBlogTranslation(row.translations, locale);
      if (!copy) {
        return null;
      }
      return {
        id: row.id,
        category: row.category,
        publishedAt: toPublishedAtIso(row.publishedAt),
        tags: row.tags,
        coverUrl: images.get(row.id)?.coverUrl ?? null,
        copy,
      };
    })
    .filter((row): row is StorefrontBlogPostListItem => row !== null);
}

/** Published blog posts visible on the storefront for a locale. */
export async function listPublishedBlogPosts(
  locale: Locale,
): Promise<StorefrontBlogPostListItem[]> {
  return unstable_cache(
    async () => loadPublishedBlogPosts(locale),
    ["published-blog-posts", locale],
    {
      tags: [CACHE_TAGS.blog],
      revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    },
  )();
}

/** Matches a slug against any locale translation (for locale-switch URLs). */
function blogSlugMatchesAnyLocale(slug: string) {
  return or(
    ...locales.map(
      (loc) => sql`${blogPosts.translations}->${loc}->>'slug' = ${slug}`,
    ),
  );
}

async function loadPublishedBlogPostBySlug(
  locale: Locale,
  slug: string,
): Promise<StorefrontBlogPost | null> {
  const [row] = await getDb()
    .select()
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.status, "PUBLISHED"),
        isNull(blogPosts.deletedAt),
        isNotNull(blogPosts.publishedAt),
        blogSlugMatchesAnyLocale(slug),
      ),
    )
    .limit(1);

  if (!row) {
    return null;
  }

  const copy = resolveBlogTranslation(row.translations, locale);
  if (!copy) {
    return null;
  }

  const images = await loadBlogMedia([row.id]);
  const media = images.get(row.id) ?? emptyMedia();

  return {
    id: row.id,
    category: row.category,
    publishedAt: toPublishedAtIso(row.publishedAt),
    tags: row.tags,
    coverUrl: media.coverUrl,
    videoUrl: row.videoUrl,
    gallery: media.gallery,
    relatedPostIds: row.relatedPostIds,
    copy,
  };
}

/**
 * Loads one published blog post by slug.
 * Accepts any locale's slug so language switching can resolve the same post,
 * then the page redirects to the canonical slug for the active locale.
 */
export const getPublishedBlogPostBySlug = cache(
  async (
    locale: Locale,
    slug: string,
  ): Promise<StorefrontBlogPost | null> => {
    return unstable_cache(
      async () => loadPublishedBlogPostBySlug(locale, slug),
      ["published-blog-post", locale, slug],
      {
        tags: [CACHE_TAGS.blogPostSlug(locale, slug)],
        revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
      },
    )();
  },
);
