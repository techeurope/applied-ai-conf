/**
 * free-email-domains.mjs - Email domain classifier
 *
 * Classifies emails as business or personal based on a hardcoded
 * list of ~50 free/personal email providers (including German ones).
 */

const FREE_DOMAINS = new Set([
  // Global
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "yahoo.de",
  "yahoo.fr",
  "hotmail.com",
  "hotmail.co.uk",
  "hotmail.de",
  "hotmail.fr",
  "outlook.com",
  "outlook.de",
  "live.com",
  "live.de",
  "msn.com",
  "aol.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "mail.com",
  "protonmail.com",
  "proton.me",
  "zoho.com",
  "yandex.com",
  "yandex.ru",
  "fastmail.com",
  "tutanota.com",
  "tuta.io",
  "hey.com",
  "pm.me",
  // German providers
  "gmx.de",
  "gmx.net",
  "gmx.at",
  "gmx.ch",
  "web.de",
  "t-online.de",
  "freenet.de",
  "arcor.de",
  "posteo.de",
  "mailbox.org",
  "1und1.de",
  "ionos.de",
  "vodafone.de",
  "o2online.de",
  // Other European
  "orange.fr",
  "free.fr",
  "laposte.net",
  "libero.it",
  "bluewin.ch",
]);

/**
 * Check if an email address uses a free/personal domain.
 * Returns true for business emails, false for personal.
 */
export function isBusinessEmail(email) {
  const domain = email.toLowerCase().split("@")[1];
  if (!domain) return false;
  return !FREE_DOMAINS.has(domain);
}

/**
 * Extract domain from email address.
 */
export function getDomain(email) {
  return email.toLowerCase().split("@")[1] || "";
}
