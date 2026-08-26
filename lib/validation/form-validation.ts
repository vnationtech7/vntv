/**
 * Form validation utilities
 * 
 * Reusable validation rules and patterns
 */

export type ValidationRule<T = any> = {
  validate: (value: T) => boolean;
  message: string;
};

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

/**
 * Validate a value against multiple rules
 */
export function validate<T>(value: T, rules: ValidationRule<T>[]): ValidationResult {
  const errors: string[] = [];

  for (const rule of rules) {
    if (!rule.validate(value)) {
      errors.push(rule.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Common validation rules
 */
export const validationRules = {
  required: (message = "This field is required"): ValidationRule<string> => ({
    validate: (value) => value.trim().length > 0,
    message,
  }),

  email: (message = "Please enter a valid email address"): ValidationRule<string> => ({
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),

  minLength: (
    min: number,
    message = `Must be at least ${min} characters`
  ): ValidationRule<string> => ({
    validate: (value) => value.length >= min,
    message,
  }),

  maxLength: (
    max: number,
    message = `Must be no more than ${max} characters`
  ): ValidationRule<string> => ({
    validate: (value) => value.length <= max,
    message,
  }),

  pattern: (
    regex: RegExp,
    message = "Invalid format"
  ): ValidationRule<string> => ({
    validate: (value) => regex.test(value),
    message,
  }),

  url: (message = "Please enter a valid URL"): ValidationRule<string> => ({
    validate: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),

  number: (message = "Please enter a valid number"): ValidationRule<string> => ({
    validate: (value) => !isNaN(Number(value)),
    message,
  }),

  min: (
    min: number,
    message = `Must be at least ${min}`
  ): ValidationRule<number> => ({
    validate: (value) => value >= min,
    message,
  }),

  max: (
    max: number,
    message = `Must be no more than ${max}`
  ): ValidationRule<number> => ({
    validate: (value) => value <= max,
    message,
  }),

  match: (
    otherValue: string,
    message = "Values do not match"
  ): ValidationRule<string> => ({
    validate: (value) => value === otherValue,
    message,
  }),

  password: (message = "Password must be at least 8 characters with at least one uppercase, one lowercase, and one number"): ValidationRule<string> => ({
    validate: (value) =>
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value),
    message,
  }),

  slug: (message = "Only lowercase letters, numbers, and hyphens allowed"): ValidationRule<string> => ({
    validate: (value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
    message,
  }),
};

/**
 * Example usage:
 * 
 * const emailValidation = validate(email, [
 *   validationRules.required(),
 *   validationRules.email(),
 * ]);
 * 
 * if (!emailValidation.isValid) {
 *   console.error(emailValidation.errors);
 * }
 */
