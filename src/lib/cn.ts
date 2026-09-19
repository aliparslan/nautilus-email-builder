/** Joins class names, dropping falsy values. Tailwind class conflicts are avoided by construction rather than merged. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
