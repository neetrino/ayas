"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";

import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { ADMIN_LABEL } from "@/features/admin/ui/admin-form-classes";
import { fillAdmin, useAdminCopy } from "@/features/admin/ui/admin-copy";
import { AdminSearchInput } from "@/features/admin/ui/AdminSearchInput";
import type { AdminCategoryOption } from "@/features/products/application/list-admin-products";

type AdminProductsFiltersProps = {
  total: number;
  q?: string;
  sku?: string;
  categoryId?: string;
  stock: "all" | "in_stock" | "out_of_stock" | "low_stock";
  categories: AdminCategoryOption[];
  sort: string;
  dir: string;
};


export function AdminProductsFilters({
  total,
  q,
  sku,
  categoryId,
  stock,
  categories,
  sort,
  dir,
}: AdminProductsFiltersProps) {
  const copy = useAdminCopy();
  const formRef = useRef<HTMLFormElement>(null);
  const stockOptions = [
    { label: copy.products.allProducts, value: "all" },
    { label: copy.products.inStock, value: "in_stock" },
    { label: copy.products.outOfStock, value: "out_of_stock" },
    { label: copy.products.lowStock, value: "low_stock" },
  ];
  const [categoryValue, setCategoryValue] = useState(categoryId ?? "");
  const [stockValue, setStockValue] = useState(stock);

  const categoryOptions = categories.map((category) => ({
    label: category.title,
    value: category.id,
  }));

  function applyCategory(next: string): void {
    flushSync(() => setCategoryValue(next));
    formRef.current?.requestSubmit();
  }

  function applyStock(next: string): void {
    flushSync(() =>
      setStockValue(next as AdminProductsFiltersProps["stock"]),
    );
    formRef.current?.requestSubmit();
  }

  return (
    <div className="mb-4">
      <p className="mb-3 text-sm text-gray-600">
        {fillAdmin(copy.products.total, { count: total })}
      </p>
      <form
        ref={formRef}
        method="get"
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <input type="hidden" name="sort" value={sort} />
        <input type="hidden" name="dir" value={dir} />
        <label>
          <span className={ADMIN_LABEL}>{copy.products.searchTitle}</span>
          <AdminSearchInput
            name="q"
            defaultValue={q ?? ""}
            placeholder={copy.products.searchTitlePlaceholder}
            wrapperClassName="mt-1"
            aria-label={copy.products.searchTitle}
          />
        </label>
        <label>
          <span className={ADMIN_LABEL}>{copy.products.searchSku}</span>
          <AdminSearchInput
            name="sku"
            defaultValue={sku ?? ""}
            placeholder={copy.products.searchSkuPlaceholder}
            wrapperClassName="mt-1"
            aria-label={copy.products.searchSku}
          />
        </label>
        <div>
          <span className={ADMIN_LABEL}>{copy.products.filterCategory}</span>
          <SelectDropdown
            name="categoryId"
            ariaLabel={copy.products.filterCategory}
            value={categoryValue}
            allLabel={copy.products.allCategories}
            options={categoryOptions}
            className="mt-1"
            onValueChange={applyCategory}
          />
        </div>
        <div>
          <span className={ADMIN_LABEL}>{copy.products.filterStock}</span>
          <SelectDropdown
            name="stock"
            ariaLabel={copy.products.filterStock}
            value={stockValue}
            options={stockOptions}
            className="mt-1"
            onValueChange={applyStock}
          />
        </div>
      </form>
    </div>
  );
}
