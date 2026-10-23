import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";
import { homeAssets } from "@/features/home/ui/home-assets";

const GALLERY_FRAMES = [
  "col-span-7 row-span-2 h-44 sm:h-56",
  "col-span-5 row-span-2 h-28 self-start sm:h-36",
  "col-span-4 row-span-3 h-64 sm:h-80",
  "col-span-5 row-span-4 h-72 sm:h-[28rem]",
  "col-span-7 row-span-3 h-56 sm:h-72",
] as const;

type HomeGallerySectionProps = {
  href: string;
  label: string;
};

export function HomeGallerySection({ href, label }: HomeGallerySectionProps) {
  return (
    <section
      id="gallery"
      className="bg-[radial-gradient(circle_at_center,#d3a3c4_0%,#e9d1e1_48%,#ffffff_100%)] py-16 lg:py-24"
    >
      <AppLink
        href={href}
        aria-label={label}
        className="mx-auto grid max-w-[1143px] grid-cols-12 gap-4 px-4 sm:px-8"
      >
        {homeAssets.gallery.map((src, index) => (
          <div
            key={src}
            className={`relative overflow-hidden rounded-lg ${GALLERY_FRAMES[index] ?? ""}`}
          >
            <Image src={src} alt="" fill sizes="40vw" className="object-cover" />
          </div>
        ))}
      </AppLink>
    </section>
  );
}
