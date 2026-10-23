import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AboutSchoolExperienceProps = {
  copy: Dictionary["about"]["experience"];
};

export function AboutSchoolExperience({ copy }: AboutSchoolExperienceProps) {
  return (
    <section className="bg-[#030303] text-white">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-16 sm:px-8 lg:grid-cols-3 lg:px-[84px] lg:py-24">
        <article id="achievements" className="scroll-mt-6">
          <h2 className="home-display text-[clamp(2.2rem,4vw,3.4rem)]">
            {copy.achievementsTitle}
          </h2>
          <p className="mt-6 text-base leading-6 text-white/80">{copy.achievementsBody}</p>
          <ul className="mt-6 space-y-3 text-sm leading-5">
            {copy.achievements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article id="competitions" className="scroll-mt-6">
          <h2 className="home-display text-[clamp(2.2rem,4vw,3.4rem)]">
            {copy.competitionsTitle}
          </h2>
          <p className="mt-6 text-base leading-6 text-white/80">{copy.competitionsBody}</p>
        </article>
        <article id="international" className="scroll-mt-6">
          <h2 className="home-display text-[clamp(2.2rem,4vw,3.4rem)]">
            {copy.internationalTitle}
          </h2>
          <p className="mt-6 text-base leading-6 text-white/80">{copy.internationalBody}</p>
        </article>
      </div>
    </section>
  );
}
