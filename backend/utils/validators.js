// Small, dependency-free validation helpers used across controllers.
// Backend validation is required even when the frontend already checks
// these fields, since the frontend can always be bypassed.

const PHONE_REGEX = /^[6-9]\d{9}$/; // 10-digit Indian mobile number
const SUPPORTED_LANGUAGES = ['en', 'ta', 'hi', 'te', 'kn', 'mr', 'bn'];
const PUBLIC_ROLES = ['farmer', 'buyer', 'fpo']; // 'admin' is deliberately excluded

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidPhone(phone) {
  return isNonEmptyString(phone) && PHONE_REGEX.test(phone.trim());
}

function isPositiveNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isNonNegativeNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

// Requires: 8+ chars, at least one letter and one number. Kept deliberately
// simple (this is a student project, not a banking app) but stops the
// weakest passwords ("123456", "aaaaaa") that the old 6-char-minimum let through.
function isStrongPassword(password) {
  if (typeof password !== 'string' || password.length < 8) return false;
  return /[A-Za-z]/.test(password) && /\d/.test(password);
}

function isValidRole(role, allowed = PUBLIC_ROLES) {
  return allowed.includes(role);
}

function isValidLanguage(lang) {
  return lang === undefined || SUPPORTED_LANGUAGES.includes(lang);
}

// Collects errors instead of throwing on the first one, so the client can
// show all problems at once.
class ValidationErrors {
  constructor() {
    this.errors = [];
  }
  add(field, message) {
    this.errors.push({ field, message });
    return this;
  }
  get hasErrors() {
    return this.errors.length > 0;
  }
  get message() {
    return this.errors.map((e) => e.message).join('; ');
  }
}

module.exports = {
  PHONE_REGEX,
  SUPPORTED_LANGUAGES,
  PUBLIC_ROLES,
  isNonEmptyString,
  isValidPhone,
  isPositiveNumber,
  isNonNegativeNumber,
  isStrongPassword,
  isValidRole,
  isValidLanguage,
  ValidationErrors,
};
