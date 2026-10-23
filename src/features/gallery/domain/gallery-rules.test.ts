import { describe, expect, it } from "vitest";

import { collectGalleryTranslations } from "@/features/gallery/domain/gallery-draft";
import {
  normalizeGalleryVideo,
  validateGalleryProfile,
} from "@/features/gallery/domain/gallery-rules";

const complete = {
  title: "Barre work",
  alt: "Students at the barre during class",
};

describe("gallery rules", () => {
  it("requires one complete translation and a known category", () => {
    expect(
      validateGalleryProfile({
        category: "classes",
        kind: "photo",
        sortOrder: 0,
        videoUrl: null,
        translations: {},
      }),
    ).toBe("TRANSLATION_REQUIRED");
    expect(
      validateGalleryProfile({
        category: "recital",
        kind: "photo",
        sortOrder: 0,
        videoUrl: null,
        translations: { en: complete },
      }),
    ).toBe("INVALID_CATEGORY");
  });

  it("accepts a photo and a playable video", () => {
    expect(
      validateGalleryProfile({
        category: "classes",
        kind: "photo",
        sortOrder: 1,
        videoUrl: "https://example.com/clip",
        translations: { en: complete },
      }),
    ).toBeNull();
    expect(normalizeGalleryVideo("photo", "https://youtu.be/abc")).toEqual({
      videoUrl: null,
    });
    expect(
      normalizeGalleryVideo("video", "https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    ).toEqual({ videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });
    expect(normalizeGalleryVideo("video", "https://example.com/clip")).toEqual({
      error: "INVALID_VIDEO",
    });
  });

  it("rejects a half-filled language", () => {
    const result = collectGalleryTranslations({
      hy: { title: "", alt: "" },
      en: { title: "Barre work", alt: "" },
      ru: { title: "", alt: "" },
    });
    expect(result.ok).toBe(false);
  });
});
