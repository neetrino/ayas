import { describe, expect, it } from "vitest";

import { galleryItemMatches } from "@/features/gallery/domain/filter-gallery";

const photo = { category: "classes" as const, kind: "photo" as const };

describe("galleryItemMatches", () => {
  it("keeps every item when both filters are open", () => {
    expect(
      galleryItemMatches(photo, { category: "any", kind: "any" }),
    ).toBe(true);
  });

  it("filters by category and media kind together", () => {
    expect(
      galleryItemMatches(photo, { category: "classes", kind: "photo" }),
    ).toBe(true);
    expect(
      galleryItemMatches(photo, { category: "workshops", kind: "photo" }),
    ).toBe(false);
    expect(
      galleryItemMatches(photo, { category: "classes", kind: "video" }),
    ).toBe(false);
  });
});
