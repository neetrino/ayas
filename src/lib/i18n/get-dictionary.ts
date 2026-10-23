import type { Locale } from "@/lib/i18n/config";

import enAbout from "@/locales/en/about.json";
import enAuth from "@/locales/en/auth.json";
import enBlog from "@/locales/en/blog.json";
import enCart from "@/locales/en/cart.json";
import enCatalog from "@/locales/en/catalog.json";
import enClasses from "@/locales/en/classes.json";
import enTeachers from "@/locales/en/teachers.json";
import enCheckout from "@/locales/en/checkout.json";
import enCommon from "@/locales/en/common.json";
import enContact from "@/locales/en/contact.json";
import enEvents from "@/locales/en/events.json";
import enGallery from "@/locales/en/gallery.json";
import enHome from "@/locales/en/home.json";
import enProduct from "@/locales/en/product.json";
import enProfile from "@/locales/en/profile.json";
import enWishlist from "@/locales/en/wishlist.json";

import hyAbout from "@/locales/hy/about.json";
import hyAuth from "@/locales/hy/auth.json";
import hyBlog from "@/locales/hy/blog.json";
import hyCart from "@/locales/hy/cart.json";
import hyCatalog from "@/locales/hy/catalog.json";
import hyClasses from "@/locales/hy/classes.json";
import hyTeachers from "@/locales/hy/teachers.json";
import hyCheckout from "@/locales/hy/checkout.json";
import hyCommon from "@/locales/hy/common.json";
import hyContact from "@/locales/hy/contact.json";
import hyEvents from "@/locales/hy/events.json";
import hyGallery from "@/locales/hy/gallery.json";
import hyHome from "@/locales/hy/home.json";
import hyProduct from "@/locales/hy/product.json";
import hyProfile from "@/locales/hy/profile.json";
import hyWishlist from "@/locales/hy/wishlist.json";

import ruAbout from "@/locales/ru/about.json";
import ruAuth from "@/locales/ru/auth.json";
import ruBlog from "@/locales/ru/blog.json";
import ruCart from "@/locales/ru/cart.json";
import ruCatalog from "@/locales/ru/catalog.json";
import ruClasses from "@/locales/ru/classes.json";
import ruTeachers from "@/locales/ru/teachers.json";
import ruCheckout from "@/locales/ru/checkout.json";
import ruCommon from "@/locales/ru/common.json";
import ruContact from "@/locales/ru/contact.json";
import ruEvents from "@/locales/ru/events.json";
import ruGallery from "@/locales/ru/gallery.json";
import ruHome from "@/locales/ru/home.json";
import ruProduct from "@/locales/ru/product.json";
import ruProfile from "@/locales/ru/profile.json";
import ruWishlist from "@/locales/ru/wishlist.json";

type LocaleNamespaces = {
  common: typeof hyCommon;
  home: typeof hyHome;
  contact: typeof hyContact;
  events: typeof hyEvents;
  gallery: typeof hyGallery;
  about: typeof hyAbout;
  auth: typeof hyAuth;
  profile: typeof hyProfile;
  checkout: typeof hyCheckout;
  cart: typeof hyCart;
  product: typeof hyProduct;
  blog: typeof hyBlog;
  catalog: typeof hyCatalog;
  classes: typeof hyClasses;
  teachers: typeof hyTeachers;
  wishlist: typeof hyWishlist;
};

function buildDictionary(namespaces: LocaleNamespaces) {
  return {
    brand: namespaces.common.brand,
    nav: namespaces.common.nav,
    header: namespaces.common.header,
    footer: namespaces.common.footer,
    home: namespaces.home,
    contact: namespaces.contact,
    events: namespaces.events,
    gallery: namespaces.gallery,
    about: namespaces.about,
    auth: namespaces.auth,
    profile: namespaces.profile,
    checkout: namespaces.checkout,
    cartDrawer: namespaces.cart,
    product: namespaces.product,
    blog: namespaces.blog,
    catalog: namespaces.catalog,
    classes: namespaces.classes,
    teachers: namespaces.teachers,
    wishlist: namespaces.wishlist,
  } as const;
}

const dictionaries = {
  hy: buildDictionary({
    common: hyCommon,
    home: hyHome,
    contact: hyContact,
    events: hyEvents,
    gallery: hyGallery,
    about: hyAbout,
    auth: hyAuth,
    profile: hyProfile,
    checkout: hyCheckout,
    cart: hyCart,
    product: hyProduct,
    blog: hyBlog,
    catalog: hyCatalog,
    classes: hyClasses,
    teachers: hyTeachers,
    wishlist: hyWishlist,
  }),
  en: buildDictionary({
    common: enCommon,
    home: enHome,
    contact: enContact,
    events: enEvents,
    gallery: enGallery,
    about: enAbout,
    auth: enAuth,
    profile: enProfile,
    checkout: enCheckout,
    cart: enCart,
    product: enProduct,
    blog: enBlog,
    catalog: enCatalog,
    classes: enClasses,
    teachers: enTeachers,
    wishlist: enWishlist,
  }),
  ru: buildDictionary({
    common: ruCommon,
    home: ruHome,
    contact: ruContact,
    events: ruEvents,
    gallery: ruGallery,
    about: ruAbout,
    auth: ruAuth,
    profile: ruProfile,
    checkout: ruCheckout,
    cart: ruCart,
    product: ruProduct,
    blog: ruBlog,
    catalog: ruCatalog,
    classes: ruClasses,
    teachers: ruTeachers,
    wishlist: ruWishlist,
  }),
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
