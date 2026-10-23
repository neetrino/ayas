import { blogVideoEmbedUrl } from "@/features/blog/domain/blog-article";

const LOCAL_GALLERY_VIDEO = /^\/gallery\/[a-z0-9-]+\.mp4$/;

export type GalleryPlayback =
  | { kind: "file"; src: string }
  | { kind: "embed"; src: string };

/**
 * Plays a same-origin `/gallery/*.mp4` or a YouTube/Vimeo page URL.
 * Other URLs are rejected.
 */
export function galleryPlayback(
  raw: string | null | undefined,
): GalleryPlayback | null {
  const trimmed = raw?.trim() ?? "";
  if (LOCAL_GALLERY_VIDEO.test(trimmed)) {
    return { kind: "file", src: trimmed };
  }

  const embed = blogVideoEmbedUrl(trimmed);
  if (!embed) {
    return null;
  }

  return { kind: "embed", src: embed };
}

/** Adds autoplay to an already-safe embed URL. */
export function galleryEmbedAutoplay(src: string): string {
  const url = new URL(src);
  url.searchParams.set("autoplay", "1");
  return url.toString();
}
