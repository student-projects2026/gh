<script setup lang="ts">
import { useModalState, confirmModal, cancelModal } from '@/utils/modal'

const state = useModalState()
</script>

<template>
  <transition name="fade">
    <div v-if="state.visible" class="modal-overlay" @click="cancelModal">
      <div class="modal-box" @click.stop>
        <div class="modal-title">{{ state.title }}</div>
        <div class="modal-content">{{ state.content }}</div>
        <div class="modal-actions">
          <button class="modal-btn modal-btn-cancel" @click="cancelModal">取消</button>
          <button class="modal-btn modal-btn-confirm" @click="confirmModal">确定</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
}

.modal-box {
  background: #fff;
  border-radius: 12px;
  width: 280px;
  max-width: 80%;
  overflow: hidden;
}

.modal-title {
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  padding: 20px 16px 8px;
}

.modal-content {
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
  padding: 0 16px 20px;
}

.modal-actions {
  display: flex;
  border-top: 1px solid var(--border);
}

.modal-btn {
  flex: 1;
  height: 48px;
  border: none;
  background: none;
  font-size: 15px;
  cursor: pointer;

  &-cancel {
    color: var(--text);
    border-right: 1px solid var(--border);
  }

  &-confirm {
    color: var(--primary);
    font-weight: 500;
  }
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
