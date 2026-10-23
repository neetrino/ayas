import { describe, expect, it } from "vitest";

import { getDictionary } from "@/lib/i18n/get-dictionary";

describe("getDictionary", () => {
  it("merges namespace files into the storefront dictionary shape", () => {
    const dictionary = getDictionary("en");

    expect(dictionary.brand).toBe("White-Shop");
    expect(dictionary.nav.home).toBe("Home");
    expect(dictionary.home.title).toBe("White Shop");
    expect(dictionary.contact.title).toBe("Contact");
    expect(dictionary.cartDrawer.title).toBe("Shopping Cart");
    expect(dictionary.checkout.title).toBe("Checkout");
    expect(dictionary.admin.nav.dashboard).toBe("Dashboard");
  });

  it("loads Armenian and Russian namespaces", () => {
    expect(getDictionary("hy").nav.home).toBe("Գլխավոր");
    expect(getDictionary("hy").admin.nav.orders).toBe("Պատվերներ");
    expect(getDictionary("ru").nav.home).toBe("Главная");
    expect(getDictionary("ru").admin.nav.orders).toBe("Заказы");
  });
});
