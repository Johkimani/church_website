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
// Academic year rolls over in August (the new intake arrives end of August),
// so a cohort admitted in year N becomes Year 1 from ~Aug of year N.
function academicStartYear(): number {
  const now = new Date();
  return now.getMonth() + 1 >= 8 ? now.getFullYear() : now.getFullYear() - 1;
}

export function getYearOfStudy(reg: string): number {
  const admissionYear = extractAdmissionYear(reg);
  if (!admissionYear) return 0;
  const acaStart = academicStartYear();
  const year = acaStart - admissionYear + 1;
  return year > 4 ? 4 : year;
}

export function isGraduated(reg: string): boolean {
  const admissionYear = extractAdmissionYear(reg);
  if (!admissionYear) return false;
  return academicStartYear() - admissionYear + 1 > 4;
}

/**
 * Normalize a gender value from the DB into "M" | "W" | "—".
 *
 * The members table stores gender inconsistently (e.g. ' male ', 'female',
 * 'M', 'Male', 'F', … — often lowercase with surrounding whitespace). This
 * trims and case-folds before classifying so badges render correctly.
 */
export function genderCode(value: string | null | undefined): "M" | "W" | "—" {
  const v = (value || "").trim().toLowerCase();
  if (!v) return "—";
  if (v === "m" || v === "male" || v === "man" || v === "boy") return "M";
  if (v === "f" || v === "female" || v === "woman" || v === "girl") return "W";
  return "—";
}

/** True when a raw gender value (e.g. ' male ', 'Male', 'M') means male. */
export function isMale(value: string | null | undefined): boolean {
  return genderCode(value) === "M";
}

/** True when a raw gender value (e.g. ' female ', 'Female', 'F') means female. */
export function isFemale(value: string | null | undefined): boolean {
  return genderCode(value) === "W";
}
