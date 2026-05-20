<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { login, getUserInfo, setMockOpenid } from '@/mock/api'
import { showToast } from '@/utils/toast'

const router = useRouter()
const appStore = useAppStore()
const loading = ref(false)

async function onLogin() {
  if (loading.value) return
  loading.value = true
  try {
    // 模拟微信登录，直接写入 Mock 用户
    const loginRes = await login()
    if (loginRes.code !== 0) {
      throw new Error(loginRes.message || '登录失败')
    }
    const userRes = await getUserInfo()
    appStore.setUserInfo(userRes.data)
    showToast('登录成功', 'success')
    setTimeout(() => {
      router.replace('/')
    }, 800)
  } catch (err: any) {
    showToast(err?.message || '登录失败', 'error')
  } finally {
    loading.value = false
  }
}

async function onAdminLogin() {
  if (loading.value) return
  loading.value = true
  try {
    setMockOpenid('mock_openid_admin_001')
    const loginRes = await login()
    const userRes = await getUserInfo()
    appStore.setUserInfo(userRes.data)
    showToast('管理员登录成功', 'success')
    setTimeout(() => {
      router.replace('/')
    }, 800)
  } catch (err: any) {
    showToast(err?.message || '登录失败', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page-container login-page">
    <div class="login-header">
      <div class="logo">🏫</div>
      <div class="title">抚幼校园圈</div>
      <div class="subtitle">抚州幼专校内专属生活服务平台</div>
    </div>

    <div class="login-body">
      <button class="btn btn-primary" :disabled="loading" @click="onLogin">
        {{ loading ? '登录中...' : '一键登录（模拟用户）' }}
      </button>
      <button class="btn btn-default mt-12" :disabled="loading" @click="onAdminLogin">
        {{ loading ? '登录中...' : '管理员登录（演示用）' }}
      </button>
    </div>

    <div class="login-footer">
      <p>登录即表示您同意《用户协议》和《隐私政策》</p>
      <p class="mt-8">此为演示版，不涉及真实微信登录</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(180deg, #e6f7ed 0%, #f5f5f5 40%);
}

.login-header {
  text-align: center;
  margin-bottom: 48px;

  .logo {
    font-size: 64px;
    margin-bottom: 16px;
  }

  .title {
    font-size: 22px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
  }

  .subtitle {
    font-size: 13px;
    color: #999;
  }
}

.login-body {
  width: 100%;
  max-width: 300px;

  .btn {
    width: 100%;
  }
}

.login-footer {
  margin-top: 48px;
  text-align: center;
  font-size: 11px;
  color: #bbb;
}
</style>
