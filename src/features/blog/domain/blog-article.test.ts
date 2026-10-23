import { describe, expect, it } from "vitest";

import {
  blogVideoEmbedUrl,
  filterBlogPostsByCategory,
  normalizeRelatedPostIds,
  parseBlogCategory,
  selectRelatedBlogPosts,
} from "@/features/blog/domain/blog-article";

const posts = [
  { id: "a", category: "NEWS" as const },
  { id: "b", category: "NEWS" as const },
  { id: "c", category: "TIP" as const },
  { id: "d", category: "NEWS" as const },
];

describe("blog articles", () => {
  it("parses known categories only", () => {
    expect(parseBlogCategory("TIP")).toBe("TIP");
    expect(parseBlogCategory("other")).toBeNull();
    expect(parseBlogCategory(undefined)).toBeNull();
  });

  it("filters the catalog by category", () => {
    expect(filterBlogPostsByCategory(posts, "TIP").map((post) => post.id)).toEqual([
      "c",
    ]);
    expect(filterBlogPostsByCategory(posts, null)).toHaveLength(4);
  });

  it("normalizes related ids", () => {
    expect(normalizeRelatedPostIds(["b", "b", "a", "c", "d"], "a")).toEqual([
      "b",
      "c",
      "d",
    ]);
  });

  it("prefers explicit related posts, then the same category", () => {
    expect(
      selectRelatedBlogPosts(posts, {
        id: "a",
        category: "NEWS",
        relatedPostIds: ["c"],
      }).map((post) => post.id),
    ).toEqual(["c", "b", "d"]);
  });

  it("embeds YouTube and Vimeo links", () => {
    expect(blogVideoEmbedUrl("https://youtu.be/abc_def")).toBe(
      "https://www.youtube-nocookie.com/embed/abc_def",
    );
    expect(blogVideoEmbedUrl("https://vimeo.com/123456")).toBe(
      "https://player.vimeo.com/video/123456",
    );
    expect(blogVideoEmbedUrl("https://example.com/watch")).toBeNull();
    expect(blogVideoEmbedUrl("")).toBeNull();
  });
});
