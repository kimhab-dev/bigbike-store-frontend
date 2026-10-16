<template>
  <component
    :is="componentTag"
    :to="to"
    :href="href"
    :type="isButton ? type : undefined"
    :disabled="isButton ? (disabled || loading) : undefined"
    :aria-disabled="disabled || loading ? 'true' : undefined"
    :tabindex="disabled || loading ? -1 : undefined"
    :class="[
      'base-btn',
      `btn-${variant}`,
      `btn-${size}`,
      {
        'btn-block': block,
        'btn-pill': pill,
        'is-loading': loading,
        'is-disabled': disabled || loading
      }
    ]"
    @click="handleClick"
  >
    <!-- Loading Spinner -->
    <span v-if="loading" class="btn-spinner" aria-hidden="true">
      <svg class="spinner-icon" viewBox="0 0 24 24" fill="none">
        <circle class="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
        <path class="spinner-head" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </span>

    <!-- Left Icon (Slot or Prop) -->
    <span v-if="!loading && (icon || $slots.icon) && iconPosition === 'left'" class="btn-icon btn-icon-left">
      <slot name="icon">
        <i :class="icon"></i>
      </slot>
    </span>

    <!-- Label / Default Slot -->
    <span class="btn-label">
      <template v-if="loading && loadingText">{{ loadingText }}</template>
      <slot v-else></slot>
    </span>

    <!-- Right Icon (Slot or Prop) -->
    <span v-if="!loading && (icon || $slots.iconRight) && iconPosition === 'right'" class="btn-icon btn-icon-right">
      <slot name="iconRight">
        <i :class="icon"></i>
      </slot>
    </span>
  </component>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary', // primary, secondary, outline, ghost, danger, success, warning
    validator: (v) => ['primary', 'secondary', 'outline', 'ghost', 'danger', 'success', 'warning'].includes(v)
  },
  size: {
    type: String,
    default: 'md', // sm, md, lg
    validator: (s) => ['sm', 'md', 'lg'].includes(s)
  },
  type: {
    type: String,
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  iconPosition: {
    type: String,
    default: 'left', // left, right
    validator: (p) => ['left', 'right'].includes(p)
  },
  block: {
    type: Boolean,
    default: false
  },
  pill: {
    type: Boolean,
    default: false
  },
  to: {
    type: [String, Object],
    default: null
  },
  href: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['click']);

const componentTag = computed(() => {
  if (props.to) return 'router-link';
  if (props.href) return 'a';
  return 'button';
});

const isButton = computed(() => !props.to && !props.href);

const handleClick = (event) => {
  if (props.disabled || props.loading) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  emit('click', event);
};
</script>

<style scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: inherit;
  font-weight: 600;
  line-height: 1.25;
  text-decoration: none;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  cursor: pointer;
  user-select: none;
  border: 1px solid transparent;
  border-radius: 0.65rem;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
  outline: none;
}

.base-btn:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 2px;
}

/* Sizing */
.btn-sm {
  font-size: 0.8125rem;
  padding: 0.4rem 0.85rem;
  border-radius: 0.5rem;
}

.btn-md {
  font-size: 0.9375rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.65rem;
}

.btn-lg {
  font-size: 1.05rem;
  padding: 0.8rem 1.6rem;
  border-radius: 0.8rem;
}

/* Width & Shape */
.btn-block {
  width: 100%;
  display: flex;
}

.btn-pill {
  border-radius: 9999px;
}

/* Icons */
.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1em;
}

.btn-label {
  display: inline-flex;
  align-items: center;
}

/* Variants */
/* Primary */
.btn-primary {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: #ffffff;
  border-color: rgba(56, 189, 248, 0.4);
  box-shadow: 0 4px 14px rgba(14, 165, 233, 0.3);
}

.btn-primary:hover:not(.is-disabled) {
  background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
  box-shadow: 0 6px 20px rgba(14, 165, 233, 0.45);
  transform: translateY(-1px);
}

.btn-primary:active:not(.is-disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
}

/* Secondary */
.btn-secondary {
  background: rgba(30, 41, 59, 0.8);
  color: #f1f5f9;
  border-color: rgba(71, 85, 105, 0.6);
  backdrop-filter: blur(8px);
}

.btn-secondary:hover:not(.is-disabled) {
  background: rgba(51, 65, 85, 0.9);
  border-color: rgba(148, 163, 184, 0.5);
  color: #ffffff;
  transform: translateY(-1px);
}

.btn-secondary:active:not(.is-disabled) {
  transform: translateY(0);
}

/* Outline */
.btn-outline {
  background: transparent;
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.4);
}

.btn-outline:hover:not(.is-disabled) {
  background: rgba(14, 165, 233, 0.12);
  border-color: #38bdf8;
  color: #ffffff;
  transform: translateY(-1px);
}

.btn-outline:active:not(.is-disabled) {
  transform: translateY(0);
}

/* Ghost */
.btn-ghost {
  background: transparent;
  color: #94a3b8;
  border-color: transparent;
}

.btn-ghost:hover:not(.is-disabled) {
  background: rgba(255, 255, 255, 0.08);
  color: #f8fafc;
}

/* Danger */
.btn-danger {
  background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
  color: #ffffff;
  border-color: rgba(244, 63, 94, 0.4);
  box-shadow: 0 4px 14px rgba(225, 29, 72, 0.3);
}

.btn-danger:hover:not(.is-disabled) {
  background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
  box-shadow: 0 6px 20px rgba(225, 29, 72, 0.45);
  transform: translateY(-1px);
}

/* Success */
.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  border-color: rgba(52, 211, 153, 0.4);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
}

.btn-success:hover:not(.is-disabled) {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
  transform: translateY(-1px);
}

/* Warning */
.btn-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #ffffff;
  border-color: rgba(251, 191, 36, 0.4);
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);
}

.btn-warning:hover:not(.is-disabled) {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.45);
  transform: translateY(-1px);
}

/* Disabled & Loading States */
.is-disabled {
  opacity: 0.55;
  cursor: not-allowed !important;
  pointer-events: none;
  box-shadow: none !important;
  transform: none !important;
}

/* Spinner */
.btn-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.spinner-icon {
  width: 1.1em;
  height: 1.1em;
  animation: btn-spin 0.75s linear infinite;
}

.spinner-track {
  opacity: 0.25;
}

.spinner-head {
  opacity: 0.9;
}

@keyframes btn-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
