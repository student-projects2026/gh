<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { verifyStudent } from '@/mock/api'
import { showToast } from '@/utils/toast'

const router = useRouter()
const appStore = useAppStore()

const realName = ref('')
const studentId = ref('')
const college = ref('')
const loading = ref(false)

async function onSubmit() {
  if (!realName.value.trim()) {
    showToast('请输入真实姓名', 'none')
    return
  }
  if (!studentId.value.trim()) {
    showToast('请输入学号', 'none')
    return
  }
  if (!college.value.trim()) {
    showToast('请输入学院', 'none')
    return
  }
  loading.value = true
  try {
    const res = await verifyStudent({
      realName: realName.value.trim(),
      studentId: studentId.value.trim(),
      college: college.value.trim(),
    })
    if (res.code === 0) {
      showToast('提交成功，等待审核', 'success')
      appStore.updateUserField('verifyStatus', 'pending')
      setTimeout(() => router.back(), 800)
    } else {
      showToast(res.message || '提交失败', 'error')
    }
  } catch (err: any) {
    showToast(err?.message || '提交失败', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page-container verify-page">
    <div class="verify-header">
      <div class="header-icon">🎓</div>
      <div class="header-title">校园认证</div>
      <div class="header-sub">完成认证后即可发布内容</div>
    </div>

    <div class="verify-form">
      <div class="form-item">
        <div class="form-label">真实姓名 <span class="required">*</span></div>
        <input v-model="realName" class="form-input" placeholder="请输入真实姓名" />
      </div>

      <div class="form-item">
        <div class="form-label">学号 <span class="required">*</span></div>
        <input v-model="studentId" class="form-input" placeholder="请输入学号" />
      </div>

      <div class="form-item">
        <div class="form-label">学院 <span class="required">*</span></div>
        <input v-model="college" class="form-input" placeholder="请输入所在学院" />
      </div>

      <div class="hint">
        提示：演示版无需上传学生证照片，填写信息即可模拟提交。
      </div>
    </div>

    <button class="submit-btn btn btn-primary" :disabled="loading" @click="onSubmit">
      {{ loading ? '提交中...' : '提交认证' }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.verify-page {
  padding: 16px;
}

.verify-header {
  text-align: center;
  padding: 32px 0;

  .header-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .header-title {
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }

  .header-sub {
    font-size: 13px;
    color: #999;
    margin-top: 6px;
  }
}

.verify-form {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.form-item {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;

  .required {
    color: #fa5151;
  }
}

.form-input {
  width: 100%;
  height: 40px;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: var(--primary);
  }
}

.hint {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.submit-btn {
  width: 100%;
}
</style>
