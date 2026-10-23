import type { GalleryCategory, GalleryKind } from "@/features/gallery/domain/gallery-item";

export type GalleryFilter = {
  category: GalleryCategory | "any";
  kind: GalleryKind | "any";
};

export function galleryItemMatches(
  item: { category: GalleryCategory; kind: GalleryKind },
  filter: GalleryFilter,
): boolean {
  const categoryMatches =
    filter.category === "any" || item.category === filter.category;
  const kindMatches = filter.kind === "any" || item.kind === filter.kind;
  return categoryMatches && kindMatches;
}
