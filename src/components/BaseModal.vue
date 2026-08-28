<template>
  <Teleport to="body">
    <Transition name="modal-pop">
      <div
        v-if="isOpen"
        class="modal-backdrop"
        @click.self="handleOverlayClick"
        tabindex="-1"
        @keydown.esc="handleClose"
      >
        <div class="modal-card" :class="[`modal-${size}`]" role="dialog" aria-modal="true">
          <!-- Modal Header -->
          <div class="modal-header">
            <div class="header-text">
              <slot name="header">
                <h3 v-if="title" class="modal-title">{{ title }}</h3>
                <p v-if="subtitle" class="modal-subtitle">{{ subtitle }}</p>
              </slot>
            </div>
            <button
              type="button"
              class="modal-close-btn"
              @click="handleClose"
              aria-label="Close Modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <slot></slot>
          </div>

          <!-- Modal Footer (Optional) -->
          <div v-if="$slots.footer" class="modal-footer">
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
  size: {
    type: String,
    default: 'md', // sm, md, lg, xl
  },
  closeOnOverlay: {
    type: Boolean,
    default: true,
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

// Prevent page body scrolling when modal is open
watch(isOpen, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(7, 10, 18, 0.82);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  overflow-y: auto;
}

.modal-card {
  position: relative;
  width: 100%;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 20px;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(14, 165, 233, 0.15);
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}

/* Modal Sizes */
.modal-sm {
  max-width: 420px;
}

.modal-md {
  max-width: 540px;
}

.modal-lg {
  max-width: 720px;
}

.modal-xl {
  max-width: 960px;
}

/* Header */
.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(51, 65, 85, 0.6);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
}

.modal-subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-top: 0.2rem;
}

.modal-close-btn {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.5);
  color: #94a3b8;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.modal-close-btn svg {
  width: 18px;
  height: 18px;
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
}

/* Footer */
.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(51, 65, 85, 0.6);
  background: rgba(11, 15, 25, 0.6);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.85rem;
}

/* Transitions */
.modal-pop-enter-active,
.modal-pop-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-pop-enter-from,
.modal-pop-leave-to {
  opacity: 0;
}

.modal-pop-enter-from .modal-card,
.modal-pop-leave-to .modal-card {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}
</style>
