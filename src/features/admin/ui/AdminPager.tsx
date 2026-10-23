import Link from "next/link";

import { fillAdmin } from "@/features/admin/ui/fill-admin";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AdminPagerProps = {
  locale: Locale;
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
};

export function AdminPager({
  locale,
  page,
  totalPages,
  hrefFor,
}: AdminPagerProps) {
  if (totalPages <= 1) {
    return null;
  }

  const copy = getDictionary(locale).admin.common;

  return (
    <nav className="mt-4 flex items-center gap-3 text-sm text-gray-700">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className="font-medium hover:underline">
          {copy.previous}
        </Link>
      ) : null}
      <span>{fillAdmin(copy.pageOf, { page, total: totalPages })}</span>
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className="font-medium hover:underline">
          {copy.next}
        </Link>
      ) : null}
    </nav>
  );
}
