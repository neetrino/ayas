export const GALLERY_CATEGORIES = [
  "classes",
  "performances",
  "competitions",
  "backstage",
  "workshops",
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export const GALLERY_KINDS = ["photo", "video"] as const;

export type GalleryKind = (typeof GALLERY_KINDS)[number];

export function isGalleryCategory(value: string): value is GalleryCategory {
  return (GALLERY_CATEGORIES as readonly string[]).includes(value);
}

export function isGalleryKind(value: string): value is GalleryKind {
  return (GALLERY_KINDS as readonly string[]).includes(value);
}
