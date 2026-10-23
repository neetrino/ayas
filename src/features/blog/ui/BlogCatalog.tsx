import { AppLink } from "@/components/ui/AppLink";
import {
  BLOG_CATEGORIES,
  type BlogCategory,
} from "@/features/blog/domain/blog-article";
import { BlogArticleCard } from "@/features/blog/ui/BlogArticleCard";

export type BlogCatalogCard = {
  id: string;
  href: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  categoryLabel: string;
  date: string | null;
  coverUrl: string | null;
};

type BlogCatalogProps = {
  localePrefix: string;
  filtersLabel: string;
  allLabel: string;
  empty: string;
  imageAlt: string;
  activeCategory: BlogCategory | null;
  categoryLabels: Record<BlogCategory, string>;
  posts: readonly BlogCatalogCard[];
};

export function BlogCatalog({
  localePrefix,
  filtersLabel,
  allLabel,
  empty,
  imageAlt,
  activeCategory,
  categoryLabels,
  posts,
}: BlogCatalogProps) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-8 lg:px-[84px] lg:py-16">
        <nav aria-label={filtersLabel} className="flex flex-wrap gap-2">
          <CategoryLink
            href={`${localePrefix}/blog`}
            label={allLabel}
            current={activeCategory === null}
          />
          {BLOG_CATEGORIES.map((category) => (
            <CategoryLink
              key={category}
              href={`${localePrefix}/blog?category=${category}`}
              label={categoryLabels[category]}
              current={activeCategory === category}
            />
          ))}
        </nav>

        {posts.length === 0 ? (
          <p className="mt-10 text-lg" role="status">
            {empty}
          </p>
        ) : (
          <ul className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <li key={post.id}>
                <BlogArticleCard
                  href={post.href}
                  title={post.title}
                  excerpt={post.excerpt}
                  categoryLabel={post.categoryLabel}
                  date={post.date}
                  coverUrl={post.coverUrl}
                  imageAlt={imageAlt}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function CategoryLink({
  href,
  label,
  current,
}: {
  href: string;
  label: string;
  current: boolean;
}) {
  return (
    <AppLink
      href={href}
      prefetchPolicy="intent"
      aria-current={current ? "page" : undefined}
      className={`rounded-full px-4 py-2 text-sm font-medium ${
        current
          ? "bg-[#792a57] text-white"
          : "border border-black/15 text-[#030303] hover:border-[#792a57]"
      }`}
    >
      {label}
    </AppLink>
  );
}
