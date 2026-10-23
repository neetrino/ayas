import { homeAssets } from "@/features/home/ui/home-assets";

import type { GalleryStill } from "@/features/gallery/domain/gallery-catalog";

/**
 * Landing stills plus two temporary Pexels studio clips
 * (8935479, 8934149) until AYAS recordings replace the mp4 files.
 */
const MEDIA: Record<string, GalleryStill> = {
  "barre-work": { image: homeAssets.classCard, videoUrl: null },
  "center-phrase": { image: homeAssets.gallery[1], videoUrl: null },
  "barre-practice": {
    image: homeAssets.classCard,
    videoUrl: "/gallery/barre-practice.mp4",
  },
  "spring-stage": { image: homeAssets.event, videoUrl: null },
  "studio-turn": {
    image: homeAssets.gallery[4],
    videoUrl: "/gallery/studio-turn.mp4",
  },
  "competition-line": { image: homeAssets.gallery[3], videoUrl: null },
  wings: { image: homeAssets.gallery[0], videoUrl: null },
  "quick-change": { image: homeAssets.cta, videoUrl: null },
  "workshop-circle": { image: homeAssets.coach, videoUrl: null },
  "guest-workshop": { image: homeAssets.about, videoUrl: null },
};

/** Still and optional video for a gallery slug. */
export function galleryMedia(slug: string): GalleryStill | null {
  return MEDIA[slug] ?? null;
}
