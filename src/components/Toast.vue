<script setup lang="ts">
import { useToastState } from '@/utils/toast'

const state = useToastState()
</script>

<template>
  <transition name="fade">
    <div v-if="state.visible" class="toast-overlay">
      <div class="toast-box">
        <span v-if="state.icon === 'success'" class="toast-icon">✓</span>
        <span v-else-if="state.icon === 'error'" class="toast-icon">✗</span>
        <span v-else-if="state.icon === 'loading'" class="toast-icon toast-loading">⟳</span>
        <span class="toast-text">{{ state.title }}</span>
      </div>
    </div>
  </transition>
</template>

<style scoped lang="scss">
.toast-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  pointer-events: none;
}

.toast-box {
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 12px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  max-width: 70%;
}

.toast-icon {
  font-size: 16px;
  font-weight: bold;
}

.toast-loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
