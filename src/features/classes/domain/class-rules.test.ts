import { describe, expect, it } from "vitest";

import {
  collectClassTranslations,
  emptyClassDraft,
} from "@/features/classes/domain/class-draft";
import {
  classCodeFromTitle,
  isClassCode,
  validateClassProfile,
} from "@/features/classes/domain/class-rules";

const complete = {
  title: "Classical ballet for children",
  summary: "First positions and a load that fits the age.",
};

describe("class rules", () => {
  it("accepts a complete class and a latin code", () => {
    expect(classCodeFromTitle("Classical Ballet for Children")).toBe(
      "classical-ballet-for-children",
    );
    expect(isClassCode("ballet-children")).toBe(true);
    expect(
      validateClassProfile({
        code: "ballet-children",
        direction: "ballet",
        age: "children",
        level: "beginner",
        sortOrder: 0,
        translations: { en: complete },
      }),
    ).toBeNull();
  });

  it("rejects a bad code, direction, and empty translation", () => {
    expect(classCodeFromTitle("Դասական բալետ")).toBe("");
    expect(isClassCode("Bad Code")).toBe(false);
    expect(
      validateClassProfile({
        code: "Bad Code",
        direction: "ballet",
        age: "children",
        level: "beginner",
        sortOrder: 0,
        translations: { en: complete },
      }),
    ).toBe("INVALID_CODE");
    expect(
      validateClassProfile({
        direction: "jazz",
        age: "children",
        level: "beginner",
        sortOrder: 0,
        translations: { en: complete },
      }),
    ).toBe("INVALID_DIRECTION");
    expect(validateClassProfile({
      direction: "open",
      age: "all",
      level: "beginner",
      sortOrder: 1,
      translations: {},
    })).toBe("TRANSLATION_REQUIRED");
  });

  it("keeps a filled language and skips an empty one", () => {
    const collected = collectClassTranslations({
      hy: emptyClassDraft(),
      en: complete,
      ru: { title: "Класс", summary: "" },
    });

    expect(collected.ok).toBe(false);
    if (!collected.ok) {
      expect(collected.message).toContain("RU");
    }
  });
});
