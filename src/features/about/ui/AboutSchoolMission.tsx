import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AboutSchoolMissionProps = {
  mission: Dictionary["about"]["mission"];
  values: Dictionary["about"]["values"];
};

export function AboutSchoolMission({ mission, values }: AboutSchoolMissionProps) {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-[1440px] gap-14 px-4 py-16 sm:px-8 lg:grid-cols-2 lg:px-[84px] lg:py-24">
        <div id="mission" className="scroll-mt-6">
          <h2 className="home-display text-[clamp(2.75rem,6vw,5rem)] text-[#030303]">
            {mission.title}
          </h2>
          <p className="mt-8 max-w-[520px] text-lg leading-6">{mission.body}</p>
        </div>
        <div id="values" className="scroll-mt-6">
          <h2 className="home-display text-[clamp(2.75rem,6vw,5rem)] text-[#030303]">
            {values.title}
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {values.items.map((item) => (
              <li key={item.title} className="rounded-[20px] border border-black/10 p-5">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-5 text-black/70">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
