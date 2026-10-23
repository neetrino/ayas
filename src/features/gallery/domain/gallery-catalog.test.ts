import { describe, expect, it } from "vitest";

import { toGalleryCards } from "@/features/gallery/domain/gallery-catalog";
import {
  galleryEmbedAutoplay,
  galleryPlayback,
} from "@/features/gallery/domain/gallery-playback";

const photo = {
  slug: "barre-work",
  category: "classes",
  kind: "photo",
  title: "Barre work",
  alt: "Students at the barre",
};

describe("galleryPlayback", () => {
  it("accepts a same-origin gallery file and a YouTube page", () => {
    expect(galleryPlayback("/gallery/barre-practice.mp4")).toEqual({
      kind: "file",
      src: "/gallery/barre-practice.mp4",
    });
    expect(galleryPlayback("https://www.youtube.com/watch?v=abc_def")).toEqual({
      kind: "embed",
      src: "https://www.youtube-nocookie.com/embed/abc_def",
    });
  });

  it("rejects paths and hosts outside the gallery player", () => {
    expect(galleryPlayback("/gallery/../secret.mp4")).toBeNull();
    expect(galleryPlayback("https://evil.example/clip.mp4")).toBeNull();
    expect(galleryPlayback("http://videos.example/clip.mp4")).toBeNull();
  });

  it("adds autoplay to an embed url", () => {
    expect(
      galleryEmbedAutoplay("https://www.youtube-nocookie.com/embed/abc_def"),
    ).toBe("https://www.youtube-nocookie.com/embed/abc_def?autoplay=1");
  });
});

describe("toGalleryCards", () => {
  it("keeps a photo and a playable video, and drops the rest", () => {
    const cards = toGalleryCards(
      [
        photo,
        {
          slug: "barre-practice",
          category: "classes",
          kind: "video",
          title: "Barre practice",
          alt: "Barre video",
        },
        {
          slug: "missing",
          category: "classes",
          kind: "photo",
          title: "Missing",
          alt: "Missing still",
        },
        {
          slug: "broken",
          category: "workshops",
          kind: "video",
          title: "Broken",
          alt: "Broken video",
        },
        {
          slug: "unknown",
          category: "recital",
          kind: "photo",
          title: "Unknown",
          alt: "Unknown category",
        },
      ],
      (slug) => {
        if (slug === "barre-work") {
          return { image: "/home/class.png", videoUrl: null };
        }
        if (slug === "barre-practice") {
          return { image: "/home/class.png", videoUrl: "/gallery/barre-practice.mp4" };
        }
        if (slug === "broken") {
          return { image: "/home/class.png", videoUrl: "not-a-video" };
        }
        return null;
      },
    );

    expect(cards.map((card) => card.slug)).toEqual([
      "barre-work",
      "barre-practice",
    ]);
    expect(cards[1]?.playback).toEqual({
      kind: "file",
      src: "/gallery/barre-practice.mp4",
    });
  });
});
