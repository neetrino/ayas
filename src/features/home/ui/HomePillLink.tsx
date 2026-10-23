import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";
import { homeAssets } from "@/features/home/ui/home-assets";

type HomePillLinkProps = {
  href: string;
  label: string;
  tone?: "light" | "dark";
};

/** Capsule CTA from the AYAS home frame: label plus a circular arrow. */
export function HomePillLink({
  href,
  label,
  tone = "dark",
}: HomePillLinkProps) {
  const background =
    tone === "light" ? homeAssets.pillLight : homeAssets.pillDark;
  const arrow = tone === "light" ? homeAssets.arrow : homeAssets.arrowLight;
  const text = tone === "light" ? "text-[#010101]" : "text-white";

  return (
    <AppLink
      href={href}
      prefetchPolicy="intent"
      className={`relative inline-flex h-[61px] w-[292px] max-w-full items-center justify-center bg-[length:100%_100%] bg-center bg-no-repeat pr-16 pl-8 text-lg font-medium tracking-[-0.02em] ${text}`}
      style={{ backgroundImage: `url(${background})` }}
    >
      {label}
      <Image
        src={arrow}
        alt=""
        width={31}
        height={31}
        className="absolute right-2 top-1/2 -translate-y-1/2 -rotate-45"
      />
    </AppLink>
  );
}
