<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { getPosts, deletePost } from '@/mock/api'
import { relativeTime, showModal } from '@/utils/util'
import { showToast } from '@/utils/toast'

const router = useRouter()
const appStore = useAppStore()

const posts = ref<any[]>([])
const loading = ref(false)

onMounted(() => {
  loadPosts()
})

async function loadPosts() {
  if (loading.value) return
  loading.value = true
  try {
    const res = await getPosts({ type: 'confession' })
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
  router.push(`/confession/detail?id=${id}`)
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
  router.push('/confession/publish')
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
  <div class="page-container confession-page">
    <div class="page-header">
      <div class="header-title">💬 吐槽墙</div>
      <div class="header-sub">匿名说出你的心里话</div>
    </div>

    <div class="post-list">
      <div v-if="posts.length === 0 && !loading" class="empty-state">
        <span>暂无吐槽，来抢沙发吧</span>
      </div>

      <div
        v-for="item in posts"
        :key="item._id"
        class="post-card"
        @click="goToDetail(item._id)"
      >
        <div class="post-header">
          <div class="avatar">匿</div>
          <div class="author-info">
            <div class="name">匿名用户</div>
            <div class="meta">{{ item.timeStr }}</div>
          </div>
        </div>

        <div class="post-content">{{ item.content }}</div>

        <div class="post-footer">
          <div class="footer-item">
            <span class="icon">👁</span>
            <span>{{ item.viewCount || 0 }}</span>
          </div>
          <div class="footer-item">
            <span class="icon">👍</span>
            <span>{{ item.likeCount || 0 }}</span>
          </div>
          <div class="footer-item">
            <span class="icon">💬</span>
            <span>{{ item.commentCount || 0 }}</span>
          </div>
          <div v-if="item.canDelete" class="footer-item delete-btn" @click.stop="onDelete(item._id)">
            <span class="icon">🗑️</span>
            <span>删除</span>
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
.confession-page {
  padding-bottom: 16px;
}

.page-header {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
  padding: 20px 16px;
  color: #fff;

  .header-title {
    font-size: 20px;
    font-weight: 600;
  }

  .header-sub {
    font-size: 13px;
    opacity: 0.9;
    margin-top: 4px;
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

  .post-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #fff0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: #fa5151;
      margin-right: 8px;
      flex-shrink: 0;
    }

    .author-info {
      .name {
        font-size: 14px;
        color: #333;
        font-weight: 500;
      }

      .meta {
        font-size: 11px;
        color: #999;
        margin-top: 2px;
      }
    }
  }

  .post-content {
    font-size: 14px;
    color: #333;
    line-height: 1.6;
    margin-bottom: 8px;
  }

  .post-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 8px;
    border-top: 1px solid #f5f5f5;

    .footer-item {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #999;
      gap: 4px;
    }

    .delete-btn {
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
  background: #fa5151;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 4px 12px rgba(250, 81, 81, 0.4);
  cursor: pointer;
  z-index: 50;
}
</style>
