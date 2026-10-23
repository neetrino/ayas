"use client";

import { useMemo, useState } from "react";

import { programMatchesFilters } from "@/features/classes/domain/filter-programs";
import { ClassProgramCard } from "@/features/classes/ui/ClassProgramCard";

export type ClassCatalogProgram = {
  id: string;
  title: string;
  summary: string;
  directionId: string;
  ageId: string;
  levelId: string;
  direction: string;
  age: string;
  level: string;
  imageSrc: string;
};

type FilterOption = {
  id: string;
  label: string;
};

export type ClassFilterGroup = {
  id: "direction" | "age" | "level";
  label: string;
  options: readonly FilterOption[];
};

type ClassesCatalogProps = {
  filtersLabel: string;
  ageField: string;
  levelField: string;
  imageAlt: string;
  chooseLabel: string;
  chooseHref: string;
  empty: string;
  groups: readonly ClassFilterGroup[];
  programs: readonly ClassCatalogProgram[];
};

const OPEN_FILTERS = { direction: "any", age: "any", level: "any" };

export function ClassesCatalog({
  filtersLabel,
  ageField,
  levelField,
  imageAlt,
  chooseLabel,
  chooseHref,
  empty,
  groups,
  programs,
}: ClassesCatalogProps) {
  const [filters, setFilters] = useState(OPEN_FILTERS);
  const visible = useMemo(
    () => visiblePrograms(programs, filters),
    [filters, programs],
  );

  return (
    <section aria-label={filtersLabel} className="bg-white">
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-8 lg:px-[84px] lg:py-16">
        <div className="grid gap-6">
          {groups.map((group) => (
            <FilterGroup
              key={group.id}
              group={group}
              value={filters[group.id]}
              onChange={(value) =>
                setFilters((current) => ({ ...current, [group.id]: value }))
              }
            />
          ))}
        </div>
        <ProgramResults
          programs={visible}
          empty={empty}
          ageField={ageField}
          levelField={levelField}
          imageAlt={imageAlt}
          chooseLabel={chooseLabel}
          chooseHref={chooseHref}
        />
      </div>
    </section>
  );
}

function visiblePrograms(
  programs: readonly ClassCatalogProgram[],
  filters: typeof OPEN_FILTERS,
) {
  return programs.filter((program) =>
    programMatchesFilters(
      {
        direction: program.directionId,
        age: program.ageId,
        level: program.levelId,
      },
      filters,
    ),
  );
}

function FilterGroup({
  group,
  value,
  onChange,
}: {
  group: ClassFilterGroup;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-sm font-semibold tracking-[0.02em] text-black/60">
        {group.label}
      </legend>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {group.options.map((option) => (
          <FilterOption
            key={option.id}
            label={option.label}
            pressed={option.id === value}
            onSelect={() => onChange(option.id)}
          />
        ))}
      </div>
    </fieldset>
  );
}

function FilterOption({
  label,
  pressed,
  onSelect,
}: {
  label: string;
  pressed: boolean;
  onSelect: () => void;
}) {
  const tone = pressed
    ? "border-black bg-black text-white"
    : "border-black/15 bg-white text-[#030303]";

  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onSelect}
      className={`inline-flex h-11 shrink-0 items-center rounded-full border px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${tone}`}
    >
      {label}
    </button>
  );
}

function ProgramResults({
  programs,
  empty,
  ageField,
  levelField,
  imageAlt,
  chooseLabel,
  chooseHref,
}: {
  programs: readonly ClassCatalogProgram[];
  empty: string;
  ageField: string;
  levelField: string;
  imageAlt: string;
  chooseLabel: string;
  chooseHref: string;
}) {
  if (programs.length === 0) {
    return (
      <p className="mt-10 text-lg" role="status">
        {empty}
      </p>
    );
  }

  return (
    <ul className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
      {programs.map((program) => (
        <li key={program.id}>
          <ClassProgramCard
            title={program.title}
            summary={program.summary}
            direction={program.direction}
            ageLabel={ageField}
            age={program.age}
            levelLabel={levelField}
            level={program.level}
            imageSrc={program.imageSrc}
            imageAlt={imageAlt}
            chooseLabel={chooseLabel}
            chooseHref={chooseHref}
          />
        </li>
      ))}
    </ul>
  );
}
