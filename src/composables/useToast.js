import { useToastStore } from '@/stores/toast';

export function useToast() {
  const toastStore = useToastStore();

  return {
    toasts: toastStore.toasts,
    show: toastStore.addToast.bind(toastStore),
    success: toastStore.success.bind(toastStore),
    error: toastStore.error.bind(toastStore),
    warning: toastStore.warning.bind(toastStore),
    info: toastStore.info.bind(toastStore),
    remove: toastStore.removeToast.bind(toastStore),
  };
}
