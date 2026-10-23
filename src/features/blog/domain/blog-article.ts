import type { Locale } from "@/lib/i18n/config";

export const BLOG_CATEGORIES = [
  "NEWS",
  "COMPETITION",
  "PERFORMANCE",
  "EVENT",
  "WORKSHOP",
  "INTERVIEW",
  "TIP",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const BLOG_RELATED_LIMIT = 3;
export const BLOG_GALLERY_LIMIT = 6;

const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com"]);
const VIMEO_HOSTS = new Set(["vimeo.com", "www.vimeo.com"]);

export const BLOG_CATEGORY_ADMIN_LABELS: Record<BlogCategory, string> = {
  NEWS: "School news",
  COMPETITION: "Competition results",
  PERFORMANCE: "Performances",
  EVENT: "Events",
  WORKSHOP: "Workshops",
  INTERVIEW: "Teacher interviews",
  TIP: "Dance tips",
};

export function isBlogCategory(value: string): value is BlogCategory {
  return (BLOG_CATEGORIES as readonly string[]).includes(value);
}

/** Reads `?category=` and ignores unknown values. */
export function parseBlogCategory(
  value: string | undefined,
): BlogCategory | null {
  if (!value || !isBlogCategory(value)) {
    return null;
  }
  return value;
}

export function filterBlogPostsByCategory<T extends { category: BlogCategory }>(
  posts: readonly T[],
  category: BlogCategory | null,
): T[] {
  if (!category) {
    return [...posts];
  }
  return posts.filter((post) => post.category === category);
}

/** Keeps unique related ids, drops the current post, and caps the list. */
export function normalizeRelatedPostIds(
  ids: readonly string[],
  selfId: string,
): string[] {
  const unique: string[] = [];
  const seen = new Set<string>();

  for (const id of ids) {
    if (id === selfId || seen.has(id)) {
      continue;
    }
    seen.add(id);
    unique.push(id);
    if (unique.length >= BLOG_RELATED_LIMIT) {
      break;
    }
  }

  return unique;
}

/**
 * Uses the admin's related picks first, then fills from the same category.
 * `posts` must already be the published set.
 */
export function selectRelatedBlogPosts<
  T extends { id: string; category: BlogCategory },
>(
  posts: readonly T[],
  current: {
    id: string;
    category: BlogCategory;
    relatedPostIds: readonly string[];
  },
): T[] {
  const byId = new Map(posts.map((post) => [post.id, post]));
  const picked: T[] = [];
  const seen = new Set<string>([current.id]);

  for (const id of current.relatedPostIds) {
    const post = byId.get(id);
    if (!post || seen.has(post.id)) {
      continue;
    }
    seen.add(post.id);
    picked.push(post);
    if (picked.length >= BLOG_RELATED_LIMIT) {
      return picked;
    }
  }

  for (const post of posts) {
    if (picked.length >= BLOG_RELATED_LIMIT) {
      break;
    }
    if (seen.has(post.id) || post.category !== current.category) {
      continue;
    }
    seen.add(post.id);
    picked.push(post);
  }

  return picked;
}

function youtubeId(url: URL): string | null {
  if (url.hostname.toLowerCase() === "youtu.be") {
    return url.pathname.split("/").filter(Boolean)[0] ?? null;
  }

  const host = url.hostname.toLowerCase();
  if (!YOUTUBE_HOSTS.has(host)) {
    return null;
  }

  const watchId = url.searchParams.get("v");
  if (watchId) {
    return watchId;
  }

  const [kind, id] = url.pathname.split("/").filter(Boolean);
  if ((kind === "embed" || kind === "shorts") && id) {
    return id;
  }

  return null;
}

function vimeoId(url: URL): string | null {
  const host = url.hostname.toLowerCase();
  if (VIMEO_HOSTS.has(host)) {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id && /^\d+$/.test(id) ? id : null;
  }

  if (host !== "player.vimeo.com") {
    return null;
  }

  const [kind, id] = url.pathname.split("/").filter(Boolean);
  if (kind === "video" && id && /^\d+$/.test(id)) {
    return id;
  }

  return null;
}

/** Turns a YouTube or Vimeo page URL into a safe embed URL. */
export function blogVideoEmbedUrl(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (url.protocol !== "https:") {
    return null;
  }

  const youtube = youtubeId(url);
  if (youtube && /^[\w-]{6,}$/.test(youtube)) {
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtube)}`;
  }

  const vimeo = vimeoId(url);
  if (vimeo) {
    return `https://player.vimeo.com/video/${vimeo}`;
  }

  return null;
}

export function formatBlogDate(iso: string, locale: Locale): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso.slice(0, 10);
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
