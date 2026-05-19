// Crockford-style alphabet (no 0/O/1/I/L) for human-readable tokens.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function generatePublicToken(prefix = "aac"): string {
  let suffix = "";
  for (let i = 0; i < 8; i++) {
    suffix += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `${prefix}_${suffix.toLowerCase()}`;
}
