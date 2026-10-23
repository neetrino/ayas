/** A teacher stays visible when the selected specialization matches their role. */
export function teacherMatchesSpecialization(role: string, selected: string): boolean {
  return selected === "any" || role === selected;
}
