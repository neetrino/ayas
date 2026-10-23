import Image from "next/image";

import { homeAssets } from "@/features/home/ui/home-assets";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type PracticeCopy = Dictionary["about"]["practice"];

type AboutSchoolPracticeProps = {
  copy: PracticeCopy;
};

export function AboutSchoolPractice({ copy }: AboutSchoolPracticeProps) {
  return (
    <>
      <Directions copy={copy} />
      <Programs copy={copy} />
      <Spaces copy={copy} />
    </>
  );
}

function Directions({ copy }: AboutSchoolPracticeProps) {
  return (
    <section id="directions" className="scroll-mt-6 bg-white">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 lg:px-[84px] lg:py-24">
        <h2 className="home-display text-[clamp(2.75rem,6vw,5rem)] text-[#030303]">
          {copy.directionsTitle}
        </h2>
        <ul className="mt-10 flex snap-x gap-6 overflow-x-auto pb-2 [scrollbar-width:none]">
          {copy.directions.map((name) => (
            <li
              key={name}
              className="relative h-[420px] w-[min(86vw,360px)] shrink-0 snap-start overflow-hidden rounded-[30px] bg-black"
            >
              <p className="absolute inset-x-0 top-8 z-10 px-4 text-center text-2xl text-[#f0ece4]">
                {name}
              </p>
              <Image
                src={homeAssets.classCard}
                alt=""
                fill
                sizes="360px"
                className="object-cover object-top pt-16"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Programs({ copy }: AboutSchoolPracticeProps) {
  return (
    <section id="programs" className="scroll-mt-6 bg-white">
      <div className="mx-auto max-w-[1440px] px-4 pb-8 sm:px-8 lg:px-[84px]">
        <h2 className="home-display text-[clamp(2.75rem,6vw,5rem)] text-[#030303]">
          {copy.programsTitle}
        </h2>
        <ul className="mt-10 grid gap-6 lg:grid-cols-3">
          {copy.programs.map((program) => (
            <li key={program.title} className="rounded-[24px] bg-[#f6eef3] p-6">
              <h3 className="text-xl font-semibold text-[#792a57]">{program.title}</h3>
              <p className="mt-3 text-base leading-6">{program.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Spaces({ copy }: AboutSchoolPracticeProps) {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-[1440px] gap-16 px-4 py-16 sm:px-8 lg:grid-cols-2 lg:px-[84px] lg:py-24">
        <article id="halls" className="scroll-mt-6">
          <h2 className="home-display text-[clamp(2.5rem,5vw,4.2rem)] text-[#030303]">
            {copy.hallsTitle}
          </h2>
          <p className="mt-6 max-w-[520px] text-lg leading-6">{copy.hallsBody}</p>
          <div className="relative mt-8 h-72 overflow-hidden rounded-[24px]">
            <Image
              src={homeAssets.gallery[1]}
              alt={copy.hallsImageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        </article>
        <article id="groups" className="scroll-mt-6">
          <h2 className="home-display text-[clamp(2.5rem,5vw,4.2rem)] text-[#030303]">
            {copy.groupsTitle}
          </h2>
          <div className="mt-8 grid gap-4">
            <div className="rounded-[24px] bg-black p-6 text-white">
              <h3 className="text-xl font-semibold">{copy.childrenTitle}</h3>
              <p className="mt-3 text-base leading-6 text-white/80">{copy.childrenBody}</p>
            </div>
            <div className="rounded-[24px] border border-black/10 p-6">
              <h3 className="text-xl font-semibold">{copy.adultsTitle}</h3>
              <p className="mt-3 text-base leading-6">{copy.adultsBody}</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
