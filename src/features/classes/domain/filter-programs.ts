export type ClassProgramFilter = {
  direction: string;
  age: string;
  level: string;
};

export type ClassFilters = {
  direction: string;
  age: string;
  level: string;
};

const YOUTH_AGES = new Set(["teens", "adults"]);

/** A program stays visible when it covers the selected direction, age, and level. */
export function programMatchesFilters(
  program: ClassProgramFilter,
  filters: ClassFilters,
): boolean {
  return (
    matchesChoice(program.direction, filters.direction) &&
    matchesAge(program.age, filters.age) &&
    matchesChoice(program.level, filters.level)
  );
}

function matchesChoice(value: string, selected: string): boolean {
  return selected === "any" || value === "all" || value === selected;
}

function matchesAge(value: string, selected: string): boolean {
  if (matchesChoice(value, selected)) {
    return true;
  }

  return value === "youth" && YOUTH_AGES.has(selected);
}
