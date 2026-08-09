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

/** Mirrors backEnd/src/utils/passwordPolicy.js. Returns an error string or "" */
export function validatePassword(password: string, memberId?: string): string {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/\d/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    return "Password must include uppercase, lowercase, a number, and a symbol";
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return "That password is too common. Choose a more unique one";
  }
  if (memberId && password.toUpperCase() === memberId.toUpperCase()) {
    return "Password cannot be your registration number";
  }
  return "";
}
