/**
 * String and data generation helpers.
 * All generated values include timestamps for traceability.
 */

/** Get current timestamp in compact format: YYYYMMDDHHmmss */
export function getTimestamp(): string {
  return new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
}

/** Get Unix timestamp in seconds */
export function getUnixTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Generate a unique, traceable email address.
 * Format: `auto_<prefix>_<timestamp>_<random>@auto.test`
 */
export function generateEmail(prefix = 'test'): string {
  return `auto_${prefix}_${getTimestamp()}_${Math.floor(Math.random() * 1000)}@auto.test`;
}

/**
 * Generate a unique, traceable username.
 * Format: `auto_<prefix>_<timestamp>_<random>`
 */
export function generateUsername(prefix = 'u'): string {
  const ts = Date.now().toString().slice(-8);
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}_${ts}${rand}`.slice(0, 16);
}

/**
 * Generate a unique course code.
 * Format: `AUTO_<PREFIX>_<timestamp>`
 */
export function generateCourseCode(prefix = 'COURSE'): string {
  return `AUTO_${prefix}_${getTimestamp()}`;
}

/**
 * Generate a random Vietnamese phone number.
 * Format: 09xxxxxxxx
 */
export function generatePhoneNumber(): string {
  const suffix = Math.floor(Math.random() * 100_000_000)
    .toString()
    .padStart(8, '0');
  return `09${suffix}`;
}

/**
 * Generate a random string of given length.
 */
export function generateRandomString(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Format a date string for API usage.
 * Format: DD/MM/YYYY
 */
export function formatDateDDMMYYYY(date: Date = new Date()): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
