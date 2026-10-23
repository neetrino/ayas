import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";
import {
  blogVideoEmbedUrl,
  formatBlogDate,
  selectRelatedBlogPosts,
} from "@/features/blog/domain/blog-article";
import type {
  StorefrontBlogPost,
  StorefrontBlogPostListItem,
} from "@/features/blog/application/queries";
import { BlogArticleCard } from "@/features/blog/ui/BlogArticleCard";
import { SchoolEventsFrame } from "@/features/events/ui/SchoolEventsFrame";
import { HomeHeader } from "@/features/home/ui/HomeHeader";
import { landingNavItems } from "@/features/home/ui/landing-nav";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { sanitizeBlogHtml } from "@/lib/sanitize/html";

type BlogArticleViewProps = {
  locale: Locale;
  dictionary: Dictionary;
  post: StorefrontBlogPost;
  posts: readonly StorefrontBlogPostListItem[];
};

export function BlogArticleView({
  locale,
  dictionary,
  post,
  posts,
}: BlogArticleViewProps) {
  const blog = dictionary.blog;
  const related = selectRelatedBlogPosts(posts, post);

  return (
    <SchoolEventsFrame locale={locale} dictionary={dictionary}>
      <article className="bg-white">
        <BlogTopBar locale={locale} dictionary={dictionary} />
        <BlogArticleBody locale={locale} blog={blog} post={post} />
        <BlogRelated
          locale={locale}
          blog={blog}
          title={blog.related}
          posts={related}
        />
      </article>
    </SchoolEventsFrame>
  );
}

function BlogArticleBody({
  locale,
  blog,
  post,
}: {
  locale: Locale;
  blog: Dictionary["blog"];
  post: StorefrontBlogPost;
}) {
  const embedUrl = blogVideoEmbedUrl(post.videoUrl);
  const date = post.publishedAt ? formatBlogDate(post.publishedAt, locale) : null;

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-8 lg:px-[84px] lg:py-16">
      <AppLink
        href={`/${locale}/blog`}
        prefetchPolicy="intent"
        className="text-sm font-medium text-[#9f0258] underline-offset-2 hover:underline"
      >
        {blog.back}
      </AppLink>
      <p className="mt-6 text-sm font-medium text-[#9f0258]">
        {blog.categories[post.category]}
      </p>
      {date ? (
        <time
          dateTime={post.publishedAt ?? undefined}
          className="mt-2 block text-sm text-black/50"
        >
          {date}
        </time>
      ) : null}
      <h1 className="home-display mt-4 break-words text-[clamp(2.5rem,6vw,5rem)] text-[#030303]">
        {post.copy.title}
      </h1>
      {post.copy.excerpt ? (
        <p className="mt-6 max-w-3xl text-lg leading-7">{post.copy.excerpt}</p>
      ) : null}
      <FeaturedImage src={post.coverUrl} alt={blog.imageAlt} />
      <div
        className="mt-8 max-w-3xl text-lg leading-8 [&_a]:text-[#9f0258] [&_blockquote]:border-l-2 [&_blockquote]:border-[#792a57] [&_blockquote]:pl-4 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:mt-1 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5"
        dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(post.copy.content) }}
      />
      <ArticleVideo
        embedUrl={embedUrl}
        label={blog.video}
        title={post.copy.title}
      />
      <ArticleGallery label={blog.gallery} images={post.gallery} />
    </div>
  );
}

function FeaturedImage({ src, alt }: { src: string | null; alt: string }) {
  if (!src) {
    return null;
  }

  return (
    <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-[20px] bg-black">
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="(max-width: 1440px) 100vw, 1272px"
        className="object-cover"
      />
    </div>
  );
}

function ArticleVideo({
  embedUrl,
  label,
  title,
}: {
  embedUrl: string | null;
  label: string;
  title: string;
}) {
  if (!embedUrl) {
    return null;
  }

  return (
    <section className="mt-12" aria-labelledby="blog-video">
      <h2 id="blog-video" className="text-[30px] font-medium leading-9">
        {label}
      </h2>
      <div className="relative mt-6 aspect-video overflow-hidden rounded-[20px] bg-black">
        <iframe
          src={embedUrl}
          title={`${label}: ${title}`}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </section>
  );
}

function ArticleGallery({
  label,
  images,
}: {
  label: string;
  images: StorefrontBlogPost["gallery"];
}) {
  if (images.length === 0) {
    return null;
  }

  return (
    <section className="mt-12" aria-labelledby="blog-gallery">
      <h2 id="blog-gallery" className="text-[30px] font-medium leading-9">
        {label}
      </h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-3">
        {images.map((image) => (
          <li
            key={image.id}
            className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-black"
          >
            <Image
              src={image.url}
              alt={label}
              fill
              sizes="(max-width: 640px) 100vw, 400px"
              className="object-cover"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function BlogRelated({
  locale,
  blog,
  title,
  posts,
}: {
  locale: Locale;
  blog: Dictionary["blog"];
  title: string;
  posts: readonly StorefrontBlogPostListItem[];
}) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section
      className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-8 lg:px-[84px]"
      aria-labelledby="blog-related"
    >
      <h2 id="blog-related" className="text-[30px] font-medium leading-9">
        {title}
      </h2>
      <ul className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((item) => (
          <li key={item.id}>
            <BlogArticleCard
              href={`/${locale}/blog/${item.copy.slug}`}
              title={item.copy.title}
              excerpt={item.copy.excerpt ?? ""}
              categoryLabel={blog.categories[item.category]}
              date={
                item.publishedAt ? formatBlogDate(item.publishedAt, locale) : null
              }
              coverUrl={item.coverUrl}
              imageAlt={blog.imageAlt}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function BlogTopBar({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  const landing = dictionary.home.landing;

  return (
    <div className="relative h-28 bg-black">
      <HomeHeader
        locale={locale}
        languageLabel={dictionary.header.language}
        navLabel={dictionary.nav.navigation}
        cartHref={`/${locale}/cart`}
        cartLabel={dictionary.nav.cart}
        contactHref={`/${locale}/contact`}
        contactLabel={landing.nav.contact}
        openMenuLabel={landing.openMenu}
        items={landingNavItems(locale, landing.nav, "blog")}
      />
    </div>
  );
}
