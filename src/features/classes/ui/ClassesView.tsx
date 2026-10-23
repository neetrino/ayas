import { AboutSchoolFooter } from "@/features/about/ui/AboutSchoolFooter";
import { ClassesCatalog, type ClassFilterGroup } from "@/features/classes/ui/ClassesCatalog";
import type { ClassCatalogProgram } from "@/features/classes/ui/class-catalog";
import { SchoolPageHero } from "@/features/home/ui/SchoolPageHero";
import { HomeCtaSection } from "@/features/home/ui/HomeCtaSection";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type ClassesViewProps = {
  locale: Locale;
  dictionary: Dictionary;
  programs: readonly ClassCatalogProgram[];
};

export function ClassesView({ locale, dictionary, programs }: ClassesViewProps) {
  const landing = dictionary.home.landing;
  const classes = dictionary.classes;

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
        current="courses"
        title={classes.hero.title}
        lead={classes.hero.lead}
      />
      <ClassesCatalog
        filtersLabel={classes.filters.label}
        ageField={classes.fields.age}
        levelField={classes.fields.level}
        imageAlt={classes.imageAlt}
        chooseLabel={classes.choose}
        chooseHref={`/${locale}/contact`}
        empty={classes.empty}
        groups={filterGroups(classes)}
        programs={programs}
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

const DIRECTION_FILTERS = ["ballet", "contemporary", "traditional", "open"] as const;
const AGE_FILTERS = ["children", "teens", "adults"] as const;
const LEVEL_FILTERS = ["beginner", "intermediate", "advanced"] as const;

function filterGroups(classes: Dictionary["classes"]): ClassFilterGroup[] {
  return [
    {
      id: "direction",
      label: classes.filters.direction,
      options: options(classes.filters.all, classes.directions, DIRECTION_FILTERS),
    },
    {
      id: "age",
      label: classes.filters.age,
      options: options(classes.filters.all, classes.ages, AGE_FILTERS),
    },
    {
      id: "level",
      label: classes.filters.level,
      options: options(classes.filters.all, classes.levels, LEVEL_FILTERS),
    },
  ];
}

function options(
  allLabel: string,
  labels: Record<string, string>,
  keys: readonly string[],
) {
  return [
    { id: "any", label: allLabel },
    ...keys.map((id) => ({ id, label: labels[id] ?? id })),
  ];
}

