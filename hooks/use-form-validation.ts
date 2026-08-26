"use client";

import { useState, useCallback } from "react";
import { ValidationRule, validate } from "@/lib/validation/form-validation";

/**
 * Hook for form validation
 * 
 * Usage:
 * const { values, errors, handleChange, handleSubmit, isValid } = useFormValidation({
 *   email: {
 *     initialValue: "",
 *     rules: [validationRules.required(), validationRules.email()],
 *   },
 * });
 */

export interface FieldConfig<T = any> {
  initialValue: T;
  rules?: ValidationRule<T>[];
}

export interface FormConfig {
  [key: string]: FieldConfig;
}

export function useFormValidation<T extends FormConfig>(config: T) {
  type Values = {
    [K in keyof T]: T[K]["initialValue"];
  };

  type Errors = {
    [K in keyof T]?: string[];
  };

  // Initialize values
  const initialValues = Object.keys(config).reduce((acc, key) => {
    acc[key as keyof T] = config[key].initialValue;
    return acc;
  }, {} as Values);

  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Set<keyof T>>(new Set());

  // Validate a single field
  const validateField = useCallback(
    (name: keyof T, value: any): string[] => {
      const fieldConfig = config[name];
      if (!fieldConfig || !fieldConfig.rules) return [];

      const result = validate(value, fieldConfig.rules);
      return result.errors;
    },
    [config]
  );

  // Validate all fields
  const validateAll = useCallback((): boolean => {
    const newErrors: Errors = {};
    let isValid = true;

    Object.keys(config).forEach((key) => {
      const fieldErrors = validateField(key as keyof T, values[key as keyof T]);
      if (fieldErrors.length > 0) {
        newErrors[key as keyof T] = fieldErrors;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [config, values, validateField]);

  // Handle field change
  const handleChange = useCallback(
    (name: keyof T) => (value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Validate if field has been touched
      if (touched.has(name)) {
        const fieldErrors = validateField(name, value);
        setErrors((prev) => ({
          ...prev,
          [name]: fieldErrors.length > 0 ? fieldErrors : undefined,
        }));
      }
    },
    [touched, validateField]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (name: keyof T) => () => {
      setTouched((prev) => new Set(prev).add(name));

      // Validate on blur
      const fieldErrors = validateField(name, values[name]);
      setErrors((prev) => ({
        ...prev,
        [name]: fieldErrors.length > 0 ? fieldErrors : undefined,
      }));
    },
    [values, validateField]
  );

  // Handle form submit
  const handleSubmit = useCallback(
    (onSubmit: (values: Values) => void | Promise<void>) =>
      async (e: React.FormEvent) => {
        e.preventDefault();

        // Mark all fields as touched
        setTouched(new Set(Object.keys(config) as Array<keyof T>));

        // Validate all fields
        const isValid = validateAll();

        if (isValid) {
          await onSubmit(values);
        }
      },
    [config, values, validateAll]
  );

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched(new Set());
  }, [initialValues]);

  // Set field value programmatically
  const setValue = useCallback((name: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Set field error programmatically
  const setFieldError = useCallback((name: keyof T, error: string[]) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched: Array.from(touched),
    handleChange,
    handleBlur,
    handleSubmit,
    validateAll,
    reset,
    setValue,
    setFieldError,
    isValid,
  };
}
