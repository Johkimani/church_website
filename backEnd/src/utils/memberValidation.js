const VALID_JUMUIYAS = [
  "St. Anthony", "St. Augustine", "St. Catherine",
  "St. Dominic", "St. Elizabeth", "St. Maria Goretti", "St. Monica"
];

// Known flexible pattern: e.g. CS01/A/2024/01, PA106/G/12345/23, ED101/G/98765/26
const REG_NUM_PATTERN = /^[A-Za-z]+\d+\/[A-Za-z]+\/\d+\/\d{2}$/;
// Very loose — any alphanumeric with at least one slash, so admins can enter custom formats
const REG_NUM_LOOSE_PATTERN = /^[A-Za-z0-9\/.\-_]+\/\d{2}$/;

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

export const standardizeRegNumber = (regNumber) => {
  if (!regNumber || typeof regNumber !== "string") return { cleaned: null, errors: ["Registration number is required"], warnings: [] };
  let cleaned = regNumber.trim().toUpperCase();

  // 1. Known format → clean pass
  if (REG_NUM_PATTERN.test(cleaned)) return { cleaned, errors: [], warnings: [] };

  // 2. Loose format → warn but accept (admin knows it's valid)
  if (REG_NUM_LOOSE_PATTERN.test(cleaned)) {
    return { cleaned, errors: [], warnings: [`Unrecognised format "${cleaned}" — stored as-is. It will be auto-recognised in future.`] };
  }

  // 3. Has at least a slash and some content → suspect but accept with warning
  if (cleaned.includes("/") && cleaned.replace(/[\/]/g, "").length >= 3) {
    return { cleaned, errors: [], warnings: [`Unusual format "${cleaned}" — please verify it is correct. It will be auto-recognised in future.`] };
  }

  // 4. Garbage → error
  return { cleaned: null, errors: [`Invalid registration number: "${cleaned}"`], warnings: [] };
};

export const standardizeGender = (gender) => {
  if (!gender || typeof gender !== "string" || !gender.trim()) return { cleaned: null, errors: [], warnings: ["Gender not specified"] };
  const warnings = [];
  const g = gender.trim().toLowerCase();
  if (["m", "male", "man", "boy"].includes(g)) return { cleaned: "Male", warnings };
  if (["f", "female", "woman", "girl"].includes(g)) return { cleaned: "Female", warnings };
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

export const validateMemberRow = (row, defaultJumuiya = null) => {
  const errors = [];
  const warnings = [];

  const nameResult = standardizeName(row.name || row.fullName || row.full_name);
  if (nameResult.warnings) warnings.push(...nameResult.warnings);

  const regResult = standardizeRegNumber(row.registrationNumber || row.regNumber || row.reg_number || row.registration_number);
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
