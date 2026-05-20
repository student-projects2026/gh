<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { adminGetPosts, auditContent } from '@/mock/api'
import { relativeTime, showModal } from '@/utils/util'
import { showToast } from '@/utils/toast'

const router = useRouter()

const posts = ref<any[]>([])
const loading = ref(false)
const activeTab = ref('pending')

const tabs = [
  { key: 'pending', label: '待审核' },
  { key: 'approved', label: '已通过' },
  { key: 'rejected', label: '已驳回' },
]

onMounted(() => {
  loadPosts()
})

async function loadPosts() {
  loading.value = true
  try {
    const res = await adminGetPosts({ status: activeTab.value })
    if (res.code === 0) {
      posts.value = res.data.list.map((item: any) => ({
        ...item,
        timeStr: relativeTime(item.createdAt),
      }))
    }
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}

function switchTab(key: string) {
  activeTab.value = key
  loadPosts()
}

async function handleAudit(postId: string, action: string) {
  const actionText = action === 'approve' ? '通过' : action === 'reject' ? '驳回' : '删除'
  const confirm = await showModal(`确认${actionText}`, `确定要${actionText}该帖子吗？`)
  if (!confirm) return
  try {
    const res = await auditContent({ targetType: 'post', targetId: postId, action })
    if (res.code === 0) {
      showToast(`${actionText}成功`, 'success')
      loadPosts()
    } else {
      showToast(res.message, 'error')
    }
  } catch (e) {
    showToast('操作失败', 'error')
  }
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="page-container admin-page">
    <div class="admin-header">
      <span class="back-btn" @click="goBack">←</span>
      <span class="header-title">内容审核</span>
      <span></span>
    </div>

    <div class="tab-bar">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="switchTab(tab.key)"
      >
        {{ tab.label }}
      </div>
    </div>

    <div v-if="loading" class="loading-more">加载中...</div>

    <div v-else-if="posts.length === 0" class="empty-state">
      <span>该状态下暂无内容</span>
    </div>

    <div v-else class="post-list">
      <div v-for="item in posts" :key="item._id" class="post-card">
        <div class="post-header">
          <span class="avatar">{{ item.isAnonymous ? '匿' : (item.authorNickName ? item.authorNickName[0] : '用') }}</span>
          <span class="name">{{ item.isAnonymous ? '匿名用户' : item.authorNickName }}</span>
          <span class="time">{{ item.timeStr }}</span>
        </div>
        <div v-if="item.title" class="post-title">{{ item.title }}</div>
        <div class="post-content">{{ item.content }}</div>
        <div v-if="item.images?.length" class="post-images">
          <img v-for="(img, idx) in item.images" :key="idx" :src="img" />
        </div>
        <div v-if="activeTab === 'pending'" class="action-bar">
          <button class="btn btn-sm btn-primary" @click="handleAudit(item._id, 'approve')">通过</button>
          <button class="btn btn-sm btn-default" @click="handleAudit(item._id, 'reject')">驳回</button>
          <button class="btn btn-sm btn-danger" @click="handleAudit(item._id, 'delete')">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.admin-page {
  padding: 12px;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  .back-btn {
    font-size: 18px;
    cursor: pointer;
  }

  .header-title {
    font-size: 17px;
    font-weight: 600;
  }
}

.tab-bar {
  display: flex;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 10px 0;
    font-size: 14px;
    color: #666;
    cursor: pointer;
    border-bottom: 2px solid transparent;

    &.active {
      color: var(--primary);
      border-bottom-color: var(--primary);
      font-weight: 500;
    }
  }
}

.post-list {
  .post-card {
    background: #fff;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 10px;

    .post-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 13px;
      color: #666;

      .avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #e6f7ed;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        color: var(--primary);
      }

      .name {
        flex: 1;
        font-weight: 500;
      }

      .time {
        color: #999;
        font-size: 12px;
      }
    }

    .post-title {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 6px;
    }

    .post-content {
      font-size: 14px;
      color: #333;
      line-height: 1.6;
      margin-bottom: 8px;
    }

    .post-images {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4px;
      margin-bottom: 10px;

      img {
        width: 100%;
        height: 80px;
        border-radius: 4px;
        object-fit: cover;
      }
    }

    .action-bar {
      display: flex;
      gap: 8px;
      padding-top: 10px;
      border-top: 1px solid #f5f5f5;
    }
  }
}
</style>
