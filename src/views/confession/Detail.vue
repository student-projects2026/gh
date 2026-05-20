<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { getPostDetail, likePost, createComment, getComments, deletePost } from '@/mock/api'
import { relativeTime, showModal } from '@/utils/util'
import { showToast } from '@/utils/toast'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const postId = ref('')
const post = ref<any>(null)
const comments = ref<any[]>([])
const commentInput = ref('')
const loading = ref(true)
const liked = ref(false)
const canDelete = ref(false)

onMounted(() => {
  const id = route.query.id as string
  if (id) {
    postId.value = id
    loadPostDetail(id)
    loadComments(id)
  }
})

async function loadPostDetail(id: string) {
  try {
    const res = await getPostDetail(id)
    if (res.code === 0) {
      post.value = { ...res.data, timeStr: relativeTime(res.data.createdAt) }
      const openid = appStore.userInfo?._openid
      const isAdmin = appStore.isAdmin
      canDelete.value = openid && (post.value._openid === openid || isAdmin)
      liked.value = post.value.likedBy?.includes(openid)
    }
  } catch (e) {
    console.log('加载失败', e)
  } finally {
    loading.value = false
  }
}

async function loadComments(id: string) {
  try {
    const res = await getComments(id)
    if (res.code === 0) {
      comments.value = res.data.map((item: any) => ({
        ...item,
        timeStr: relativeTime(item.createdAt),
      }))
    }
  } catch (e) {
    console.log('加载评论失败', e)
  }
}

async function onLike() {
  try {
    const res = await likePost(postId.value)
    if (res.code === 0) {
      liked.value = res.data.liked
      post.value.likeCount = res.data.likeCount
    }
  } catch (e) {
    showToast('操作失败', 'error')
  }
}

async function onSubmitComment() {
  const text = commentInput.value.trim()
  if (!text) {
    showToast('请输入评论内容', 'none')
    return
  }
  if (!appStore.isLoggedIn) {
    router.push('/login')
    return
  }
  try {
    const res = await createComment({ postId: postId.value, content: text, isAnonymous: true })
    if (res.code === 0) {
      showToast('评论成功', 'success')
      commentInput.value = ''
      loadComments(postId.value)
      if (post.value) post.value.commentCount = (post.value.commentCount || 0) + 1
    } else {
      showToast(res.message, 'error')
    }
  } catch (e: any) {
    showToast(e?.message || '评论失败', 'error')
  }
}

async function onDelete() {
  const confirm = await showModal('删除帖子', '确认删除？删除后无法恢复')
  if (!confirm) return
  try {
    const res = await deletePost(postId.value)
    if (res.code === 0) {
      showToast('删除成功', 'success')
      setTimeout(() => router.back(), 800)
    } else {
      showToast(res.message || '删除失败', 'error')
    }
  } catch (e) {
    showToast('删除失败', 'error')
  }
}
</script>

<template>
  <div class="page-container detail-page">
    <div v-if="loading" class="loading-state">
      <span>加载中...</span>
    </div>

    <div v-else-if="post">
      <div class="post-section">
        <div class="post-header">
          <div class="avatar">匿</div>
          <div class="author-info">
            <div class="name">匿名用户</div>
            <div class="meta">{{ post.timeStr }}</div>
          </div>
        </div>

        <div class="post-content">{{ post.content }}</div>

        <div class="post-actions">
          <div class="action-item" :class="{ active: liked }" @click="onLike">
            <span class="icon">👍</span>
            <span>{{ post.likeCount || 0 }}</span>
          </div>
          <div v-if="canDelete" class="action-item" @click="onDelete">
            <span class="icon">🗑️</span>
            <span>删除</span>
          </div>
        </div>
      </div>

      <div class="comment-section">
        <div class="section-title">评论 {{ post.commentCount || 0 }}</div>

        <div v-if="comments.length === 0" class="empty-state">
          <span>暂无评论，来说两句吧</span>
        </div>

        <div v-for="item in comments" :key="item._id" class="comment-item">
          <div class="comment-header">
            <div class="avatar-sm">{{ item.isAnonymous ? '匿' : (item.authorNickName ? item.authorNickName[0] : '用') }}</div>
            <div class="name">{{ item.isAnonymous ? '匿名用户' : item.authorNickName }}</div>
            <div class="comment-time">{{ item.timeStr }}</div>
          </div>
          <div class="comment-content">{{ item.content }}</div>
        </div>
      </div>
    </div>

    <div class="comment-input-bar">
      <input v-model="commentInput" class="comment-input" placeholder="匿名评论..." @keyup.enter="onSubmitComment" />
      <button class="send-btn" @click="onSubmitComment">发送</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.detail-page {
  padding-bottom: 60px;
}

.loading-state {
  text-align: center;
  padding: 60px;
  color: #999;
}

.post-section {
  background: #fff;
  padding: 16px;
  margin-bottom: 12px;

  .post-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #fff0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: #fa5151;
      margin-right: 10px;
      flex-shrink: 0;
    }

    .author-info {
      .name {
        font-size: 15px;
        font-weight: 500;
        color: #333;
      }

      .meta {
        font-size: 12px;
        color: #999;
        margin-top: 2px;
      }
    }
  }

  .post-content {
    font-size: 15px;
    color: #333;
    line-height: 1.7;
    margin-bottom: 16px;
  }

  .post-actions {
    display: flex;
    gap: 16px;
    padding-top: 12px;
    border-top: 1px solid #f5f5f5;

    .action-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      color: #666;
      cursor: pointer;

      &.active {
        color: var(--primary);
      }
    }
  }
}

.comment-section {
  background: #fff;
  padding: 16px;
  min-height: 200px;

  .section-title {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
  }

  .comment-item {
    padding: 12px 0;
    border-bottom: 1px solid #f5f5f5;

    .comment-header {
      display: flex;
      align-items: center;
      margin-bottom: 6px;

      .avatar-sm {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #fff0f0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        color: #fa5151;
        margin-right: 8px;
        flex-shrink: 0;
      }

      .name {
        font-size: 13px;
        color: #333;
        font-weight: 500;
        flex: 1;
      }

      .comment-time {
        font-size: 11px;
        color: #999;
      }
    }

    .comment-content {
      font-size: 14px;
      color: #333;
      line-height: 1.6;
      padding-left: 32px;
    }
  }
}

.comment-input-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff;
  border-top: 1px solid var(--border);
  z-index: 50;

  .comment-input {
    flex: 1;
    height: 38px;
    border: 1px solid var(--border);
    border-radius: 19px;
    padding: 0 14px;
    font-size: 14px;
    outline: none;

    &:focus {
      border-color: var(--primary);
    }
  }

  .send-btn {
    height: 36px;
    padding: 0 16px;
    border-radius: 18px;
    border: none;
    background: var(--primary);
    color: #fff;
    font-size: 14px;
    cursor: pointer;
  }
}

@media (max-width: 430px) {
  .comment-input-bar {
    left: 0;
    transform: none;
  }
}
</style>
