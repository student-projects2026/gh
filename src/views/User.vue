<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { getUserInfo, updateUserInfo } from '@/mock/api'
import { showModal } from '@/utils/util'
import { showToast } from '@/utils/toast'

const router = useRouter()
const appStore = useAppStore()

const userInfo = ref<any>(null)
const isLoggedIn = ref(false)
const isVerified = ref(false)
const verifyStatus = ref('')
const isAdmin = ref(false)
const stats = ref({ postCount: 0, commentCount: 0, likeCount: 0 })

onMounted(() => {
  loadUserInfo()
})

async function loadUserInfo() {
  if (!appStore.isLoggedIn) {
    isLoggedIn.value = false
    return
  }
  try {
    const res = await getUserInfo()
    if (res.code === 0) {
      const user = res.data
      userInfo.value = user
      isLoggedIn.value = true
      isVerified.value = user.isVerified
      verifyStatus.value = user.verifyStatus || ''
      isAdmin.value = user.isAdmin
      appStore.setUserInfo(user)
    }
  } catch (e) {
    console.log('加载用户信息失败', e)
  }
}

function goToLogin() {
  router.push('/login')
}

async function onEditNickName() {
  if (!isLoggedIn.value) return
  const current = (userInfo.value?.nickName || userInfo.value?.realName || '').trim()
  const nick = prompt('修改昵称', current)
  if (nick === null) return
  const trimmed = nick.trim()
  if (!trimmed) {
    showToast('昵称不能为空', 'none')
    return
  }
  if (trimmed.length > 20) {
    showToast('昵称不能超过 20 个字', 'none')
    return
  }
  if (trimmed === current) return
  try {
    const res = await updateUserInfo({ nickName: trimmed })
    if (res.code !== 0) {
      showToast(res.message || '修改失败', 'none')
      return
    }
    userInfo.value = { ...userInfo.value, nickName: trimmed }
    appStore.setUserInfo(userInfo.value)
    showToast('修改成功', 'success')
  } catch (err: any) {
    showToast(err?.message || '修改失败', 'none')
  }
}

function goToVerify() {
  if (isVerified.value) {
    showToast('已完成认证', 'none')
    return
  }
  if (verifyStatus.value === 'pending') {
    showToast('认证审核中，请耐心等待', 'none')
    return
  }
  router.push('/verify')
}

function goToAdmin() {
  if (!isAdmin.value) {
    showToast('无权访问', 'none')
    return
  }
  router.push('/admin/dashboard')
}

function goToMyPosts() {
  showToast('功能开发中', 'none')
}

function goToSettings() {
  showToast('功能开发中', 'none')
}

async function onLogout() {
  const confirm = await showModal('确认退出', '退出登录后将清除本地登录状态')
  if (!confirm) return
  appStore.logout()
  isLoggedIn.value = false
  isVerified.value = false
  isAdmin.value = false
  userInfo.value = null
  showToast('已退出登录', 'success')
}
</script>

<template>
  <div class="page-container user-page">
    <div class="user-header">
      <div class="user-info" @click="isLoggedIn ? undefined : goToLogin()">
        <div class="avatar" :class="{ editable: isLoggedIn }" @click.stop="onEditNickName">
          <img v-if="userInfo?.avatarUrl" :src="userInfo.avatarUrl" class="avatar-img" />
          <div v-else class="avatar-placeholder">
            <span class="placeholder-icon">{{ isLoggedIn ? '+' : '👤' }}</span>
            <span v-if="isLoggedIn" class="placeholder-text">设置头像</span>
          </div>
        </div>
        <div class="user-meta">
          <div class="user-name">
            <span>{{ isLoggedIn ? (userInfo?.nickName || userInfo?.realName || '微信用户') : '点击登录' }}</span>
            <span v-if="isLoggedIn" class="user-name-edit">✏️</span>
          </div>
          <div v-if="isLoggedIn" class="user-badge">
            <span v-if="isVerified" class="badge verified">✓ 已认证</span>
            <span v-else-if="verifyStatus === 'pending'" class="badge pending">审核中</span>
            <span v-else class="badge unverified" @click.stop="goToVerify">未认证，点击认证</span>
          </div>
        </div>
        <span v-if="!isLoggedIn" class="arrow">></span>
      </div>
    </div>

    <div v-if="isLoggedIn" class="stats-bar">
      <div class="stat-item">
        <div class="stat-num">{{ stats.postCount }}</div>
        <div class="stat-label">我的发布</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">{{ stats.commentCount }}</div>
        <div class="stat-label">我的评论</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">{{ stats.likeCount }}</div>
        <div class="stat-label">获赞</div>
      </div>
    </div>

    <div class="menu-list">
      <div class="menu-group">
        <div v-if="isLoggedIn" class="menu-item" @click="goToMyPosts">
          <span class="menu-icon">📝</span>
          <span class="menu-text">我的发布</span>
          <span class="menu-arrow">></span>
        </div>
        <div class="menu-item" @click="goToVerify">
          <span class="menu-icon">🎓</span>
          <span class="menu-text">校园认证</span>
          <span class="menu-status" :class="isVerified ? 'success' : (verifyStatus === 'pending' ? 'pending' : 'warning')">
            {{ isVerified ? '已完成' : (verifyStatus === 'pending' ? '审核中' : '未认证') }}
          </span>
          <span class="menu-arrow">></span>
        </div>
        <div v-if="isLoggedIn" class="menu-item" @click="showToast('功能开发中', 'none')">
          <span class="menu-icon">💬</span>
          <span class="menu-text">联系客服</span>
          <span class="menu-arrow">></span>
        </div>
        <div v-if="isLoggedIn" class="menu-item" @click="goToSettings">
          <span class="menu-icon">⚙️</span>
          <span class="menu-text">设置</span>
          <span class="menu-arrow">></span>
        </div>
      </div>

      <div v-if="isAdmin" class="menu-group">
        <div class="menu-item admin" @click="goToAdmin">
          <span class="menu-icon">🔒</span>
          <span class="menu-text">管理后台</span>
          <span class="menu-arrow">></span>
        </div>
      </div>

      <div v-if="isLoggedIn" class="menu-group">
        <div class="menu-item danger" @click="onLogout">
          <span class="menu-icon">🚪</span>
          <span class="menu-text">退出登录</span>
        </div>
      </div>
    </div>

    <div class="footer-tips">
      抚幼校园圈 v1.0.0 · 抚州幼专校内专属
    </div>
  </div>
</template>

<style scoped lang="scss">
.user-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 24px;
}

.user-header {
  background: linear-gradient(135deg, #07c160 0%, #05a050 100%);
  padding: 24px 16px;

  .user-info {
    display: flex;
    align-items: center;
    cursor: pointer;

    .avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      overflow: hidden;
      flex-shrink: 0;
      position: relative;

      &.editable {
        border: 1px dashed rgba(255, 255, 255, 0.6);
      }

      .avatar-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #07c160;

        .placeholder-icon {
          font-size: 28px;
          line-height: 1;
          font-weight: 300;
        }

        .placeholder-text {
          font-size: 9px;
          margin-top: 2px;
          color: #888;
        }
      }
    }

    .user-meta {
      flex: 1;

      .user-name {
        font-size: 18px;
        font-weight: 600;
        color: #fff;
        margin-bottom: 6px;
        display: flex;
        align-items: center;

        .user-name-edit {
          margin-left: 6px;
          font-size: 14px;
          opacity: 0.85;
          cursor: pointer;
        }
      }

      .user-badge {
        display: flex;
        align-items: center;

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 11px;

          &.verified {
            background: rgba(255, 255, 255, 0.25);
            color: #fff;
          }

          &.unverified {
            background: rgba(255, 255, 255, 0.9);
            color: #07c160;
            cursor: pointer;
          }

          &.pending {
            background: rgba(255, 255, 255, 0.25);
            color: #fff;
          }
        }
      }
    }

    .arrow {
      color: #fff;
      font-size: 14px;
      opacity: 0.7;
    }
  }
}

.stats-bar {
  display: flex;
  justify-content: space-around;
  background: #fff;
  padding: 16px 0;
  margin: 0 12px;
  margin-top: -12px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 1;

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    .stat-num {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 12px;
      color: #999;
    }
  }
}

.menu-list {
  padding: 12px;

  .menu-group {
    background: #fff;
    border-radius: 8px;
    margin-bottom: 12px;
    overflow: hidden;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);

    .menu-item {
      display: flex;
      align-items: center;
      padding: 14px 12px;
      border-bottom: 1px solid #f5f5f5;
      cursor: pointer;

      &:last-child {
        border-bottom: none;
      }

      &:active {
        background: #f8f8f8;
      }

      &.danger .menu-text {
        color: #fa5151;
      }

      &.admin .menu-text {
        color: var(--primary);
      }

      .menu-icon {
        font-size: 16px;
        margin-right: 10px;
        width: 20px;
        text-align: center;
      }

      .menu-text {
        flex: 1;
        font-size: 14px;
        color: #333;
      }

      .menu-status {
        font-size: 12px;
        margin-right: 6px;

        &.success {
          color: #07c160;
        }

        &.warning {
          color: #fa5151;
        }

        &.pending {
          color: #ffc300;
        }
      }

      .menu-arrow {
        font-size: 12px;
        color: #ccc;
      }
    }
  }
}

.footer-tips {
  text-align: center;
  font-size: 11px;
  color: #ccc;
  margin-top: 24px;
}
</style>
