<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const showPrompt = ref(false)
const deferredPrompt = ref<any>(null)

function onBeforeInstallPrompt(e: Event) {
  e.preventDefault()
  deferredPrompt.value = e
  showPrompt.value = true
}

async function installApp() {
  if (!deferredPrompt.value) return
  deferredPrompt.value.prompt()
  const { outcome } = await deferredPrompt.value.userChoice
  if (outcome === 'accepted') {
    console.log('PWA installed')
  }
  deferredPrompt.value = null
  showPrompt.value = false
}

function dismiss() {
  showPrompt.value = false
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
})
</script>

<template>
  <transition name="slide-up">
    <div v-if="showPrompt" class="install-banner">
      <div class="install-content">
        <img src="/icons/icon-192x192.png" alt="icon" class="install-icon" />
        <div class="install-info">
          <div class="install-title">安装抚幼校园圈</div>
          <div class="install-desc">添加到主屏幕，像APP一样使用</div>
        </div>
      </div>
      <div class="install-actions">
        <button class="install-btn install-btn-primary" @click="installApp">安装</button>
        <button class="install-btn install-btn-default" @click="dismiss">暂不需要</button>
      </div>
    </div>
  </transition>
</template>

<style scoped lang="scss">
.install-banner {
  position: fixed;
  bottom: 72px;
  left: 12px;
  right: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.install-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.install-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  flex-shrink: 0;
}

.install-info {
  min-width: 0;
}

.install-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.install-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.install-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

.install-btn {
  height: 30px;
  padding: 0 14px;
  border-radius: 6px;
  font-size: 13px;
  border: none;
  font-weight: 500;

  &-primary {
    background: var(--primary);
    color: #fff;
  }

  &-default {
    background: transparent;
    color: var(--text-muted);
  }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>