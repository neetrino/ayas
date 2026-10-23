import { homeAssets } from "@/features/home/ui/home-assets";

export type ClassCatalogProgram = {
  id: string;
  title: string;
  summary: string;
  directionId: string;
  ageId: string;
  levelId: string;
  direction: string;
  age: string;
  level: string;
  imageSrc: string;
};

type ClassCatalogSource = {
  id: string;
  title: string;
  summary: string;
  directionId: string;
  ageId: string;
  levelId: string;
};

type ClassCatalogLabels = {
  directions: Record<string, string>;
  ages: Record<string, string>;
  levels: Record<string, string>;
};

const CLASS_IMAGES = [
  homeAssets.classCard,
  homeAssets.gallery[0],
  homeAssets.gallery[1],
  homeAssets.about,
  homeAssets.gallery[3],
  homeAssets.gallery[4],
  homeAssets.coach,
  homeAssets.cta,
] as const;

function labelFor(labels: Record<string, string>, key: string): string {
  return labels[key] ?? key;
}

/** Attaches display labels and the rotating class photos. */
export function toClassCatalogPrograms(
  programs: readonly ClassCatalogSource[],
  labels: ClassCatalogLabels,
): ClassCatalogProgram[] {
  return programs.map((program, index) => ({
    ...program,
    direction: labelFor(labels.directions, program.directionId),
    age: labelFor(labels.ages, program.ageId),
    level: labelFor(labels.levels, program.levelId),
    imageSrc: CLASS_IMAGES[index % CLASS_IMAGES.length] ?? homeAssets.classCard,
  }));
}
