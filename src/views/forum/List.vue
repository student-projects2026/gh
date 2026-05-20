<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { getPosts, deletePost } from '@/mock/api'
import { relativeTime, showModal } from '@/utils/util'
import { showToast } from '@/utils/toast'

const router = useRouter()
const appStore = useAppStore()

const categories = ['全部', '校园日常', '运动组队', '学习搭子', '拼车结伴', '社团动态', '校园求助', '失物招领']
const activeCategory = ref('全部')
const posts = ref<any[]>([])
const loading = ref(false)

onMounted(() => {
  loadPosts()
})

async function loadPosts() {
  if (loading.value) return
  loading.value = true
  try {
    const category = activeCategory.value === '全部' ? '' : activeCategory.value
    const res = await getPosts({ type: 'forum', category })
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

function onCategoryTap(name: string) {
  activeCategory.value = name
  loadPosts()
}

function goToDetail(id: string) {
  router.push(`/forum/detail?id=${id}`)
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
  router.push('/forum/publish')
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
  <div class="page-container forum-page">
    <div class="category-bar">
      <div class="category-list">
        <div
          v-for="item in categories"
          :key="item"
          class="category-item"
          :class="{ active: activeCategory === item }"
          @click="onCategoryTap(item)"
        >
          {{ item }}
        </div>
      </div>
    </div>

    <div class="post-list">
      <div v-if="posts.length === 0 && !loading" class="empty-state">
        <span>该分类暂无帖子</span>
      </div>

      <div
        v-for="item in posts"
        :key="item._id"
        class="post-card"
        @click="goToDetail(item._id)"
      >
        <div class="post-header">
          <div class="avatar">{{ item.isAnonymous ? '匿' : (item.authorNickName ? item.authorNickName[0] : '用') }}</div>
          <div class="author-info">
            <div class="name">{{ item.isAnonymous ? '匿名用户' : item.authorNickName }}</div>
            <div class="meta">{{ item.timeStr }}</div>
          </div>
          <div v-if="item.category" class="category-tag">{{ item.category }}</div>
        </div>

        <div v-if="item.title" class="post-title">{{ item.title }}</div>
        <div class="post-content">{{ item.content }}</div>

        <div v-if="item.images && item.images.length > 0" class="post-images">
          <img v-for="(img, idx) in item.images" :key="idx" :src="img" />
        </div>

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
.forum-page {
  padding-bottom: 16px;
}

.category-bar {
  background: #fff;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 10;

  .category-list {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    white-space: nowrap;

    .category-item {
      display: inline-flex;
      align-items: center;
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 13px;
      color: #666;
      background: #f5f5f5;
      cursor: pointer;
      transition: all 0.2s;

      &.active {
        background: var(--primary);
        color: #fff;
      }
    }
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
      background: #e6f7ed;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: var(--primary);
      margin-right: 8px;
      flex-shrink: 0;
    }

    .author-info {
      flex: 1;

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

    .category-tag {
      padding: 2px 6px;
      background: #f0f0f0;
      color: #666;
      font-size: 10px;
      border-radius: 3px;
    }
  }

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
