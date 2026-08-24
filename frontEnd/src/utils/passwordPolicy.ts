const COMMON_PASSWORDS = new Set([
  "password", "password1", "password123", "123456", "1234567", "12345678",
  "123456789", "1234567890", "12345", "1234", "12345678910", "qwerty",
  "qwerty123", "abc123", "abc12345", "iloveyou", "admin", "admin123",
  "letmein", "welcome", "monkey", "dragon", "football", "baseball",
  "master", "sunshine", "princess", "shadow", "superman", "michael",
  "ninja", "mustang", "batman", "trustno1", "whatever", "000000",
  "111111", "a1b2c3", "1q2w3e4r", "1qaz2wsx", "zaq12wsx", "987654321",
  "passw0rd", "default", "csakyu", "csakirinyaga", "kirinyaga",
]);

export interface PasswordRule {
  key: string;
  label: string;
  test: (pw: string, memberId?: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { key: "length",     label: "At least 8 characters",       test: (pw) => pw.length >= 8 },
  { key: "uppercase",  label: "An uppercase letter (A–Z)",   test: (pw) => /[A-Z]/.test(pw) },
  { key: "lowercase",  label: "A lowercase letter (a–z)",    test: (pw) => /[a-z]/.test(pw) },
  { key: "number",     label: "A number (0–9)",               test: (pw) => /\d/.test(pw) },
  { key: "symbol",     label: "A special character (!@#…)",  test: (pw) => /[^A-Za-z0-9]/.test(pw) },
  { key: "not_common", label: "Not a common password",        test: (pw) => !COMMON_PASSWORDS.has(pw.toLowerCase()) },
  { key: "not_reg",    label: "Different from your reg number", test: (pw, mid) => !mid || pw.toUpperCase() !== mid.toUpperCase() },
];

export function allPasswordRulesMet(password: string, memberId?: string): boolean {
  return PASSWORD_RULES.every((r) => r.test(password, memberId));
}

/** Mirrors backEnd/src/utils/passwordPolicy.js. Returns an error string or "" */
export function validatePassword(password: string, memberId?: string): string {
  if (!password) return "Password is required";
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(password, memberId)) {
      if (rule.key === "length") return "Password must be at least 8 characters";
      if (rule.key === "uppercase" || rule.key === "lowercase" || rule.key === "number" || rule.key === "symbol")
        return "Password must include uppercase, lowercase, a number, and a symbol";
      if (rule.key === "not_common") return "That password is too common. Choose a more unique one";
      if (rule.key === "not_reg") return "Password cannot be your registration number";
    }
  }
  return "";
}
