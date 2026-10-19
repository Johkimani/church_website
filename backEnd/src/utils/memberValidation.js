const VALID_JUMUIYAS = [
  "St. Anthony", "St. Augustine", "St. Catherine",
  "St. Dominic", "St. Elizabeth", "St. Maria Goretti", "St. Monica"
];

// Academic year rolls over in August (new intake arrives end of August), so
// the current intake year is the current calendar year from Aug onwards.
// Mirrors frontEnd/src/utils/memberYear.ts.
export const academicStartYear = () => {
  const now = new Date();
  return now.getMonth() + 1 >= 8 ? now.getFullYear() : now.getFullYear() - 1;
};

// Known flexible pattern: e.g. CS01/A/2024/01, PA106/G/12345/23, ED101/G/98765/26
const REG_NUM_PATTERN = /^[A-Za-z]+\d+\/[A-Za-z]+\/\d+\/\d{2}$/;
// Very loose — any alphanumeric with at least one slash, so admins can enter custom formats
const REG_NUM_LOOSE_PATTERN = /^[A-Za-z0-9\/.\-_]+\/\d{2}$/;

// A real address: something@domain.tld with a top-level domain of at least two
// letters, so "francis@gmail" or an unfinished "francis@gmail.c" is rejected
// instead of stored. Mirrors EMAIL_REGEX in the public registration forms.
export const EMAIL_FORMAT_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

export const validateEmailFormat = (email) =>
  EMAIL_FORMAT_PATTERN.test(String(email || "").trim());

export const emailFormatError = (email) =>
  `Email address "${String(email || "").trim()}" is not valid \u2014 expected an address like name@gmail.com.`;

const JUMUIYA_ALIASES = {
  "anthony": "St. Anthony", "st anthony": "St. Anthony", "st. anthony": "St. Anthony", "st-anthony": "St. Anthony",
  "augustine": "St. Augustine", "st augustine": "St. Augustine", "st. augustine": "St. Augustine", "st-augustine": "St. Augustine",
  "catherine": "St. Catherine", "st catherine": "St. Catherine", "st. catherine": "St. Catherine", "st-catherine": "St. Catherine",
  "dominic": "St. Dominic", "dominie": "St. Dominic", "st dominic": "St. Dominic", "st. dominic": "St. Dominic", "st-dominic": "St. Dominic",
  "elizabeth": "St. Elizabeth", "st elizabeth": "St. Elizabeth", "st. elizabeth": "St. Elizabeth", "st-elizabeth": "St. Elizabeth",
  "maria goretti": "St. Maria Goretti", "st maria goretti": "St. Maria Goretti", "st. maria goretti": "St. Maria Goretti", "st-maria-goretti": "St. Maria Goretti",
  "monica": "St. Monica", "st monica": "St. Monica", "st. monica": "St. Monica", "st-monica": "St. Monica",
};

export const standardizeName = (name) => {
  if (!name || typeof name !== "string") return { cleaned: null, warnings: [] };
  const warnings = [];
  let cleaned = name.trim().replace(/\s+/g, " ");
  cleaned = cleaned.replace(/[^a-zA-Z\s'-]/g, "");
  if (cleaned !== name.trim()) warnings.push("Removed special characters from name");
  cleaned = cleaned.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  if (cleaned.length < 2) warnings.push("Name is too short");
  return { cleaned: cleaned || null, warnings };
};

// F — fold unicode (paste from phones can bring 𝙋𝘼6𝙂…), drop zero-width/space
// characters and stray closing punctuation, then upper-case. Mirrors
// frontEnd/src/utils/regNumber.ts.
export const sanitizeRegNumber = (regNumber) => {
  if (!regNumber || typeof regNumber !== "string") return null;
  let s = regNumber.normalize("NFKC");
  s = s.replace(/[\u200B-\u200D\uFEFF\u00A0\u2028\u2029]/g, "");
  s = s.replace(/[()]/g, "/").replace(/\/{2,}/g, "/");
  s = s.replace(/\s+/g, "").toUpperCase();
  s = s.replace(/[^\w/]+$/, "").replace(/^\W+/, "");
  s = s.replace(/\/$/, "");
  return s || null;
};

// A — produce a confident canonical correction for a non-conforming number.
// Returns null when no single obvious repair exists (we never invent a year
// or guess at a mangled prefix), so callers only ever offer a suggestion they
// can stand behind. Mirrors frontEnd/src/utils/regNumber.ts.
export const suggestRegNumber = (regNumber) => {
  const base = sanitizeRegNumber(regNumber);
  if (!base || REG_NUM_PATTERN.test(base)) return null;

  let parts = base.split("/").filter(Boolean);
  if (parts.length < 2) return null;

  // "CT/100/G/15888/22" -> "CT100/G/15888/22" (stray slash after the code)
  if (/^[A-Z]{1,3}$/.test(parts[0]) && /^\d{1,3}$/.test(parts[1])) {
    parts = [parts[0] + parts[1], ...parts.slice(2)];
  }

  // "ED100/G27235/25" -> "ED100/G/27235/25" (missing slash after the segment)
  if (parts.length >= 2) {
    const glued = parts[1].match(/^([A-Z]{1,2})(\d{4,6})$/);
    if (glued) parts = [parts[0], glued[1], glued[2], ...parts.slice(2)];
  }

  // "BE1O9/G/22321/24" -> "BE109/G/22321/24" (letter O typed for zero)
  if (parts[0] && !/^[A-Z]+\d+$/.test(parts[0]) && /\dO/.test(parts[0])) {
    const fixed = parts[0].replace(/(?<=[0-9])O/g, "0").replace(/(?<=[0-9O])O/g, "0");
    if (/^[A-Z]+\d+$/.test(fixed)) parts[0] = fixed;
  }

  // THE bug we are fixing: "PA106/45673/23" -> "PA106/G/45673/23"
  if (parts.length === 3 && /^[A-Z]+\d+$/.test(parts[0]) && /^\d{4,6}$/.test(parts[1]) && /^\d{2}$/.test(parts[2])) {
    parts = [parts[0], "G", parts[1], parts[2]];
  }

  const candidate = parts.join("/");
  return REG_NUM_PATTERN.test(candidate) && candidate !== base ? candidate : null;
};

// strict: true is used by the public self-registration forms, where a
// malformed number must never reach the coordinator's queue. Admin/CSV import
// keeps the historical lenient behaviour so existing custom formats still pass.
export const standardizeRegNumber = (regNumber, options = {}) => {
  const strict = options.strict === true;
  const formatOk = false;
  if (!regNumber || typeof regNumber !== "string") {
    return { cleaned: null, errors: ["Registration number is required"], warnings: [], suggestion: null, formatOk };
  }
  const cleaned = sanitizeRegNumber(regNumber);

  // The last two digits encode the intake year, but only when they form their
  // own trailing /YY segment (so "PA106/G/12345" is reported as a format
  // problem, not as the year 2045). A year after the current academic start
  // year (e.g. "/27" while intake is "/26") is either a typo or a future
  // student — reject it outright.
  const intakeMatch = (cleaned || "").match(/(?:^|\/)(\d{2})$/);
  if (intakeMatch) {
    const admissionYear = 2000 + parseInt(intakeMatch[1], 10);
    if (admissionYear > academicStartYear()) {
      return {
        cleaned: null,
        errors: [`Registration number "${cleaned}" has a future intake year (/${intakeMatch[1]}) — expected /${String(academicStartYear()).slice(-2)} or earlier`],
        warnings: [],
        suggestion: null,
        formatOk,
      };
    }
  }

  // 1. Known format → clean pass
  if (REG_NUM_PATTERN.test(cleaned)) return { cleaned, errors: [], warnings: [], suggestion: null, formatOk: true };

  const suggestion = suggestRegNumber(cleaned);

  if (strict) {
    const hint = suggestion
      ? ` Did you mean "${suggestion}"?`
      : ` Expected the format PA106/G/45673/23 — include the middle /G/ segment.`;
    return {
      cleaned: null,
      errors: [`Registration number "${cleaned}" is not in the correct format.${hint}`],
      warnings: [],
      suggestion,
      formatOk,
    };
  }

  // 2. Loose format → warn but accept (admin knows it's valid)
  if (REG_NUM_LOOSE_PATTERN.test(cleaned)) {
    return { cleaned, errors: [], warnings: [`Unrecognised format "${cleaned}" — stored as-is. It will be auto-recognised in future.`], suggestion, formatOk };
  }

  // 3. Has at least a slash and some content → suspect but accept with warning
  if (cleaned.includes("/") && cleaned.replace(/[\/]/g, "").length >= 3) {
    return { cleaned, errors: [], warnings: [`Unusual format "${cleaned}" — please verify it is correct. It will be auto-recognised in future.`], suggestion, formatOk };
  }

  // 4. Garbage → error
  return { cleaned: null, errors: [`Invalid registration number: "${cleaned}"`], warnings: [], suggestion, formatOk };
};

export const standardizeGender = (gender) => {
  if (!gender || typeof gender !== "string" || !gender.trim()) return { cleaned: null, errors: [], warnings: ["Gender not specified"] };
  const warnings = [];
  const g = gender.trim().toLowerCase();
    if (["m", "male", "man", "boy", "gent"].includes(g)) return { cleaned: "Gent", warnings };
    if (["f", "female", "woman", "girl", "lady"].includes(g)) return { cleaned: "Lady", warnings };
  warnings.push(`Unrecognized gender "${gender}" — set to null for review`);
  return { cleaned: null, warnings };
};

export const matchJumuiya = (input) => {
  if (!input || typeof input !== "string" || !input.trim()) return { cleaned: null, errors: [], warnings: [] };
  const key = input.trim().toLowerCase().replace(/[\s_-]+/g, " ");
  if (VALID_JUMUIYAS.includes(input.trim())) return { cleaned: input.trim(), errors: [], warnings: [] };
  const match = JUMUIYA_ALIASES[key] || JUMUIYA_ALIASES[input.trim().toLowerCase()];
  if (match) return { cleaned: match, errors: [], warnings: [] };
  for (const valid of VALID_JUMUIYAS) {
    if (valid.toLowerCase().includes(key) || key.includes(valid.toLowerCase().slice(0, 6))) {
      return { cleaned: valid, errors: [], warnings: [`Auto-matched "${input}" to ${valid}`] };
    }
  }
  return { cleaned: null, errors: [], warnings: [`"${input}" does not match known Jumuiya — will use active target Jumuiya`] };
};

export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) return { cleaned: null, warnings: [] };
  let cleaned = phone.trim().replace(/[\s\-\(\)]/g, "");
  if (cleaned.startsWith("0")) cleaned = "+254" + cleaned.slice(1);
  else if (cleaned.startsWith("7")) cleaned = "+2547" + cleaned.slice(1);
  else if (cleaned.startsWith("1")) cleaned = "+254" + cleaned;
  if (!cleaned.startsWith("+")) cleaned = "+" + cleaned;
  if (cleaned.length < 10) return { cleaned: null, warnings: ["Phone number too short"] };
  return { cleaned, warnings: [] };
};

export const validateEmail = (email) => {
  if (!email || !email.trim()) return { cleaned: null, warnings: [] };
  const cleaned = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleaned)) return { cleaned: null, warnings: ["Invalid email format"] };
  return { cleaned, warnings: [] };
};

export const validateMemberRow = (row, defaultJumuiya = null, options = {}) => {
  const errors = [];
  const warnings = [];

  const nameResult = standardizeName(row.name || row.fullName || row.full_name);
  if (nameResult.warnings) warnings.push(...nameResult.warnings);

  const regResult = standardizeRegNumber(
    row.registrationNumber || row.regNumber || row.reg_number || row.registration_number,
    options
  );
  errors.push(...regResult.errors);
  warnings.push(...regResult.warnings);

  const genderResult = standardizeGender(row.gender);
  if (genderResult.errors) errors.push(...genderResult.errors);
  if (genderResult.warnings) warnings.push(...genderResult.warnings);

  const rawJumuiya = row.jumuiya || row.jumuiya_name || row.community || defaultJumuiya;
  const jumuiyaResult = matchJumuiya(rawJumuiya);
  if (jumuiyaResult.errors) errors.push(...jumuiyaResult.errors);
  if (jumuiyaResult.warnings) warnings.push(...jumuiyaResult.warnings);

  const phoneResult = validatePhone(row.phone || row.phoneNumber || row.phone_number);
  if (phoneResult.warnings) warnings.push(...phoneResult.warnings);

  const emailResult = validateEmail(row.email);
  if (emailResult.warnings) warnings.push(...emailResult.warnings);

  let status = "valid";
  if (errors.length > 0) status = "error";
  else if (warnings.length > 0) status = "warning";

  return {
    raw: {
      name: row.name || row.fullName || row.full_name || null,
      regNumber: row.registrationNumber || row.regNumber || row.reg_number || row.registration_number || null,
      gender: row.gender || null,
      course: row.course || null,
      jumuiya: rawJumuiya || null,
      phone: row.phone || row.phoneNumber || row.phone_number || null,
      email: row.email || null,
    },
    cleaned: {
      name: nameResult.cleaned,
      regNumber: regResult.cleaned,
      gender: genderResult.cleaned,
      course: row.course || null,
      jumuiya: jumuiyaResult.cleaned || defaultJumuiya || null,
      phone: phoneResult.cleaned,
      email: emailResult.cleaned,
    },
    status,
    errors,
    warnings,
    // Whether the registration number already matches the canonical shape.
    // Drives the public form's hard rejection and the coordinator's
    // acknowledgement gate; `suggestion` is the confident correction.
    regFormat: { ok: regResult.formatOk === true, suggestion: regResult.suggestion || null },
  };
};

export const parseExcelRow = (row) => ({
  name: row.Name || row.NAME || row.name || row.fullName || row["Full Name"],
  registrationNumber: row.RegistrationNumber || row["Registration Number"] || row.RegNo || row.regNumber || row.registration_number,
  gender: row.Gender || row.gender || row.GENDER,
  course: row.Course || row.course || row.PROGRAMME || row.Programme || row.programme || row.PROGRAM || row.Program || row.program,
  jumuiya: row.Jumuiya || row.jumuiya || row.JUMUIYA || row.Community || row.community,
  phone: row.Phone || row.phone || row["Phone Number"] || row.phoneNumber,
  email: row.Email || row.email || row.EMAIL,
});

export { VALID_JUMUIYAS, REG_NUM_PATTERN };
