"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOTPValidationConfig = getOTPValidationConfig;
exports.normalizeOTPValue = normalizeOTPValue;
exports.removeOTPCharacter = removeOTPCharacter;
exports.replaceOTPValue = replaceOTPValue;
exports.stripOTPWhitespace = stripOTPWhitespace;
const OTP_VALIDATION_CONFIG = {
  numeric: {
    slotPattern: '\\d{1}',
    getRootPattern: length => `\\d{${length}}`,
    regexp: /[^\d]/g,
    inputMode: 'numeric'
  },
  alpha: {
    slotPattern: '[a-zA-Z]{1}',
    getRootPattern: length => `[a-zA-Z]{${length}}`,
    regexp: /[^a-zA-Z]/g,
    inputMode: 'text'
  },
  alphanumeric: {
    slotPattern: '[a-zA-Z0-9]{1}',
    getRootPattern: length => `[a-zA-Z0-9]{${length}}`,
    regexp: /[^a-zA-Z0-9]/g,
    inputMode: 'text'
  }
};
function getOTPValidationConfig(validationType) {
  if (validationType === 'none') {
    return null;
  }
  return OTP_VALIDATION_CONFIG[validationType];
}
function stripOTPWhitespace(value) {
  return (value ?? '').replace(/\s/g, '');
}

/**
 * Normalizes user-entered OTP text by stripping whitespace, applying validation or custom
 * sanitization, and clamping the final value to the configured slot count.
 */
function normalizeOTPValue(value, length, validationType, sanitizeValue) {
  let sanitizedValue = stripOTPWhitespace(value);
  const validation = getOTPValidationConfig(validationType);
  if (validation) {
    sanitizedValue = sanitizedValue.replace(validation.regexp, '');
  } else if (sanitizeValue) {
    sanitizedValue = sanitizeValue(sanitizedValue);
  }

  // Slice by Unicode code points so multi-byte characters do not split across OTP slots.
  return Array.from(sanitizedValue).slice(0, Math.max(length, 0)).join('');
}

/**
 * Replaces characters starting at the provided slot index, then re-normalizes the final OTP value
 * so paste and multi-character edits stay contiguous and length-bounded.
 */
function replaceOTPValue(currentValue, index, nextValue, length, validationType, sanitizeValue) {
  const normalizedValue = normalizeOTPValue(nextValue, length, validationType, sanitizeValue);
  const prefix = currentValue.slice(0, index);
  const suffix = currentValue.slice(index + normalizedValue.length);
  return normalizeOTPValue(`${prefix}${normalizedValue}${suffix}`, length, validationType, sanitizeValue);
}
function removeOTPCharacter(currentValue, index) {
  if (index < 0 || index >= currentValue.length) {
    return currentValue;
  }
  return `${currentValue.slice(0, index)}${currentValue.slice(index + 1)}`;
}