import Image from "next/image";
import { Clock, Mail, MapPin, Phone, Share2 } from "lucide-react";
import type { ReactNode } from "react";

type SocialNetwork = {
  label: string;
  href: string;
  iconSrc: string;
};

type ContactDetailsProps = {
  addressLabel: string;
  address: string;
  phoneLabel: string;
  phone: string;
  emailLabel: string;
  email: string;
  hoursLabel: string;
  hours: readonly string[];
  socialLabel: string;
  networks: readonly SocialNetwork[];
  mapLabel: string;
  mapSrc: string;
};

export function ContactDetails({
  addressLabel,
  address,
  phoneLabel,
  phone,
  emailLabel,
  email,
  hoursLabel,
  hours,
  socialLabel,
  networks,
  mapLabel,
  mapSrc,
}: ContactDetailsProps) {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,520px)] lg:items-start lg:px-[84px] lg:py-24">
        <dl className="flex flex-col gap-8">
          <Detail icon={<MapPin className="size-5" aria-hidden />} label={addressLabel}>
            <address className="not-italic">{address}</address>
          </Detail>
          <Detail icon={<Phone className="size-5" aria-hidden />} label={phoneLabel}>
            <a className={linkClassName} href={`tel:${phone.replace(/[^\d+]/g, "")}`}>
              {phone}
            </a>
          </Detail>
          <Detail icon={<Mail className="size-5" aria-hidden />} label={emailLabel}>
            <a className={linkClassName} href={`mailto:${email}`}>
              {email}
            </a>
          </Detail>
          <Detail icon={<Clock className="size-5" aria-hidden />} label={hoursLabel}>
            <ul className="flex flex-col gap-1">
              {hours.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </Detail>
          <Detail icon={<Share2 className="size-5" aria-hidden />} label={socialLabel}>
            <SocialLinks networks={networks} />
          </Detail>
        </dl>
        <MapPanel label={mapLabel} src={mapSrc} />
      </div>
    </section>
  );
}

const linkClassName =
  "underline decoration-transparent underline-offset-4 transition hover:decoration-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#030303]";

function Detail({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <dt className="flex items-center gap-3 text-base font-bold">
        <span className="grid size-10 place-items-center rounded-[14px] border border-black/10">
          {icon}
        </span>
        {label}
      </dt>
      <dd className="mt-3 pl-[52px] text-base leading-6">{children}</dd>
    </div>
  );
}

function SocialLinks({ networks }: { networks: readonly SocialNetwork[] }) {
  return (
    <ul className="flex flex-wrap gap-3">
      {networks.map((network) => (
        <li key={network.label}>
          <a
            href={network.href}
            target="_blank"
            rel="noopener noreferrer"
            className="grid size-10 place-items-center rounded-[14px] bg-[#030303] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#030303]"
          >
            <Image src={network.iconSrc} alt="" width={24} height={24} />
            <span className="sr-only">{network.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function MapPanel({ label, src }: { label: string; src: string }) {
  return (
    <figure className="flex flex-col gap-4">
      <figcaption className="text-base font-bold">{label}</figcaption>
      <div className="relative h-[280px] overflow-hidden rounded-[26px] sm:h-[360px] lg:h-[460px]">
        <Image src={src} alt="" fill sizes="(max-width: 1024px) 100vw, 520px" className="object-cover" />
      </div>
    </figure>
  );
}
