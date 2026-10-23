import { homeAssets } from '@/features/home/ui/home-assets';

export type EventMedia = {
  poster: string;
  seatingPlan: string;
  gallery: readonly string[];
};

const SEATING_PLAN = homeAssets.map;

const MEDIA: Record<string, EventMedia> = {
  'spring-gala': {
    poster: homeAssets.event,
    seatingPlan: SEATING_PLAN,
    gallery: [homeAssets.gallery[0], homeAssets.gallery[1], homeAssets.gallery[3]],
  },
  'open-class-night': {
    poster: homeAssets.cta,
    seatingPlan: SEATING_PLAN,
    gallery: [homeAssets.gallery[1], homeAssets.gallery[2], homeAssets.gallery[4]],
  },
  'winter-recital': {
    poster: homeAssets.reviews,
    seatingPlan: SEATING_PLAN,
    gallery: [homeAssets.gallery[3], homeAssets.gallery[4], homeAssets.gallery[0]],
  },
};

const FALLBACK_MEDIA: EventMedia = {
  poster: homeAssets.event,
  seatingPlan: SEATING_PLAN,
  gallery: [homeAssets.gallery[0], homeAssets.gallery[1], homeAssets.gallery[3]],
};

/** Poster, seating plan, and gallery for a catalog slug. */
export function eventMedia(slug: string): EventMedia {
  return MEDIA[slug] ?? FALLBACK_MEDIA;
}
