import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";

type BlogArticleCardProps = {
  href: string;
  title: string;
  excerpt: string;
  categoryLabel: string;
  date: string | null;
  coverUrl: string | null;
  imageAlt: string;
};

export function BlogArticleCard({
  href,
  title,
  excerpt,
  categoryLabel,
  date,
  coverUrl,
  imageAlt,
}: BlogArticleCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[20px] border border-black/10 bg-white">
      <AppLink href={href} prefetchPolicy="intent" className="flex h-full flex-col">
        <div className="relative aspect-[16/10] bg-[#792a57]">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
            />
          ) : (
            <span className="absolute inset-x-4 bottom-4 text-sm font-medium text-white">
              {categoryLabel}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col px-5 py-5">
          <p className="text-sm font-medium text-[#9f0258]">{categoryLabel}</p>
          {date ? <p className="mt-1 text-sm text-black/50">{date}</p> : null}
          <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-[#030303]">
            {title}
          </h2>
          {excerpt ? (
            <p className="mt-3 line-clamp-3 text-base leading-6 text-black/70">
              {excerpt}
            </p>
          ) : null}
        </div>
      </AppLink>
    </article>
  );
}
