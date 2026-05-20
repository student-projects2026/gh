<script setup lang="ts">
defineProps<{
  title?: string
  showBack?: boolean
  bgColor?: string
}>()

const emit = defineEmits(['back'])

function onBack() {
  emit('back')
}
</script>

<template>
  <div class="nav-bar" :style="{ backgroundColor: bgColor || 'var(--primary)' }">
    <div class="nav-left" @click="onBack">
      <span v-if="showBack" class="nav-back"></span>
    </div>
    <div class="nav-title">{{ title || '抚幼校园圈' }}</div>
    <div class="nav-right"></div>
  </div>
</template>

<style scoped lang="scss">
.nav-bar {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-left {
  width: 40px;
  display: flex;
  align-items: center;
}

.nav-back {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-left: 2px solid #fff;
  border-bottom: 2px solid #fff;
  transform: rotate(45deg);
  cursor: pointer;
}

.nav-title {
  font-size: 16px;
  font-weight: 500;
  flex: 1;
  text-align: center;
}

.nav-right {
  width: 40px;
}
</style>
