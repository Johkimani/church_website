/**
 * Derive year of study (1–4) from the last two digits of a registration number.
 *
 * Example: reg "CSA/2024/1234" → last two digits "24" → admission year 2024.
 * Current academic year (Sep–Aug) 2025-26 → year 2.
 *
 * Returns 0 when the reg number doesn't match.
 */
export function getYearOfStudy(reg: string): number {
  const match = (reg || "").match(/(\d{2})\s*$/);
  if (!match) return 0;
  const admissionYear = 2000 + parseInt(match[1]);
  const now = new Date();
  const month = now.getMonth() + 1;
  const cy = now.getFullYear();
  const acaStart = month >= 9 ? cy : cy - 1;
  const year = acaStart - admissionYear + 1;
  return year > 4 ? 4 : year;
}

export function isGraduated(reg: string): boolean {
  const match = (reg || "").match(/(\d{2})\s*$/);
  if (!match) return false;
  const admissionYear = 2000 + parseInt(match[1]);
  const now = new Date();
  const month = now.getMonth() + 1;
  const cy = now.getFullYear();
  const acaStart = month >= 9 ? cy : cy - 1;
  return acaStart - admissionYear + 1 > 4;
}
