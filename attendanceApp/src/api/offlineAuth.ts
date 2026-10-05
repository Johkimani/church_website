import { getOfflineCredential, setOfflineCredential } from "../db/db";

/**
 * Local credential verifier for offline sign-in.
 *
 * On a successful ONLINE login we persist a PBKDF2 verifier (never the
 * password itself) so the device can later confirm a typed password with
 * zero connectivity. A random per-device salt means the stored blob is
 * useless on any other device.
 */

const PBKDF2_ITERATIONS = 150_000;

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuf(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

async function deriveVerifier(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: hexToBuf(saltHex) as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  return bufToHex(bits);
}

export interface OfflineProfile {
  member_id?: string;
  name?: string;
  role?: string[];
  jumuiya_id?: string;
}

/** Persist the verifier + basic profile after a successful ONLINE login. */
export async function saveOfflineCredential(
  regNumber: string,
  password: string,
  profile: OfflineProfile
): Promise<void> {
  const salt = bufToHex(crypto.getRandomValues(new Uint8Array(16)).buffer);
  const verifier = await deriveVerifier(password, salt);
  await setOfflineCredential({
    regNumber: regNumber.trim().toUpperCase(),
    salt,
    verifier,
    profile,
    savedAt: Date.now(),
  });
}

/**
 * Verify typed credentials against the locally-stored verifier.
 * Returns false when no credential exists for this device/reg number.
 */
export async function verifyOfflineCredential(
  regNumber: string,
  password: string
): Promise<boolean> {
  const cred = await getOfflineCredential();
  if (!cred) return false;
  if (cred.regNumber !== regNumber.trim().toUpperCase()) return false;
  const candidate = await deriveVerifier(password, cred.salt);
  // Constant-time-ish comparison
  if (candidate.length !== cred.verifier.length) return false;
  let diff = 0;
  for (let i = 0; i < candidate.length; i++) {
    diff |= candidate.charCodeAt(i) ^ cred.verifier.charCodeAt(i);
  }
  return diff === 0;
}
