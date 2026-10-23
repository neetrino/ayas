import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";

type ClassProgramCardProps = {
  title: string;
  summary: string;
  direction: string;
  ageLabel: string;
  age: string;
  levelLabel: string;
  level: string;
  imageSrc: string;
  imageAlt: string;
  chooseLabel: string;
  chooseHref: string;
};

export function ClassProgramCard({
  title,
  summary,
  direction,
  ageLabel,
  age,
  levelLabel,
  level,
  imageSrc,
  imageAlt,
  chooseLabel,
  chooseHref,
}: ClassProgramCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[30px] bg-[#f6eef3]">
      <div className="relative h-64 bg-black">
        <Image src={imageSrc} alt={imageAlt} fill sizes="420px" className="object-cover object-top" />
        <p className="absolute inset-x-0 top-6 z-10 px-4 text-center text-xl text-[#f0ece4]">
          {direction}
        </p>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h2 className="text-2xl font-semibold text-[#030303]">{title}</h2>
        <p className="mt-3 flex-1 text-base leading-6">{summary}</p>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-black/50">{ageLabel}</dt>
            <dd className="mt-1 font-semibold text-[#792a57]">{age}</dd>
          </div>
          <div>
            <dt className="text-black/50">{levelLabel}</dt>
            <dd className="mt-1 font-semibold text-[#792a57]">{level}</dd>
          </div>
        </dl>
        <AppLink
          href={chooseHref}
          prefetchPolicy="intent"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          {chooseLabel}
        </AppLink>
      </div>
    </article>
  );
}
