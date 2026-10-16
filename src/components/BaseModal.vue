<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="isOpen"
        class="modal-backdrop"
        :class="{ 'modal-centered': centered }"
        @click.self="handleOverlayClick"
        tabindex="-1"
        @keydown.esc="handleClose"
      >
        <div
          class="modal-card"
          :class="[`modal-${size}`]"
          role="dialog"
          aria-modal="true"
        >
          <!-- Modal Header -->
          <div v-if="!hideHeader" class="modal-header">
            <div class="header-main">
              <slot name="header">
                <div v-if="icon || $slots.icon" class="modal-header-icon">
                  <slot name="icon">
                    <i :class="icon"></i>
                  </slot>
                </div>
                <div class="header-text">
                  <h3 v-if="title" class="modal-title">{{ title }}</h3>
                  <p v-if="subtitle" class="modal-subtitle">{{ subtitle }}</p>
                </div>
              </slot>
            </div>

            <button
              v-if="!hideClose"
              type="button"
              class="modal-close-btn"
              @click="handleClose"
              aria-label="Close modal"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body" :class="bodyClass">
            <slot></slot>
          </div>

          <!-- Modal Footer -->
          <div v-if="$slots.footer" class="modal-footer" :class="footerClass">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch, onUnmounted } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'md', // sm, md, lg, xl, full
    validator: (s) => ['sm', 'md', 'lg', 'xl', 'full'].includes(s),
  },
  closeOnOverlay: {
    type: Boolean,
    default: true,
  },
  centered: {
    type: Boolean,
    default: true,
  },
  hideHeader: {
    type: Boolean,
    default: false,
  },
  hideClose: {
    type: Boolean,
    default: false,
  },
  bodyClass: {
    type: String,
    default: '',
  },
  footerClass: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['close', 'update:modelValue', 'update:show']);

const isOpen = computed(() => props.show || props.modelValue);

const handleClose = () => {
  emit('close');
  emit('update:modelValue', false);
  emit('update:show', false);
};

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    handleClose();
  }
};

// Manage body scroll locking cleanly
watch(isOpen, (newVal) => {
  if (typeof document !== 'undefined') {
    if (newVal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
});

onUnmounted(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
});
</script>

<style scoped>
/* Backdrop overlay */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(7, 10, 19, 0.82);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 1.5rem;
  overflow-y: auto;
}

.modal-backdrop.modal-centered {
  align-items: center;
}

/* Modal Card */
.modal-card {
  position: relative;
  width: 100%;
  background: #0f172a;
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 1.25rem;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 35px rgba(14, 165, 233, 0.12);
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 3rem);
  overflow: hidden;
  margin: auto 0;
}

/* Modal Sizes */
.modal-sm {
  max-width: 420px;
}

.modal-md {
  max-width: 560px;
}

.modal-lg {
  max-width: 760px;
}

.modal-xl {
  max-width: 980px;
}

.modal-full {
  max-width: calc(100vw - 3rem);
  height: calc(100vh - 3rem);
}

/* Header */
.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(30, 41, 59, 0.8);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: rgba(15, 23, 42, 0.95);
}

.header-main {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
}

.modal-header-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.65rem;
  background: rgba(14, 165, 233, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.header-text {
  min-width: 0;
}

.modal-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
  line-height: 1.3;
}

.modal-subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0.2rem 0 0 0;
}

/* Close Button */
.modal-close-btn {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.5);
  color: #94a3b8;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
  font-size: 0.85rem;
}

.modal-close-btn:hover {
  background: rgba(244, 63, 94, 0.2);
  border-color: rgba(244, 63, 94, 0.4);
  color: #fb7185;
  transform: rotate(90deg);
}

/* Body */
.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  color: #cbd5e1;
}

/* Footer */
.modal-footer {
  padding: 1.15rem 1.5rem;
  border-top: 1px solid rgba(30, 41, 59, 0.8);
  background: rgba(11, 15, 25, 0.7);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-card,
.modal-fade-leave-to .modal-card {
  opacity: 0;
  transform: scale(0.94) translateY(12px);
}

.modal-fade-enter-to .modal-card,
.modal-fade-leave-from .modal-card {
  opacity: 1;
  transform: scale(1) translateY(0);
}
</style>
