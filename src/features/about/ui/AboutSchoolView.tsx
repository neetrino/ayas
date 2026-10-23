import { AboutSchoolExperience } from "@/features/about/ui/AboutSchoolExperience";
import { AboutSchoolFooter } from "@/features/about/ui/AboutSchoolFooter";
import { SchoolPageHero } from "@/features/home/ui/SchoolPageHero";
import { AboutSchoolIndex } from "@/features/about/ui/AboutSchoolIndex";
import { AboutSchoolMission } from "@/features/about/ui/AboutSchoolMission";
import { AboutSchoolPractice } from "@/features/about/ui/AboutSchoolPractice";
import { AboutSchoolStory } from "@/features/about/ui/AboutSchoolStory";
import { HomeCoachesSection, type HomeCoachCard } from "@/features/home/ui/HomeCoachesSection";
import { HomeCtaSection } from "@/features/home/ui/HomeCtaSection";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AboutSchoolViewProps = {
  locale: Locale;
  dictionary: Dictionary;
  coaches: readonly HomeCoachCard[];
};

export function AboutSchoolView({ locale, dictionary, coaches }: AboutSchoolViewProps) {
  const landing = dictionary.home.landing;
  const about = dictionary.about;

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
        current="about"
        title={about.hero.title}
        lead={about.hero.lead}
      />
      <AboutSchoolIndex
        label={about.indexLabel}
        teachersLabel={landing.nav.teachers}
        about={about}
      />
      <AboutSchoolStory
        title={about.history.title}
        paragraphs={about.history.paragraphs}
        imageAlt={about.history.imageAlt}
        coursesLabel={landing.about.courses}
        coursesHref={`/${locale}/classes`}
      />
      <AboutSchoolMission mission={about.mission} values={about.values} />
      <AboutSchoolExperience copy={about.experience} />
      <HomeCoachesSection
        title={landing.coaches.title}
        moreLabel={landing.coaches.more}
        moreHref={`/${locale}/teachers`}
        previousLabel={landing.previous}
        nextLabel={landing.next}
        coaches={coaches}
      />
      <AboutSchoolPractice copy={about.practice} />
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
