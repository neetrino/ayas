import {
  isGalleryCategory,
  isGalleryKind,
  type GalleryCategory,
  type GalleryKind,
} from "@/features/gallery/domain/gallery-item";
import {
  galleryPlayback,
  type GalleryPlayback,
} from "@/features/gallery/domain/gallery-playback";

export type GallerySourceItem = {
  slug: string;
  category: string;
  kind: string;
  title: string;
  alt: string;
};

export type GalleryStill = {
  image: string;
  videoUrl: string | null;
};

export type GalleryCard = {
  slug: string;
  title: string;
  alt: string;
  categoryId: GalleryCategory;
  kind: GalleryKind;
  imageSrc: string;
  playback: GalleryPlayback | null;
};

/** Drops unknown categories, missing media, and videos that cannot be played. */
export function toGalleryCards(
  items: readonly GallerySourceItem[],
  mediaFor: (slug: string) => GalleryStill | null,
): GalleryCard[] {
  const cards: GalleryCard[] = [];

  for (const item of items) {
    const card = toGalleryCard(item, mediaFor);
    if (card) {
      cards.push(card);
    }
  }

  return cards;
}

function toGalleryCard(
  item: GallerySourceItem,
  mediaFor: (slug: string) => GalleryStill | null,
): GalleryCard | null {
  if (!isGalleryCategory(item.category) || !isGalleryKind(item.kind)) {
    return null;
  }

  const media = mediaFor(item.slug);
  if (!media) {
    return null;
  }

  const playback = item.kind === "video" ? galleryPlayback(media.videoUrl) : null;
  if (item.kind === "video" && !playback) {
    return null;
  }

  return {
    slug: item.slug,
    title: item.title,
    alt: item.alt,
    categoryId: item.category,
    kind: item.kind,
    imageSrc: media.image,
    playback,
  };
}
