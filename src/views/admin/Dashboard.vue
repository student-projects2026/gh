<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { allPosts, mockUsers, mockReports } from '@/mock/data'
import { adminGetPendingVerifications } from '@/mock/api'
import { showToast } from '@/utils/toast'

const router = useRouter()

const stats = ref({
  posts: 0,
  users: 0,
  reports: 0,
  pendingVerifications: 0,
})

const menus = [
  { path: '/admin/audit', icon: '✅', title: '内容审核', desc: '审核用户发布的帖子' },
  { path: '/admin/reports', icon: '📮', title: '举报处理', desc: '处理用户举报的内容' },
  { path: '/admin/users', icon: '👥', title: '用户管理', desc: '管理用户权限和认证' },
  { path: '/admin/sensitiveWords', icon: '🛡️', title: '敏感词库', desc: '维护内容安全词库' },
]

onMounted(async () => {
  stats.value.posts = allPosts.length
  stats.value.users = mockUsers.length
  stats.value.reports = mockReports.filter((r) => r.status === 'pending').length
  try {
    const res = await adminGetPendingVerifications()
    if (res.code === 0) {
      stats.value.pendingVerifications = res.data.list.length
    }
  } catch (e) {}
})

function goTo(path: string) {
  router.push(path)
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="page-container admin-page">
    <div class="admin-header">
      <span class="back-btn" @click="goBack">←</span>
      <span class="header-title">管理后台</span>
      <span></span>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-num">{{ stats.posts }}</div>
        <div class="stat-label">总帖子</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">{{ stats.users }}</div>
        <div class="stat-label">用户数</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">{{ stats.reports }}</div>
        <div class="stat-label">待处理举报</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">{{ stats.pendingVerifications }}</div>
        <div class="stat-label">待审核认证</div>
      </div>
    </div>

    <div class="menu-list">
      <div v-for="menu in menus" :key="menu.path" class="menu-card" @click="goTo(menu.path)">
        <div class="menu-icon">{{ menu.icon }}</div>
        <div class="menu-info">
          <div class="menu-title">{{ menu.title }}</div>
          <div class="menu-desc">{{ menu.desc }}</div>
        </div>
        <div class="menu-arrow">></div>
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
  margin-bottom: 16px;

  .back-btn {
    font-size: 18px;
    color: #333;
    cursor: pointer;
  }

  .header-title {
    font-size: 17px;
    font-weight: 600;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 16px;

  .stat-card {
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    text-align: center;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);

    .stat-num {
      font-size: 24px;
      font-weight: 600;
      color: var(--primary);
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 12px;
      color: #999;
    }
  }
}

.menu-list {
  .menu-card {
    background: #fff;
    border-radius: 8px;
    padding: 14px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
    cursor: pointer;

    .menu-icon {
      font-size: 24px;
      margin-right: 12px;
    }

    .menu-info {
      flex: 1;

      .menu-title {
        font-size: 15px;
        font-weight: 500;
        color: #333;
      }

      .menu-desc {
        font-size: 12px;
        color: #999;
        margin-top: 2px;
      }
    }

    .menu-arrow {
      font-size: 14px;
      color: #ccc;
    }
  }
}
</style>
