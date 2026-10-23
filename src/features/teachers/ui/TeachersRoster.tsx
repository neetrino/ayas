"use client";

import { useMemo, useState } from "react";

import { teacherMatchesSpecialization } from "@/features/teachers/domain/filter-teachers";
import { TeacherProfileCard } from "@/features/teachers/ui/TeacherProfileCard";

export type TeacherRosterPerson = {
  id: string;
  name: string;
  roleId: string;
  specialization: string;
  experience: string;
  biography: string;
  classes: readonly { id: string; title: string; href: string }[];
  imageSrc: string;
};

type FilterOption = {
  id: string;
  label: string;
};

type TeachersRosterProps = {
  filtersLabel: string;
  specializationLabel: string;
  experienceLabel: string;
  classesLabel: string;
  empty: string;
  options: readonly FilterOption[];
  people: readonly TeacherRosterPerson[];
};

export function TeachersRoster({
  filtersLabel,
  specializationLabel,
  experienceLabel,
  classesLabel,
  empty,
  options,
  people,
}: TeachersRosterProps) {
  const [role, setRole] = useState("any");
  const visible = useMemo(
    () => people.filter((person) => teacherMatchesSpecialization(person.roleId, role)),
    [people, role],
  );

  return (
    <section aria-label={filtersLabel} className="bg-white">
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-8 lg:px-[84px] lg:py-16">
        <fieldset>
          <legend className="text-sm font-semibold tracking-[0.02em] text-black/60">
            {specializationLabel}
          </legend>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {options.map((option) => (
              <FilterOptionButton
                key={option.id}
                label={option.label}
                pressed={option.id === role}
                onSelect={() => setRole(option.id)}
              />
            ))}
          </div>
        </fieldset>
        <RosterResults
          people={visible}
          empty={empty}
          experienceLabel={experienceLabel}
          classesLabel={classesLabel}
        />
      </div>
    </section>
  );
}

function FilterOptionButton({
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

function RosterResults({
  people,
  empty,
  experienceLabel,
  classesLabel,
}: {
  people: readonly TeacherRosterPerson[];
  empty: string;
  experienceLabel: string;
  classesLabel: string;
}) {
  if (people.length === 0) {
    return (
      <p className="mt-10 text-lg" role="status">
        {empty}
      </p>
    );
  }

  return (
    <ul className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
      {people.map((person) => (
        <li key={person.id}>
          <TeacherProfileCard
            name={person.name}
            specialization={person.specialization}
            experienceLabel={experienceLabel}
            experience={person.experience}
            biography={person.biography}
            classesLabel={classesLabel}
            classes={person.classes}
            imageSrc={person.imageSrc}
          />
        </li>
      ))}
    </ul>
  );
}
