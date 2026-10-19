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
/* ── DESIGN SYSTEM BUTTON ─────────────────────────────────────── */
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  font-family: inherit;
  font-weight: 600;
  line-height: 1.35;
  text-decoration: none;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  cursor: pointer;
  user-select: none;
  border: 1px solid transparent;
  border-radius: 8px;
  transition: all 0.16s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  outline: none;
}

.base-btn:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Sizing */
.btn-sm {
  font-size: 0.8125rem;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  gap: 0.35rem;
}

.btn-md {
  font-size: 0.9rem;
  padding: 0.52rem 1.15rem;
  border-radius: 8px;
  gap: 0.45rem;
}

.btn-lg {
  font-size: 1.025rem;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  gap: 0.6rem;
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
  font-size: 0.95em;
  line-height: 1;
}

.btn-label {
  display: inline-flex;
  align-items: center;
  line-height: 1.25;
}

/* ── VARIANTS ─────────────────────────────────────────────────── */

/* 1. Primary Variant — Matches user reference image (+ Add product) */
.btn-primary {
  background: #3b82f6;
  color: #000000;
  border-color: transparent;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.btn-primary:hover:not(.is-disabled) {
  background: #60a5fa;
  color: #000000;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
}

.btn-primary:active:not(.is-disabled) {
  background: #2563eb;
  color: #000000;
  transform: translateY(0);
}

/* 2. Secondary Variant — Matches dark dashboard table buttons (e.g. Edit) */
.btn-secondary {
  background: #152238;
  color: #cbd5e1;
  border: 1px solid #233554;
  font-weight: 500;
}

.btn-secondary:hover:not(.is-disabled) {
  background: #1c2e4c;
  color: #ffffff;
  border-color: #3b82f6;
  transform: translateY(-1px);
}

.btn-secondary:active:not(.is-disabled) {
  background: #101a2b;
  transform: translateY(0);
}

/* 3. Danger Variant — Delete and destructive actions */
.btn-danger {
  background: #22141c;
  color: #f87171;
  border: 1px solid rgba(248, 113, 113, 0.25);
  font-weight: 500;
}

.btn-danger:hover:not(.is-disabled) {
  background: #ef4444;
  color: #ffffff;
  border-color: #ef4444;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-danger:active:not(.is-disabled) {
  background: #dc2626;
  transform: translateY(0);
}

/* 4. Success Variant */
.btn-success {
  background: #0f281e;
  color: #34d399;
  border: 1px solid rgba(52, 211, 153, 0.25);
  font-weight: 500;
}

.btn-success:hover:not(.is-disabled) {
  background: #10b981;
  color: #ffffff;
  border-color: #10b981;
  transform: translateY(-1px);
}

.btn-success:active:not(.is-disabled) {
  background: #059669;
  transform: translateY(0);
}

/* 5. Warning Variant */
.btn-warning {
  background: #281d0f;
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.25);
  font-weight: 500;
}

.btn-warning:hover:not(.is-disabled) {
  background: #f59e0b;
  color: #000000;
  border-color: #f59e0b;
  transform: translateY(-1px);
}

/* 6. Outline Variant */
.btn-outline {
  background: transparent;
  color: #3b82f6;
  border-color: #3b82f6;
}

.btn-outline:hover:not(.is-disabled) {
  background: rgba(59, 130, 246, 0.12);
  color: #60a5fa;
  border-color: #60a5fa;
  transform: translateY(-1px);
}

/* 7. Ghost Variant */
.btn-ghost {
  background: transparent;
  color: #94a3b8;
  border-color: transparent;
}

.btn-ghost:hover:not(.is-disabled) {
  background: rgba(255, 255, 255, 0.08);
  color: #f8fafc;
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
  width: 1em;
  height: 1em;
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
