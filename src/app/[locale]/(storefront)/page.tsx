import { notFound } from "next/navigation";

import { HomeAboutSection } from "@/features/home/ui/HomeAboutSection";
import { HomeClassesSection } from "@/features/home/ui/HomeClassesSection";
import { HomeCoachesSection, toHomeCoachCards } from "@/features/home/ui/HomeCoachesSection";
import { HomeCtaSection } from "@/features/home/ui/HomeCtaSection";
import { listPublishedEvents } from "@/features/events/application/queries";
import { formatEventDate } from "@/features/events/domain/format-event";
import { HomeEventsSection } from "@/features/home/ui/HomeEventsSection";
import { HomeGallerySection } from "@/features/home/ui/HomeGallerySection";
import { HomeHeroSection } from "@/features/home/ui/HomeHeroSection";
import { HomeNewsSection } from "@/features/home/ui/HomeNewsSection";
import { HomeReviewsSection } from "@/features/home/ui/HomeReviewsSection";
import {
  HomeShopSection,
  type HomeShopCard,
} from "@/features/home/ui/HomeShopSection";
import { HomeSiteFooter } from "@/features/home/ui/HomeSiteFooter";
import { homeAssets } from "@/features/home/ui/home-assets";
import { landingFooterLinks } from "@/features/home/ui/landing-nav";
import { getFeaturedProducts } from "@/features/products/queries";
import { listHomeTeachers } from "@/features/teachers/application/queries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  createDisplayPriceFormatter,
  getSelectedCurrency,
} from "@/lib/money/display-price";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

const PLACEHOLDER_COUNT = 4;

export default async function HomePage({ params }: HomePageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;
  const dictionary = getDictionary(locale);
  const copy = dictionary.home.landing;
  const [featuredProducts, currency, publishedEvents, homeTeachers] = await Promise.all([
    getFeaturedProducts(locale),
    getSelectedCurrency(),
    listPublishedEvents(locale),
    listHomeTeachers(locale),
  ]);
  const formatPrice = await createDisplayPriceFormatter(locale, currency);
  const products = mapShopCards(locale, featuredProducts, formatPrice, copy.shop);
  const featuredEvent = featuredEventTeaser(locale, publishedEvents);

  return (
    <div className="home-landing">
      <HomeHeroSection
        locale={locale}
        languageLabel={dictionary.header.language}
        navLabel={dictionary.nav.navigation}
        cartLabel={dictionary.nav.cart}
        openMenuLabel={copy.openMenu}
        contactLabel={copy.nav.contact}
        nav={copy.nav}
        copy={copy.hero}
      />
      <HomeAboutSection
        title={copy.about.title}
        first={copy.about.first}
        second={copy.about.second}
        coursesLabel={copy.about.courses}
        coursesHref={`/${locale}/classes`}
      />
      <HomeClassesSection name={copy.classes.name} />
      <HomeCoachesSection
        title={copy.coaches.title}
        moreLabel={copy.coaches.more}
        moreHref={`/${locale}/teachers`}
        previousLabel={copy.previous}
        nextLabel={copy.next}
        coaches={toHomeCoachCards(homeTeachers)}
      />
      <HomeShopSection
        title={copy.shop.title}
        addLabel={copy.shop.add}
        previousLabel={copy.previous}
        nextLabel={copy.next}
        products={products}
      />
      <HomeEventsSection
        title={featuredEvent?.title ?? copy.events.title}
        date={featuredEvent?.date ?? copy.events.date}
        moreLabel={copy.events.more}
        moreHref={`/${locale}/events`}
        eventHref={featuredEvent?.href ?? `/${locale}/events`}
      />
      <HomeGallerySection href={`/${locale}/gallery`} label={copy.nav.gallery} />
      <HomeReviewsSection
        title={copy.reviews.title}
        quote={copy.reviews.quote}
        name={copy.reviews.name}
        role={copy.reviews.role}
        moreLabel={copy.reviews.more}
        moreHref={`/${locale}/contact`}
        previousLabel={copy.previous}
        nextLabel={copy.next}
      />
      <HomeNewsSection
        title={copy.news.title}
        eyebrow={copy.news.eyebrow}
        quote={copy.news.quote}
        author={copy.news.author}
        handle={copy.news.handle}
        previousLabel={copy.previous}
        nextLabel={copy.next}
      />
      <HomeCtaSection
        title={copy.cta.title}
        body={copy.cta.body}
        registerLabel={copy.cta.register}
        registerHref={`/${locale}/contact`}
      />
      <HomeSiteFooter
        brand="AYAS"
        visit={copy.footer.visit}
        phone={copy.footer.phone}
        email={copy.footer.email}
        addressLine1={copy.footer.addressLine1}
        addressLine2={copy.footer.addressLine2}
        mapLabel={copy.footer.map}
        copyright={copy.footer.copyright}
        maker={copy.footer.maker}
        makerSuffix={copy.footer.makerSuffix}
        links={landingFooterLinks(locale, copy.nav)}
      />
    </div>
  );
}

function featuredEventTeaser(
  locale: Locale,
  events: Awaited<ReturnType<typeof listPublishedEvents>>,
) {
  const event = events[0];

  if (!event) {
    return null;
  }

  return {
    title: event.name,
    date: formatEventDate(event.date, locale),
    href: `/${locale}/events/${event.slug}`,
  };
}

type FeaturedProduct = Awaited<ReturnType<typeof getFeaturedProducts>>[number];

function mapShopCards(
  locale: Locale,
  products: readonly FeaturedProduct[],
  formatPrice: Awaited<ReturnType<typeof createDisplayPriceFormatter>>,
  shop: {
    placeholderTitle: string;
    placeholderMeta: string;
    placeholderBrand: string;
    placeholderPrice: string;
  },
): HomeShopCard[] {
  if (products.length === 0) {
    return Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => ({
      id: `placeholder-${index}`,
      href: `/${locale}/products`,
      title: shop.placeholderTitle,
      meta: shop.placeholderMeta,
      brand: shop.placeholderBrand,
      price: shop.placeholderPrice,
      imageUrl: homeAssets.product,
    }));
  }

  return products.map((product) => ({
    id: product.id,
    href: `/${locale}/products/${product.translation.slug}`,
    title: product.translation.title,
    meta: "",
    brand: "",
    price: formatPrice(product.priceAmount).formatted,
    imageUrl: product.imageUrl ?? homeAssets.product,
    productId: product.id,
  }));
}
