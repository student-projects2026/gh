<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { mockNotices } from '@/mock/data'
import { relativeTime } from '@/utils/util'

const router = useRouter()

const notices = ref<any[]>([])

onMounted(() => {
  notices.value = mockNotices.map((item) => ({
    ...item,
    timeStr: relativeTime(item.createdAt),
  }))
})

function goToDetail(id: string) {
  router.push(`/notice/detail?id=${id}`)
}
</script>

<template>
  <div class="page-container notice-page">
    <div class="page-header">
      <div class="header-title">📢 校园公告</div>
    </div>

    <div class="notice-list">
      <div
        v-for="item in notices"
        :key="item._id"
        class="notice-card"
        @click="goToDetail(item._id)"
      >
        <div class="notice-title">{{ item.title }}</div>
        <div class="notice-meta">
          <span>{{ item.timeStr }}</span>
          <span>👁 {{ item.viewCount || 0 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.notice-page {
  padding-bottom: 16px;
}

.page-header {
  background: linear-gradient(135deg, #10aeff 0%, #0e96db 100%);
  padding: 20px 16px;
  color: #fff;

  .header-title {
    font-size: 18px;
    font-weight: 600;
  }
}

.notice-list {
  padding: 12px;
}

.notice-card {
  background: #fff;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 8px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
  cursor: pointer;

  .notice-title {
    font-size: 15px;
    font-weight: 500;
    color: #333;
    margin-bottom: 6px;
  }

  .notice-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: #999;
  }
}
</style>
