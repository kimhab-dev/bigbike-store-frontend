import { reactive, computed } from 'vue';

export function useFormValidation(formData, schema) {
  const errors = reactive({});
  const touched = reactive({});

  // Initialize errors and touched keys
  for (const field in schema) {
    errors[field] = '';
    touched[field] = false;
  }

  const validateField = (field) => {
    const rules = schema[field];
    if (!rules || !Array.isArray(rules)) return true;

    const value = formData[field];
    for (const rule of rules) {
      const errorMsg = rule(value);
      if (errorMsg) {
        errors[field] = errorMsg;
        return false;
      }
    }
    errors[field] = '';
    return true;
  };

  const touch = (field) => {
    touched[field] = true;
    validateField(field);
  };

  const validate = () => {
    let isValid = true;
    for (const field in schema) {
      touched[field] = true;
      const fieldValid = validateField(field);
      if (!fieldValid) {
        isValid = false;
      }
    }
    return isValid;
  };

  const resetValidation = () => {
    for (const field in schema) {
      errors[field] = '';
      touched[field] = false;
    }
  };

  const hasErrors = computed(() => {
    return Object.values(errors).some((err) => Boolean(err));
  });

  return {
    errors,
    touched,
    validateField,
    touch,
    validate,
    resetValidation,
    hasErrors,
  };
}
