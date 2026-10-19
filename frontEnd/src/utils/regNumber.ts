// Mirrors backEnd/src/utils/memberValidation.js so the public forms give the
// same verdict the server will. The server stays authoritative — this exists
// to show the correction before the user submits.

export const REG_NUM_PATTERN = /^[A-Za-z]+\d+\/[A-Za-z]+\/\d+\/\d{2}$/;

// Fold unicode (pasting from a phone can bring 𝙋𝘼6𝙂…), drop zero-width/space
// characters and stray closing punctuation, then upper-case.
export const sanitizeRegNumber = (regNumber?: string | null): string => {
  if (!regNumber) return "";
  let s = regNumber.normalize("NFKC");
  s = s.replace(/[\u200B-\u200D\uFEFF\u00A0\u2028\u2029]/g, "");
  s = s.replace(/[()]/g, "/").replace(/\/{2,}/g, "/");
  s = s.replace(/\s+/g, "").toUpperCase();
  s = s.replace(/[^\w/]+$/, "").replace(/^\W+/, "");
  s = s.replace(/\/$/, "");
  return s;
};

// A confident canonical correction, or null when we have no single obvious
// repair (we never invent a year or guess at a mangled prefix).
export const suggestRegNumber = (regNumber?: string | null): string | null => {
  const base = sanitizeRegNumber(regNumber);
  if (!base || REG_NUM_PATTERN.test(base)) return null;

  let parts = base.split("/").filter(Boolean);
  if (parts.length < 2) return null;

  // "CT/100/G/15888/22" -> "CT100/G/15888/22"
  if (/^[A-Z]{1,3}$/.test(parts[0]) && /^\d{1,3}$/.test(parts[1])) {
    parts = [parts[0] + parts[1], ...parts.slice(2)];
  }

  // "ED100/G27235/25" -> "ED100/G/27235/25"
  if (parts.length >= 2) {
    const glued = parts[1].match(/^([A-Z]{1,2})(\d{4,6})$/);
    if (glued) parts = [parts[0], glued[1], glued[2], ...parts.slice(2)];
  }

  // "BE1O9/G/22321/24" -> "BE109/G/22321/24"
  if (parts[0] && !/^[A-Z]+\d+$/.test(parts[0]) && /\dO/.test(parts[0])) {
    const fixed = parts[0].replace(/(?<=[0-9])O/g, "0").replace(/(?<=[0-9O])O/g, "0");
    if (/^[A-Z]+\d+$/.test(fixed)) parts[0] = fixed;
  }

  // The bug we are fixing: "PA106/45673/23" -> "PA106/G/45673/23"
  if (
    parts.length === 3 &&
    /^[A-Z]+\d+$/.test(parts[0]) &&
    /^\d{4,6}$/.test(parts[1]) &&
    /^\d{2}$/.test(parts[2])
  ) {
    parts = [parts[0], "G", parts[1], parts[2]];
  }

  const candidate = parts.join("/");
  return REG_NUM_PATTERN.test(candidate) && candidate !== base ? candidate : null;
};

export const isCanonicalRegNumber = (regNumber?: string | null): boolean =>
  REG_NUM_PATTERN.test(sanitizeRegNumber(regNumber));

// Academic year rolls over in August — mirrors memberYear.ts and the server's
// academicStartYear() so every side agrees on which intake year is current.
const academicStartYear = (): number => {
  const now = new Date();
  return now.getMonth() + 1 >= 8 ? now.getFullYear() : now.getFullYear() - 1;
};

// Everything that would make this registration number unacceptable, in the
// same order the server checks it, so the form never accepts something the
// API will then reject.
export const regNumberError = (regNumber?: string | null): string => {
  const clean = sanitizeRegNumber(regNumber);
  if (!clean) return "Registration number is required";

  // The trailing /YY is the intake year: /23 means "joined in 2023", so /27
  // would mean 2027. Anything past the current intake is a typo.
  const intakeMatch = clean.match(/(?:^|\/)(\d{2})$/);
  if (intakeMatch) {
    const admissionYear = 2000 + parseInt(intakeMatch[1], 10);
    const current = academicStartYear();
    if (admissionYear > current) {
      return `Registration number "${clean}" has a future intake year (/${intakeMatch[1]}) — expected /${String(current).slice(-2)} or earlier`;
    }
  }

  if (REG_NUM_PATTERN.test(clean)) return "";

  // Code and segment are right but the year was never typed.
  if (/^[A-Za-z]+\d+\/[A-Za-z]+\/\d+(\/\d{1,2})?$/.test(clean)) {
    const base = clean.replace(/\/\d{1,2}$/, "");
    return `Registration number "${clean}" is missing the intake year — it should end with /YY, e.g. ${base}/23 for someone who joined in 2023`;
  }

  return suggestRegNumber(clean)
    ? "That registration number is in the wrong format."
    : "Use the format PA106/G/45673/23 — include the middle /G/ segment.";
};
