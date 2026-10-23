import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { listPublishedBlogPosts } from "@/features/blog/application/queries";
import { parseBlogCategory } from "@/features/blog/domain/blog-article";
import { BlogView } from "@/features/blog/ui/BlogView";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type BlogPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
};

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) {
    return {};
  }

  const blog = getDictionary(rawLocale).blog;
  return {
    title: blog.metaTitle,
    description: blog.metaDescription,
  };
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;
  const { category } = await searchParams;
  const posts = await listPublishedBlogPosts(locale);

  return (
    <BlogView
      locale={locale}
      dictionary={getDictionary(locale)}
      posts={posts}
      activeCategory={parseBlogCategory(category)}
    />
  );
}
