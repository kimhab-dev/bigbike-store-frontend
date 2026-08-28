/**
 * Form Validation Rules and Helpers
 */

export const validators = {
  required(message = 'This field is required') {
    return (value) => {
      if (value === null || value === undefined || value === '') {
        return message;
      }
      if (typeof value === 'string' && value.trim() === '') {
        return message;
      }
      if (Array.isArray(value) && value.length === 0) {
        return message;
      }
      return null;
    };
  },

  email(message = 'Please enter a valid email address') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (value) => {
      if (!value) return null; // Let required validator handle empty fields
      return emailRegex.test(value) ? null : message;
    };
  },

  minLength(min, message) {
    return (value) => {
      if (!value) return null;
      const msg = message || `Must be at least ${min} characters`;
      return String(value).length >= min ? null : msg;
    };
  },

  maxLength(max, message) {
    return (value) => {
      if (!value) return null;
      const msg = message || `Must be no more than ${max} characters`;
      return String(value).length <= max ? null : msg;
    };
  },

  pattern(regex, message = 'Invalid format') {
    return (value) => {
      if (!value) return null;
      return regex.test(value) ? null : message;
    };
  },
};
