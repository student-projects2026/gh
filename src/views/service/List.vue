<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { getPosts, deletePost } from '@/mock/api'
import { relativeTime, showModal } from '@/utils/util'
import { showToast } from '@/utils/toast'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const type = computed(() => (route.meta.type as string) || 'job')
const title = computed(() => (route.meta.title as string) || '校园服务')

const posts = ref<any[]>([])
const loading = ref(false)

onMounted(() => {
  loadPosts()
})

async function loadPosts() {
  if (loading.value) return
  loading.value = true
  try {
    const res = await getPosts({ type: type.value })
    if (res.code === 0) {
      const openid = appStore.userInfo?._openid
      const isAdmin = appStore.isAdmin
      posts.value = res.data.list.map((item: any) => ({
        ...item,
        timeStr: relativeTime(item.createdAt),
        canDelete: openid && (item._openid === openid || isAdmin),
      }))
    }
  } catch (e) {
    console.log('加载失败', e)
  } finally {
    loading.value = false
  }
}

function goToDetail(id: string) {
  router.push(`/${type.value}/detail?id=${id}`)
}

function goToPublish() {
  if (!appStore.isLoggedIn) {
    router.push('/login')
    return
  }
  if (!appStore.isVerified) {
    showToast('请先完成校园认证', 'none')
    router.push('/verify')
    return
  }
  if (!appStore.canPublishContact) {
    showToast('需要管理员授权才能发布此类信息', 'none')
    return
  }
  router.push(`/${type.value}/publish`)
}

async function onDelete(id: string) {
  const confirm = await showModal('删除帖子', '确认删除？删除后无法恢复')
  if (!confirm) return
  try {
    const res = await deletePost(id)
    if (res.code === 0) {
      showToast('删除成功', 'success')
      posts.value = posts.value.filter((p) => p._id !== id)
    } else {
      showToast(res.message || '删除失败', 'error')
    }
  } catch (err) {
    showToast('删除失败', 'error')
  }
}
</script>

<template>
  <div class="page-container service-page">
    <div class="page-header">
      <div class="header-title">{{ title }}</div>
    </div>

    <div class="post-list">
      <div v-if="posts.length === 0 && !loading" class="empty-state">
        <span>暂无内容</span>
      </div>

      <div
        v-for="item in posts"
        :key="item._id"
        class="post-card"
        @click="goToDetail(item._id)"
      >
        <div v-if="item.title" class="post-title">{{ item.title }}</div>
        <div class="post-content">{{ item.content }}</div>

        <div v-if="item.images && item.images.length > 0" class="post-images">
          <img v-for="(img, idx) in item.images" :key="idx" :src="img" />
        </div>

        <div class="post-footer">
          <div class="footer-left">
            <span class="avatar-sm">{{ item.isAnonymous ? '匿' : (item.authorNickName ? item.authorNickName[0] : '用') }}</span>
            <span class="author-name">{{ item.isAnonymous ? '匿名用户' : item.authorNickName }}</span>
            <span class="time">{{ item.timeStr }}</span>
          </div>
          <div class="footer-right">
            <span v-if="item.canDelete" class="delete-btn" @click.stop="onDelete(item._id)">删除</span>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading-more">加载中...</div>
    </div>

    <div class="float-btn" @click="goToPublish">
      <span>+</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.service-page {
  padding-bottom: 16px;
}

.page-header {
  background: linear-gradient(135deg, #07c160 0%, #05a050 100%);
  padding: 16px;
  color: #fff;

  .header-title {
    font-size: 18px;
    font-weight: 600;
  }
}

.post-list {
  padding: 12px;
}

.post-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
  cursor: pointer;

  .post-title {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin-bottom: 6px;
  }

  .post-content {
    font-size: 14px;
    color: #333;
    line-height: 1.6;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .post-images {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
    margin-bottom: 8px;

    img {
      width: 100%;
      height: 100px;
      border-radius: 4px;
      object-fit: cover;
    }
  }

  .post-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 8px;
    border-top: 1px solid #f5f5f5;

    .footer-left {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #999;

      .avatar-sm {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #e6f7ed;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: var(--primary);
      }
    }

    .delete-btn {
      font-size: 12px;
      color: #fa5151;
    }
  }
}

.float-btn {
  position: fixed;
  right: 16px;
  bottom: 80px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 4px 12px rgba(7, 193, 96, 0.4);
  cursor: pointer;
  z-index: 50;
}
</style>
