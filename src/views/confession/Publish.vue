<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createPost } from '@/mock/api'
import { validateContent } from '@/utils/security'
import { showToast } from '@/utils/toast'

const router = useRouter()

const content = ref('')
const loading = ref(false)

async function onSubmit() {
  const validation = validateContent(content.value, { minLength: 2, maxLength: 500 })
  if (!validation.valid) {
    showToast(validation.message, 'none')
    return
  }
  loading.value = true
  try {
    const res = await createPost({
      type: 'confession',
      content: content.value.trim(),
      isAnonymous: true,
    })
    if (res.code === 0) {
      showToast('发布成功', 'success')
      setTimeout(() => router.back(), 800)
    } else {
      showToast(res.message, 'error')
    }
  } catch (err: any) {
    showToast(err?.message || '发布失败', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page-container publish-page">
    <div class="publish-card">
      <div class="form-item">
        <div class="form-label">吐槽内容 <span class="required">*</span></div>
        <textarea
          v-model="content"
          class="content-input"
          placeholder="在这里匿名说出你想说的话..."
          maxlength="500"
          rows="8"
        />
      </div>

      <div class="hint">💡 吐槽墙为纯匿名发布，禁止上传图片，请文明发言。</div>

      <div class="word-count">{{ content.length }} / 500</div>
    </div>

    <button class="submit-btn btn btn-primary" :disabled="loading" @click="onSubmit">
      {{ loading ? '发布中...' : '发布吐槽' }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.publish-page {
  padding: 12px;
}

.publish-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.form-item {
  margin-bottom: 12px;
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

.content-input {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 12px;
  font-size: 14px;
  outline: none;
  resize: vertical;
  font-family: inherit;

  &:focus {
    border-color: var(--primary);
  }
}

.hint {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.word-count {
  text-align: right;
  font-size: 12px;
  color: #999;
}

.submit-btn {
  width: 100%;
}
</style>
