// Crockford-style alphabet (no 0/O/1/I/L) for human-readable tokens.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

// crypto.getRandomValues is the cryptographically-secure RNG. Math.random
// is seeded from system entropy on most engines but isn't guaranteed
// uniform under modulo bias and isn't suitable for security tokens.
function pickFromAlphabet(alphabet: string, length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

export function generatePublicToken(prefix = "aac"): string {
  return `${prefix}_${pickFromAlphabet(ALPHABET, 8).toLowerCase()}`;
}

// Re-exportable so vouchers.ts / admin.ts / ticket.ts share the same
// crypto-grade RNG primitive.
export function randomFromAlphabet(alphabet: string, length: number): string {
  return pickFromAlphabet(alphabet, length);
}

export function randomSixDigit(): string {
  // Use 4 bytes (32-bit) modulo 900_000, plus 100_000 baseline.
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const n =
    ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
  return String(100_000 + (n % 900_000));
}
