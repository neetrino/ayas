import { SchoolEventsFrame } from "@/features/events/ui/SchoolEventsFrame";
import {
  filterBlogPostsByCategory,
  formatBlogDate,
  type BlogCategory,
} from "@/features/blog/domain/blog-article";
import type { StorefrontBlogPostListItem } from "@/features/blog/application/queries";
import { BlogCatalog } from "@/features/blog/ui/BlogCatalog";
import { SchoolPageHero } from "@/features/home/ui/SchoolPageHero";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type BlogViewProps = {
  locale: Locale;
  dictionary: Dictionary;
  posts: readonly StorefrontBlogPostListItem[];
  activeCategory: BlogCategory | null;
};

export function BlogView({
  locale,
  dictionary,
  posts,
  activeCategory,
}: BlogViewProps) {
  const landing = dictionary.home.landing;
  const blog = dictionary.blog;
  const visible = filterBlogPostsByCategory(posts, activeCategory);

  return (
    <SchoolEventsFrame locale={locale} dictionary={dictionary}>
      <SchoolPageHero
        locale={locale}
        languageLabel={dictionary.header.language}
        navLabel={dictionary.nav.navigation}
        cartLabel={dictionary.nav.cart}
        openMenuLabel={landing.openMenu}
        contactLabel={landing.nav.contact}
        nav={landing.nav}
        current="blog"
        title={blog.hero.title}
        lead={blog.hero.lead}
        titleMeasure="wide"
      />
      <BlogCatalog
        localePrefix={`/${locale}`}
        filtersLabel={blog.filtersLabel}
        allLabel={blog.all}
        empty={activeCategory ? blog.emptyCategory : blog.empty}
        imageAlt={blog.imageAlt}
        activeCategory={activeCategory}
        categoryLabels={blog.categories}
        posts={visible.map((post) => ({
          id: post.id,
          href: `/${locale}/blog/${post.copy.slug}`,
          title: post.copy.title,
          excerpt: post.copy.excerpt ?? "",
          category: post.category,
          categoryLabel: blog.categories[post.category],
          date: post.publishedAt
            ? formatBlogDate(post.publishedAt, locale)
            : null,
          coverUrl: post.coverUrl,
        }))}
      />
    </SchoolEventsFrame>
  );
}
