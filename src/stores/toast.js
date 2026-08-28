import { defineStore } from 'pinia';

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [],
  }),

  actions: {
    addToast({ message, type = 'info', title = '', duration = 4000 }) {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      const toast = {
        id,
        message,
        type, // 'success' | 'error' | 'warning' | 'info'
        title,
        duration,
      };

      this.toasts.push(toast);

      if (duration > 0) {
        setTimeout(() => {
          this.removeToast(id);
        }, duration);
      }

      return id;
    },

    success(message, title = 'Success', duration = 4000) {
      return this.addToast({ message, type: 'success', title, duration });
    },

    error(message, title = 'Error', duration = 5000) {
      return this.addToast({ message, type: 'error', title, duration });
    },

    warning(message, title = 'Warning', duration = 4000) {
      return this.addToast({ message, type: 'warning', title, duration });
    },

    info(message, title = 'Info', duration = 4000) {
      return this.addToast({ message, type: 'info', title, duration });
    },

    removeToast(id) {
      const index = this.toasts.findIndex((t) => t.id === id);
      if (index !== -1) {
        this.toasts.splice(index, 1);
      }
    },
  },
});
