import { AboutSchoolFooter } from "@/features/about/ui/AboutSchoolFooter";
import { HomeCtaSection } from "@/features/home/ui/HomeCtaSection";
import { SchoolPageHero } from "@/features/home/ui/SchoolPageHero";
import { homeAssets } from "@/features/home/ui/home-assets";
import { TeachersRoster, type TeacherRosterPerson } from "@/features/teachers/ui/TeachersRoster";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type PublishedTeacherInput = {
  id: string;
  name: string;
  roleId: string;
  experience: string;
  biography: string;
  classIds: readonly string[];
  imageSrc: string | null;
};

type TeachersViewProps = {
  locale: Locale;
  dictionary: Dictionary;
  published: readonly PublishedTeacherInput[];
};

const ROLE_FILTERS = ["ballet", "contemporary", "traditional", "team"] as const;

export function TeachersView({ locale, dictionary, published }: TeachersViewProps) {
  const landing = dictionary.home.landing;
  const teachers = dictionary.teachers;

  return (
    <div className="home-landing">
      <SchoolPageHero
        locale={locale}
        languageLabel={dictionary.header.language}
        navLabel={dictionary.nav.navigation}
        cartLabel={dictionary.nav.cart}
        openMenuLabel={landing.openMenu}
        contactLabel={landing.nav.contact}
        nav={landing.nav}
        current="teachers"
        title={teachers.hero.title}
        lead={teachers.hero.lead}
      />
      <TeachersRoster
        filtersLabel={teachers.filters.label}
        specializationLabel={teachers.filters.specialization}
        experienceLabel={teachers.fields.experience}
        classesLabel={teachers.fields.classes}
        empty={teachers.empty}
        options={filterOptions(teachers)}
        people={rosterPeople(locale, teachers, dictionary.classes.programs, published)}
      />
      <HomeCtaSection
        title={landing.cta.title}
        body={landing.cta.body}
        registerLabel={landing.cta.register}
        registerHref={`/${locale}/contact`}
      />
      <AboutSchoolFooter locale={locale} nav={landing.nav} footer={landing.footer} />
    </div>
  );
}

function filterOptions(teachers: Dictionary["teachers"]) {
  return [
    { id: "any", label: teachers.filters.all },
    ...ROLE_FILTERS.map((id) => ({ id, label: teachers.roles[id] })),
  ];
}

function rosterPeople(
  locale: Locale,
  teachers: Dictionary["teachers"],
  programs: Dictionary["classes"]["programs"],
  published: readonly PublishedTeacherInput[],
): TeacherRosterPerson[] {
  return published.map((person) => ({
    id: person.id,
    name: person.name,
    roleId: person.roleId,
    specialization: roleLabel(teachers.roles, person.roleId),
    experience: person.experience,
    biography: person.biography,
    classes: taughtClasses(locale, person.classIds, programs),
    imageSrc: person.imageSrc ?? homeAssets.coach,
  }));
}

function roleLabel(
  roles: Dictionary["teachers"]["roles"],
  role: string,
): string {
  if (isTeacherRole(role)) {
    return roles[role];
  }

  return role;
}

function isTeacherRole(role: string): role is keyof Dictionary["teachers"]["roles"] {
  return ROLE_FILTERS.some((item) => item === role);
}

function taughtClasses(
  locale: Locale,
  classIds: readonly string[],
  programs: Dictionary["classes"]["programs"],
) {
  return classIds.flatMap((id) => {
    const program = programs.find((item) => item.id === id);
    if (!program) {
      return [];
    }

    return [{ id, title: program.title, href: `/${locale}/classes` }];
  });
}
