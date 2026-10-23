import { describe, expect, it } from "vitest";

import {
  collectTeacherTranslations,
  emptyTeacherDraft,
} from "@/features/teachers/domain/teacher-draft";
import {
  validateTeacherProfile,
  validateTeacherTranslations,
} from "@/features/teachers/domain/teacher-rules";

const complete = {
  name: "Anahit Grigoryan",
  experience: "Twenty years of teaching.",
  biography: "Leads the classical program.",
};

describe("teacher rules", () => {
  it("requires at least one complete translation", () => {
    expect(validateTeacherTranslations({})).toBe("TRANSLATION_REQUIRED");
    expect(
      validateTeacherProfile({
        role: "ballet",
        classIds: ["ballet-children"],
        sortOrder: 0,
        translations: { en: complete },
      }),
    ).toBeNull();
  });

  it("rejects an unknown specialization and class", () => {
    expect(
      validateTeacherProfile({
        role: "jazz",
        classIds: [],
        sortOrder: 1,
        translations: { en: complete },
      }),
    ).toBe("INVALID_ROLE");
    expect(
      validateTeacherProfile({
        role: "team",
        classIds: ["unknown"],
        sortOrder: 1,
        translations: { en: complete },
      }),
    ).toBe("INVALID_CLASS");
  });

  it("rejects a sort order outside the allowed range", () => {
    expect(
      validateTeacherProfile({
        role: "team",
        classIds: [],
        sortOrder: 10_000,
        translations: { en: complete },
      }),
    ).toBe("INVALID_SORT");
  });

  it("keeps a filled language and skips an empty one", () => {
    const collected = collectTeacherTranslations({
      hy: emptyTeacherDraft(),
      en: complete,
      ru: { name: "Նունե", experience: "", biography: "" },
    });

    expect(collected.ok).toBe(false);
    if (!collected.ok) {
      expect(collected.message).toContain("RU");
    }
  });
});
