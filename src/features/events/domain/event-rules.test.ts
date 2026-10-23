import { describe, expect, it } from "vitest";

import { collectEventTranslations, emptyEventDraft } from "@/features/events/domain/event-draft";
import {
  isEventDate,
  normalizeEventSlug,
  validateEventSchedule,
  validateEventTranslations,
} from "@/features/events/domain/event-rules";

describe("event rules", () => {
  it("normalizes a title into a slug", () => {
    expect(normalizeEventSlug(" Spring Gala! ")).toBe("spring-gala");
  });

  it("rejects calendar dates that do not exist", () => {
    expect(isEventDate("2026-02-31")).toBe(false);
    expect(isEventDate("2026-08-12")).toBe(true);
  });

  it("rejects a duration outside a single day", () => {
    expect(
      validateEventSchedule({
        date: "2026-08-12",
        startTime: "19:00",
        durationMinutes: 2000,
        priceAmount: 8000,
      }),
    ).toBe("INVALID_DURATION");
  });

  it("requires at least one complete translation", () => {
    expect(validateEventTranslations({})).toBe("TRANSLATION_REQUIRED");
    expect(
      validateEventTranslations({
        en: {
          name: "Spring gala",
          slug: "spring-gala",
          description: "Evening performance.",
          venue: "AYAS stage",
          address: "15 Abovyan Street, Yerevan",
        },
      }),
    ).toBeNull();
  });

  it("skips empty locales and rejects a partial one", () => {
    const drafts = {
      hy: emptyEventDraft(),
      en: {
        ...emptyEventDraft(),
        name: "Spring gala",
        description: "Evening performance.",
        venue: "AYAS stage",
        address: "15 Abovyan Street, Yerevan",
      },
      ru: { ...emptyEventDraft(), name: "Гала" },
    };

    expect(collectEventTranslations(drafts)).toEqual({
      ok: false,
      message: "Complete name, description, venue, and address for RU.",
    });
  });
});
