/**
 * Derive the intake year (2 digits) from the last two digits of a registration number.
 * Returns 0 when the reg number doesn't match.
 */
function extractAdmissionYear(reg: string): number {
  const match = (reg || "").match(/(\d{2})\s*$/);
  if (!match) return 0;
  return 2000 + parseInt(match[1]);
}

/**
 * Intake year label in "YYYY-YYYY" format — static, never changes.
 *
 * reg "CSA/2024/1234" → "2024-2025"
 */
export function getIntakeYearLabel(reg: string): string {
  const y = extractAdmissionYear(reg);
  return y ? `${y}-${y + 1}` : "";
}

/**
 * Derive year of study (1–4) from the last two digits of a registration number.
 *
 * reg "CSA/2024/1234" → 2 (in academic year 2025-26).
 *
 * Returns 0 when the reg number doesn't match.
 */
export function getYearOfStudy(reg: string): number {
  const admissionYear = extractAdmissionYear(reg);
  if (!admissionYear) return 0;
  const now = new Date();
  const month = now.getMonth() + 1;
  const cy = now.getFullYear();
  const acaStart = month >= 9 ? cy : cy - 1;
  const year = acaStart - admissionYear + 1;
  return year > 4 ? 4 : year;
}

export function isGraduated(reg: string): boolean {
  const admissionYear = extractAdmissionYear(reg);
  if (!admissionYear) return false;
  const now = new Date();
  const month = now.getMonth() + 1;
  const cy = now.getFullYear();
  const acaStart = month >= 9 ? cy : cy - 1;
  return acaStart - admissionYear + 1 > 4;
}
