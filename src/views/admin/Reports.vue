<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { adminGetReports, adminHandleReport } from '@/mock/api'
import { formatTime, showModal } from '@/utils/util'
import { showToast } from '@/utils/toast'

const router = useRouter()

const reports = ref<any[]>([])
const loading = ref(false)
const activeTab = ref('pending')

const tabs = [
  { key: 'pending', label: '待处理' },
  { key: 'resolved', label: '已处理' },
]

onMounted(() => {
  loadReports()
})

async function loadReports() {
  loading.value = true
  try {
    const res = await adminGetReports({ status: activeTab.value })
    if (res.code === 0) {
      reports.value = res.data.list.map((item: any) => ({
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

function switchTab(key: string) {
  activeTab.value = key
  loadReports()
}

async function handleReport(reportId: string) {
  const result = prompt('请输入处理结果：')
  if (!result) return
  try {
    const res = await adminHandleReport(reportId, result)
    if (res.code === 0) {
      showToast('处理成功', 'success')
      loadReports()
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
      <span class="header-title">举报处理</span>
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

    <div v-else-if="reports.length === 0" class="empty-state">
      <span>暂无举报记录</span>
    </div>

    <div v-else class="report-list">
      <div v-for="item in reports" :key="item._id" class="report-card">
        <div class="report-row">
          <span class="label">举报对象：</span>
          <span class="value">{{ item.targetType }} - {{ item.targetId }}</span>
        </div>
        <div class="report-row">
          <span class="label">举报原因：</span>
          <span class="value">{{ item.reason }}</span>
        </div>
        <div v-if="item.detail" class="report-row">
          <span class="label">详细说明：</span>
          <span class="value">{{ item.detail }}</span>
        </div>
        <div class="report-row">
          <span class="label">举报时间：</span>
          <span class="value">{{ item.timeStr }}</span>
        </div>
        <div v-if="item.result" class="report-row">
          <span class="label">处理结果：</span>
          <span class="value">{{ item.result }}</span>
        </div>
        <div v-if="activeTab === 'pending'" class="action-bar">
          <button class="btn btn-sm btn-primary" @click="handleReport(item._id)">处理</button>
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

.report-list {
  .report-card {
    background: #fff;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 10px;

    .report-row {
      display: flex;
      margin-bottom: 6px;
      font-size: 13px;

      .label {
        color: #999;
        flex-shrink: 0;
      }

      .value {
        color: #333;
        flex: 1;
      }
    }

    .action-bar {
      padding-top: 10px;
      border-top: 1px solid #f5f5f5;
    }
  }
}
</style>
