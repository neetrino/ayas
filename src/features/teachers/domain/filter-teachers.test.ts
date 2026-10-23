import { describe, expect, it } from "vitest";

import { teacherMatchesSpecialization } from "@/features/teachers/domain/filter-teachers";

describe("teacherMatchesSpecialization", () => {
  it("keeps every teacher when the specialization filter is open", () => {
    expect(teacherMatchesSpecialization("team", "any")).toBe(true);
  });

  it("keeps a teacher only for their own specialization", () => {
    expect(teacherMatchesSpecialization("ballet", "ballet")).toBe(true);
    expect(teacherMatchesSpecialization("ballet", "contemporary")).toBe(false);
  });
});
