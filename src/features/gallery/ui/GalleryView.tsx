import { AboutSchoolFooter } from "@/features/about/ui/AboutSchoolFooter";
import type { GalleryCard } from "@/features/gallery/domain/gallery-catalog";
import {
  GALLERY_CATEGORIES,
  GALLERY_KINDS,
} from "@/features/gallery/domain/gallery-item";
import {
  GalleryCatalog,
  type GalleryFilterGroup,
} from "@/features/gallery/ui/GalleryCatalog";
import { HomeCtaSection } from "@/features/home/ui/HomeCtaSection";
import { SchoolPageHero } from "@/features/home/ui/SchoolPageHero";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type GalleryViewProps = {
  locale: Locale;
  dictionary: Dictionary;
  items: readonly GalleryCard[];
};

export function GalleryView({ locale, dictionary, items }: GalleryViewProps) {
  const landing = dictionary.home.landing;
  const gallery = dictionary.gallery;

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
        title={gallery.hero.title}
        lead={gallery.hero.lead}
        titleMeasure="wide"
      />
      <GalleryCatalog
        filtersLabel={gallery.filters.label}
        empty={gallery.empty}
        viewerLabel={gallery.lightbox.label}
        closeLabel={gallery.lightbox.close}
        previousLabel={gallery.lightbox.previous}
        nextLabel={gallery.lightbox.next}
        groups={filterGroups(gallery)}
        items={items.map((card) => ({
          ...card,
          category: gallery.categories[card.categoryId],
        }))}
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

function filterGroups(gallery: Dictionary["gallery"]): GalleryFilterGroup[] {
  return [
    {
      id: "category",
      label: gallery.filters.category,
      options: options(gallery.filters.all, gallery.categories, GALLERY_CATEGORIES),
    },
    {
      id: "kind",
      label: gallery.filters.media,
      options: options(gallery.filters.all, gallery.kinds, GALLERY_KINDS),
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
