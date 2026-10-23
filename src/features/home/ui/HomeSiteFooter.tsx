import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import type { ReactNode } from "react";

import { AppLink } from "@/components/ui/AppLink";
import { homeAssets } from "@/features/home/ui/home-assets";

type FooterLink = {
  href: string;
  label: string;
};

type HomeSiteFooterProps = {
  brand: string;
  visit: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  mapLabel: string;
  copyright: string;
  maker: string;
  makerSuffix: string;
  links: readonly FooterLink[];
};

export function HomeSiteFooter({
  brand,
  visit,
  phone,
  email,
  addressLine1,
  addressLine2,
  mapLabel,
  copyright,
  maker,
  makerSuffix,
  links,
}: HomeSiteFooterProps) {
  return (
    <footer className="relative overflow-hidden text-white">
      <Image src={homeAssets.footer} alt="" fill sizes="100vw" className="object-cover object-bottom" />
      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-12 px-6 py-16 sm:px-12 lg:px-[84px] lg:py-24">
        <p className="home-display text-[clamp(3.5rem,6vw,3.95rem)] leading-none">{brand}</p>
        <p className="text-sm">{visit}</p>
        <div className="grid gap-10 lg:grid-cols-[1fr_430px] lg:items-start">
          <ul className="flex flex-col gap-4 text-base">
            <ContactRow icon={<Phone className="size-5" aria-hidden />} text={phone} />
            <ContactRow icon={<Mail className="size-5" aria-hidden />} text={email} />
            <ContactRow
              icon={<MapPin className="size-5" aria-hidden />}
              text={`${addressLine1}, ${addressLine2}`}
            />
          </ul>
          <Image
            src={homeAssets.map}
            alt={mapLabel}
            width={430}
            height={262}
            className="h-[262px] w-full rounded-[26px] object-cover"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-6 border-t border-white/30 pt-8">
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold">
            {links.map((link) => (
              <AppLink key={link.href + link.label} href={link.href} prefetchPolicy="intent">
                {link.label}
              </AppLink>
            ))}
          </nav>
          <SocialRow />
        </div>
        <p className="text-sm">
          {copyright} <span className="font-black">{maker}</span> {makerSuffix}
        </p>
      </div>
    </footer>
  );
}

function ContactRow({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-[14px] border border-white/10 bg-white/5">
        {icon}
      </span>
      <span>{text}</span>
    </li>
  );
}

function SocialRow() {
  const items = [
    ["Facebook", homeAssets.social.facebook],
    ["Twitter", homeAssets.social.twitter],
    ["Vimeo", homeAssets.social.vimeo],
    ["YouTube", homeAssets.social.youtube],
  ] as const;

  return (
    <ul className="flex items-center gap-6">
      {items.map(([label, src]) => (
        <li key={label}>
          <Image src={src} alt={label} width={24} height={24} />
        </li>
      ))}
    </ul>
  );
}
