<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { getPosts, deletePost } from '@/mock/api'
import { relativeTime, showModal } from '@/utils/util'
import { showToast } from '@/utils/toast'

const router = useRouter()
const appStore = useAppStore()

const forums = ref<any[]>([])
const loading = ref(false)

onMounted(() => {
  loadForums()
})

async function loadForums() {
  loading.value = true
  try {
    const res = await getPosts({ type: 'forum', page: 1, pageSize: 5 })
    if (res.code === 0) {
      const openid = appStore.userInfo?._openid
      const isAdmin = appStore.isAdmin
      forums.value = res.data.list.map((item: any) => ({
        ...item,
        timeStr: relativeTime(item.createdAt),
        canDelete: openid && (item._openid === openid || isAdmin),
      }))
    }
  } catch (e) {
    console.log('加载论坛失败', e)
  } finally {
    loading.value = false
  }
}

async function onDeleteForum(id: string) {
  const confirm = await showModal('删除帖子', '确认删除？删除后无法恢复')
  if (!confirm) return
  try {
    const res = await deletePost(id)
    if (res.code === 0) {
      showToast('删除成功', 'success')
      forums.value = forums.value.filter((p: any) => p._id !== id)
    } else {
      showToast(res.message || '删除失败', 'error')
    }
  } catch (err) {
    showToast('删除失败', 'error')
  }
}

function goToJob() { router.push('/job/list') }
function goToExpress() { router.push('/express/list') }
function goToTakeout() { router.push('/takeout/list') }
function goToTrade() { router.push('/trade/list') }
function goToAd() { router.push('/ad/list') }
function goToForumList() { router.push('/forum/list') }
function goToForumDetail(id: string) { router.push(`/forum/detail?id=${id}`) }
function goToConfession() { router.push('/confession/list') }
function goToVerify() { router.push('/verify') }
function goToAdmin() {
  if (!appStore.isAdmin) {
    showToast('无权访问', 'none')
    return
  }
  router.push('/admin/dashboard')
}
function goToUser() { router.push('/user') }
</script>

<template>
  <div class="page-container index-page">
    <div class="banner-section">
      <div class="welcome-text">
        <span class="title-logo"></span>
        <span>抚幼校园圈</span>
      </div>
      <div class="sub-text">抚幼校内专属生活服务平台</div>
      <div v-if="!appStore.isVerified" class="verify-btn" @click="goToVerify">
        点击完成校园认证
      </div>
      <div v-if="appStore.isAdmin" class="verify-btn" style="margin-top: 8px;" @click="goToAdmin">
        进入管理后台
      </div>
    </div>

    <div class="grid-menu">
      <div class="menu-item" @click="goToForumList">
        <div class="menu-icon" style="background: #e6f7ed;">📢</div>
        <span class="menu-text">校园论坛</span>
      </div>
      <div class="menu-item" @click="goToConfession">
        <div class="menu-icon" style="background: #fff0f0;">💬</div>
        <span class="menu-text">吐槽墙</span>
      </div>
      <div class="menu-item" @click="goToJob">
        <div class="menu-icon" style="background: #fff5e6;">💼</div>
        <span class="menu-text">校园兼职</span>
      </div>
      <div class="menu-item" @click="goToExpress">
        <div class="menu-icon" style="background: #e6f0ff;">📦</div>
        <span class="menu-text">快递代取</span>
      </div>
      <div class="menu-item" @click="goToTakeout">
        <div class="menu-icon" style="background: #ffe6e6;">🍱</div>
        <span class="menu-text">外卖代取</span>
      </div>
      <div class="menu-item" @click="goToTrade">
        <div class="menu-icon" style="background: #e6fff5;">🛒</div>
        <span class="menu-text">二手交易</span>
      </div>
      <div class="menu-item" @click="goToAd">
        <div class="menu-icon" style="background: #f5e6ff;">📣</div>
        <span class="menu-text">广告发布</span>
      </div>
      <div class="menu-item" @click="goToUser">
        <div class="menu-icon" style="background: #f0f0ff;">👤</div>
        <span class="menu-text">我的</span>
      </div>
    </div>

    <div class="section-title">
      <span class="title-text">论坛热帖</span>
      <span class="more-link" @click="goToForumList">更多 ></span>
    </div>

    <div class="forum-list" style="padding: 0 12px;">
      <div v-if="forums.length === 0" class="empty-state">
        <span>暂无帖子</span>
      </div>
      <div
        v-for="item in forums"
        :key="item._id"
        class="forum-card"
        @click="goToForumDetail(item._id)"
      >
        <div class="forum-header">
          <div class="avatar">{{ item.isAnonymous ? '匿' : (item.authorNickName ? item.authorNickName[0] : '用') }}</div>
          <div class="author-info">
            <div class="name">{{ item.isAnonymous ? '匿名用户' : item.authorNickName }}</div>
            <div class="meta">{{ item.timeStr }}</div>
          </div>
          <div v-if="item.category" class="category-tag">{{ item.category }}</div>
        </div>
        <div class="forum-content">{{ item.content }}</div>
        <div v-if="item.images && item.images.length > 0" class="forum-images">
          <img v-for="(img, idx) in item.images" :key="idx" :src="img" />
        </div>
        <div class="forum-footer">
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
          <div v-if="item.canDelete" class="footer-item delete-btn" @click.stop="onDeleteForum(item._id)">
            <span class="icon">🗑️</span>
            <span>删除</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.index-page {
  padding-bottom: 16px;
}

.banner-section {
  background: linear-gradient(135deg, #07c160 0%, #05a050 100%);
  padding: 24px 16px;
  color: #fff;

  .welcome-text {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 6px;
    display: flex;
    align-items: center;

    .title-logo {
      width: 24px;
      height: 24px;
      margin-right: 6px;
      border-radius: 50%;
      background: #fff;
      flex-shrink: 0;
    }
  }

  .sub-text {
    font-size: 13px;
    opacity: 0.9;
  }

  .verify-btn {
    margin-top: 12px;
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    font-size: 12px;
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.3);
    cursor: pointer;
  }
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 12px 8px;

  .title-text {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  .more-link {
    font-size: 13px;
    color: #07c160;
    cursor: pointer;
  }
}

.grid-menu {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 12px;

  .menu-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 0;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
    cursor: pointer;

    .menu-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      margin-bottom: 6px;
    }

    .menu-text {
      font-size: 12px;
      color: #333;
    }
  }
}

.forum-list {
  .forum-card {
    background: #fff;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 8px;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
    cursor: pointer;

    .forum-header {
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
        color: #07c160;
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

    .forum-content {
      font-size: 14px;
      color: #333;
      line-height: 1.6;
      margin-bottom: 8px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .forum-images {
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

    .forum-footer {
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
}
</style>
