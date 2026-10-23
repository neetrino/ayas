import { describe, expect, it } from "vitest";

import { programMatchesFilters } from "@/features/classes/domain/filter-programs";

const contemporary = {
  direction: "contemporary",
  age: "youth",
  level: "all",
};

describe("programMatchesFilters", () => {
  it("keeps every program when filters are open", () => {
    expect(
      programMatchesFilters(contemporary, {
        direction: "any",
        age: "any",
        level: "any",
      }),
    ).toBe(true);
  });

  it("treats a youth program as both teens and adults", () => {
    expect(
      programMatchesFilters(contemporary, {
        direction: "any",
        age: "teens",
        level: "any",
      }),
    ).toBe(true);
    expect(
      programMatchesFilters(contemporary, {
        direction: "any",
        age: "children",
        level: "any",
      }),
    ).toBe(false);
  });

  it("keeps an all-level program when a specific level is selected", () => {
    expect(
      programMatchesFilters(contemporary, {
        direction: "contemporary",
        age: "adults",
        level: "beginner",
      }),
    ).toBe(true);
  });
});
