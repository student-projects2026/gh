<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { adminGetUsers, adminBanUser, adminSetAdmin, adminVerifyUser, adminGrantPublishContact } from '@/mock/api'
import { formatTime, showModal } from '@/utils/util'
import { showToast } from '@/utils/toast'

const router = useRouter()

const users = ref<any[]>([])
const loading = ref(false)
const keyword = ref('')

onMounted(() => {
  loadUsers()
})

async function loadUsers() {
  loading.value = true
  try {
    const res = await adminGetUsers({ keyword: keyword.value })
    if (res.code === 0) {
      users.value = res.data.list.map((item: any) => ({
        ...item,
        timeStr: formatTime(item.createdAt),
      }))
    }
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}

function onSearch() {
  loadUsers()
}

async function toggleBan(user: any) {
  const action = user.isBanned ? '解封' : '封禁'
  const confirm = await showModal(`确认${action}`, `确定要${action}用户「${user.nickName || '未命名'}」吗？`)
  if (!confirm) return
  try {
    const res = await adminBanUser(user._id, !user.isBanned)
    if (res.code === 0) {
      showToast(`${action}成功`, 'success')
      loadUsers()
    } else {
      showToast(res.message, 'error')
    }
  } catch (e) {
    showToast('操作失败', 'error')
  }
}

async function toggleAdmin(user: any) {
  const action = user.isAdmin ? '取消管理员' : '设为管理员'
  const confirm = await showModal(`确认${action}`, `确定要${action}吗？`)
  if (!confirm) return
  try {
    const res = await adminSetAdmin(user._id, !user.isAdmin)
    if (res.code === 0) {
      showToast('设置成功', 'success')
      loadUsers()
    } else {
      showToast(res.message, 'error')
    }
  } catch (e) {
    showToast('操作失败', 'error')
  }
}

async function verifyUser(user: any) {
  const confirm = await showModal('确认通过认证', `确定要通过「${user.nickName || user.realName || '该用户'}」的校园认证吗？`)
  if (!confirm) return
  try {
    const res = await adminVerifyUser(user._id)
    if (res.code === 0) {
      showToast('认证通过', 'success')
      loadUsers()
    } else {
      showToast(res.message, 'error')
    }
  } catch (e) {
    showToast('操作失败', 'error')
  }
}

async function togglePublishContact(user: any) {
  const action = user.canPublishContact ? '取消发布权限' : '授予发布权限'
  const confirm = await showModal(`确认${action}`, `确定要${action}吗？`)
  if (!confirm) return
  try {
    const res = await adminGrantPublishContact(user._id, !user.canPublishContact)
    if (res.code === 0) {
      showToast('设置成功', 'success')
      loadUsers()
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
      <span class="header-title">用户管理</span>
      <span></span>
    </div>

    <div class="search-bar">
      <input v-model="keyword" class="search-input" placeholder="搜索昵称或姓名" @keyup.enter="onSearch" />
      <button class="btn btn-sm btn-primary" @click="onSearch">搜索</button>
    </div>

    <div v-if="loading" class="loading-more">加载中...</div>

    <div v-else-if="users.length === 0" class="empty-state">
      <span>暂无用户</span>
    </div>

    <div v-else class="user-list">
      <div v-for="user in users" :key="user._id" class="user-card">
        <div class="user-info">
          <div class="avatar">{{ (user.nickName || user.realName || '用')[0] }}</div>
          <div class="meta">
            <div class="name">
              {{ user.nickName || user.realName || '未命名用户' }}
              <span v-if="user.isAdmin" class="tag tag-primary">管理员</span>
              <span v-if="user.isBanned" class="tag tag-danger">已封禁</span>
              <span v-if="user.isVerified" class="tag tag-primary">已认证</span>
              <span v-else-if="user.verifyStatus === 'pending'" class="tag tag-warning">待审核</span>
            </div>
            <div class="sub">{{ user.studentId }} · {{ user.college }} · {{ user.timeStr }}</div>
          </div>
        </div>
        <div class="action-bar">
          <button v-if="user.verifyStatus === 'pending'" class="btn btn-sm btn-primary" @click="verifyUser(user)">通过认证</button>
          <button class="btn btn-sm btn-default" @click="toggleBan(user)">{{ user.isBanned ? '解封' : '封禁' }}</button>
          <button class="btn btn-sm btn-default" @click="toggleAdmin(user)">{{ user.isAdmin ? '取消管理员' : '设管理员' }}</button>
          <button class="btn btn-sm btn-default" @click="togglePublishContact(user)">{{ user.canPublishContact ? '取消发布权' : '授发布权' }}</button>
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

.search-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;

  .search-input {
    flex: 1;
    height: 36px;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0 12px;
    font-size: 14px;
    outline: none;

    &:focus {
      border-color: var(--primary);
    }
  }
}

.user-list {
  .user-card {
    background: #fff;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 10px;

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;

      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #e6f7ed;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        color: var(--primary);
        flex-shrink: 0;
      }

      .meta {
        flex: 1;
        min-width: 0;

        .name {
          font-size: 15px;
          font-weight: 500;
          color: #333;
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .sub {
          font-size: 12px;
          color: #999;
          margin-top: 4px;
        }
      }
    }

    .action-bar {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  }
}
</style>
