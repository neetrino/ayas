import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";

type TaughtClass = {
  id: string;
  title: string;
  href: string;
};

type TeacherProfileCardProps = {
  name: string;
  specialization: string;
  experienceLabel: string;
  experience: string;
  biography: string;
  classesLabel: string;
  classes: readonly TaughtClass[];
  imageSrc: string;
};

export function TeacherProfileCard({
  name,
  specialization,
  experienceLabel,
  experience,
  biography,
  classesLabel,
  classes,
  imageSrc,
}: TeacherProfileCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[30px] bg-[#f6eef3]">
      <div className="relative h-72 bg-black">
        <Image src={imageSrc} alt="" fill sizes="420px" className="object-cover object-top" />
        <p className="absolute inset-x-0 top-6 z-10 px-4 text-center text-xl text-[#f0ece4]">
          {specialization}
        </p>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h2 className="text-2xl font-semibold text-[#030303]">{name}</h2>
        <dl className="mt-4">
          <dt className="text-sm text-black/50">{experienceLabel}</dt>
          <dd className="mt-1 text-base leading-6 text-[#792a57]">{experience}</dd>
        </dl>
        <p className="mt-4 flex-1 text-base leading-6">{biography}</p>
        <TaughtClasses label={classesLabel} classes={classes} />
      </div>
    </article>
  );
}

function TaughtClasses({
  label,
  classes,
}: {
  label: string;
  classes: readonly TaughtClass[];
}) {
  if (classes.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-sm text-black/50">{label}</h3>
      <ul className="mt-2 flex flex-wrap gap-2">
        {classes.map((item) => (
          <li key={item.id}>
            <AppLink
              href={item.href}
              prefetchPolicy="intent"
              className="inline-flex min-h-11 items-center rounded-full bg-white px-4 text-sm font-semibold text-[#792a57] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              {item.title}
            </AppLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
