<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { mockNotices } from '@/mock/data'
import { formatTime } from '@/utils/util'

const route = useRoute()

const notice = ref<any>(null)

onMounted(() => {
  const id = route.query.id as string
  const found = mockNotices.find((n) => n._id === id)
  if (found) {
    notice.value = { ...found, timeStr: formatTime(found.createdAt) }
  }
})
</script>

<template>
  <div class="page-container detail-page">
    <div v-if="notice" class="notice-content">
      <div class="notice-title">{{ notice.title }}</div>
      <div class="notice-meta">{{ notice.timeStr }} · 👁 {{ notice.viewCount || 0 }}</div>
      <div class="notice-body">{{ notice.content }}</div>
    </div>
    <div v-else class="empty-state">公告不存在</div>
  </div>
</template>

<style scoped lang="scss">
.detail-page {
  padding: 16px;
}

.notice-content {
  background: #fff;
  border-radius: 8px;
  padding: 20px;

  .notice-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 10px;
  }

  .notice-meta {
    font-size: 12px;
    color: #999;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f5f5f5;
  }

  .notice-body {
    font-size: 15px;
    color: #333;
    line-height: 1.8;
    white-space: pre-wrap;
  }
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: #999;
}
</style>
