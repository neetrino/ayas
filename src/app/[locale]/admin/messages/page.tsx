import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  ADMIN_LABEL,
  ADMIN_PAGE_SUBTITLE,
  ADMIN_PAGE_TITLE,
  ADMIN_SELECT,
} from "@/features/admin/ui/admin-form-classes";
import { AdminSearchInput } from "@/features/admin/ui/AdminSearchInput";
import {
  ADMIN_TABLE,
  ADMIN_TABLE_CARD,
  ADMIN_TABLE_OUTER_SCROLL,
  ADMIN_TABLE_ROW,
  ADMIN_TABLE_STATE_INSET,
  ADMIN_TABLE_TBODY,
  ADMIN_TABLE_TD,
  ADMIN_TABLE_TD_CENTER,
  ADMIN_TABLE_TH,
  ADMIN_TABLE_TH_CENTER,
  ADMIN_TABLE_THEAD,
} from "@/features/admin/ui/admin-table-classes";
import { ADMIN_BADGE } from "@/features/admin/ui/status-badge";
import { listAdminContactMessages } from "@/features/contact/application/queries";
import { CONTACT_STATUSES } from "@/features/contact/domain/contact-rules";
import { adminContactFilterSchema } from "@/features/contact/schemas/contact";
import { fillAdmin } from "@/features/admin/ui/fill-admin";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AdminMessagesPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function contactStatusBadgeClass(status: string): string {
  const normalized = status.toUpperCase();
  if (normalized === "UNREAD") return "bg-blue-100 text-blue-800";
  if (normalized === "READ") return "bg-yellow-100 text-yellow-800";
  if (normalized === "REPLIED") return "bg-green-100 text-green-800";
  if (normalized === "ARCHIVED") return "bg-gray-100 text-gray-800";
  return "bg-gray-100 text-gray-800";
}

export default async function AdminMessagesPage({
  params,
  searchParams,
}: AdminMessagesPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const raw = await searchParams;
  const parsed = adminContactFilterSchema.safeParse({
    status: firstParam(raw.status) || undefined,
    q: firstParam(raw.q) || undefined,
    page: firstParam(raw.page) ?? "1",
  });

  const filters = parsed.success
    ? parsed.data
    : { page: 1 as const, status: undefined, q: undefined };

  const copy = getDictionary(locale).admin;
  const { rows, total, pageSize } = await listAdminContactMessages(filters);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section>
      <div className="mb-6">
        <h1 className={ADMIN_PAGE_TITLE}>{copy.messages.title}</h1>
        <p className={`mt-1 ${ADMIN_PAGE_SUBTITLE}`}>
          {fillAdmin(copy.messages.summary, { count: total })}
          {filters.status
            ? ` · ${copy.contactStatuses[filters.status] ?? filters.status}`
            : ""}
        </p>
      </div>

      <Card className="mb-6 p-4">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <label className="min-w-[180px] flex-1">
            <span className={ADMIN_LABEL}>{copy.common.search}</span>
            <AdminSearchInput
              name="q"
              defaultValue={filters.q ?? ""}
              placeholder={copy.messages.searchPlaceholder}
              wrapperClassName="mt-1"
            />
          </label>
          <label className="min-w-[140px]">
            <span className={ADMIN_LABEL}>{copy.common.status}</span>
            <select
              name="status"
              defaultValue={filters.status ?? ""}
              className={ADMIN_SELECT}
            >
              <option value="">{copy.common.all}</option>
              {CONTACT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {copy.contactStatuses[status]}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" size="sm">
            {copy.common.filter}
          </Button>
        </form>
      </Card>

      <Card className={ADMIN_TABLE_CARD}>
        {rows.length === 0 ? (
          <p className={`${ADMIN_TABLE_STATE_INSET} text-sm text-gray-600`}>
            {copy.messages.empty}
          </p>
        ) : (
          <div className={ADMIN_TABLE_OUTER_SCROLL}>
            <table className={ADMIN_TABLE}>
              <thead className={ADMIN_TABLE_THEAD}>
                <tr>
                  <th className={ADMIN_TABLE_TH}>{copy.common.subject}</th>
                  <th className={ADMIN_TABLE_TH}>{copy.common.from}</th>
                  <th className={ADMIN_TABLE_TH_CENTER}>{copy.common.status}</th>
                  <th className={ADMIN_TABLE_TH}>{copy.common.received}</th>
                </tr>
              </thead>
              <tbody className={ADMIN_TABLE_TBODY}>
                {rows.map((message) => (
                  <tr key={message.id} className={ADMIN_TABLE_ROW}>
                    <td className={ADMIN_TABLE_TD}>
                      <Link
                        href={`/${locale}/admin/messages/${message.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {message.subject}
                      </Link>
                    </td>
                    <td className={ADMIN_TABLE_TD}>
                      <p className="text-sm text-gray-900">{message.name}</p>
                      <p className="text-xs text-gray-500">{message.email}</p>
                    </td>
                    <td className={ADMIN_TABLE_TD_CENTER}>
                      <span
                        className={`${ADMIN_BADGE} ${contactStatusBadgeClass(message.status)}`}
                      >
                        {copy.contactStatuses[
                          message.status as keyof typeof copy.contactStatuses
                        ] ?? message.status}
                      </span>
                      {message.spamScore !== null ? (
                        <p className="mt-1 text-xs text-gray-500">
                          {fillAdmin(copy.messages.spam, {
                            score: message.spamScore,
                          })}
                        </p>
                      ) : null}
                    </td>
                    <td className={ADMIN_TABLE_TD}>
                      <span className="text-xs text-gray-500">
                        {message.createdAt
                          .toISOString()
                          .slice(0, 16)
                          .replace("T", " ")}{" "}
                        UTC
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {totalPages > 1 ? (
        <nav className="mt-4 flex items-center gap-3 text-sm text-gray-700">
          <span>
            {fillAdmin(copy.common.pageOf, {
              page: filters.page,
              total: totalPages,
            })}
          </span>
        </nav>
      ) : null}
    </section>
  );
}
