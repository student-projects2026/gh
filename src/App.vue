<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import Toast from '@/components/Toast.vue'
import Modal from '@/components/Modal.vue'
import PwaInstall from '@/components/PwaInstall.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const showTabBar = computed(() => {
  const tabPaths = ['/', '/forum/list', '/confession/list', '/user']
  return tabPaths.includes(route.path)
})

const activeTab = computed(() => route.path)

function switchTab(path: string) {
  router.replace(path)
}

const tabs = [
  { path: '/', icon: '🏠', text: '首页' },
  { path: '/forum/list', icon: '📢', text: '论坛' },
  { path: '/confession/list', icon: '💬', text: '吐槽墙' },
  { path: '/user', icon: '👤', text: '我的' },
]
</script>

<template>
  <div class="app-wrapper">
    <div class="page-content">
      <router-view v-slot="{ Component }">
        <transition name="slide" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <div v-if="showTabBar" class="tab-bar">
      <div
        v-for="tab in tabs"
        :key="tab.path"
        class="tab-item"
        :class="{ active: activeTab === tab.path }"
        @click="switchTab(tab.path)"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-text">{{ tab.text }}</span>
      </div>
    </div>

    <Toast />
    <Modal />
    <PwaInstall />
  </div>
</template>

<style scoped lang="scss">
.app-wrapper {
  max-width: 430px;
  margin: 0 auto;
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
  background: var(--bg);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
}

.page-content {
  min-height: 100vh;
  min-height: 100dvh;
  padding-bottom: calc(56px + env(safe-area-inset-bottom, 0px));
}

.tab-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  height: calc(56px + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: #fff;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  z-index: 200;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  color: var(--text-muted);
  transition: color 0.2s;

  &.active {
    color: var(--primary);
  }
}

.tab-icon {
  font-size: 20px;
  line-height: 1;
}

.tab-text {
  font-size: 11px;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.15s ease;
}
.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

@media (max-width: 430px) {
  .app-wrapper {
    max-width: 100%;
  }
  .tab-bar {
    max-width: 100%;
    left: 0;
    transform: none;
  }
}
</style>
