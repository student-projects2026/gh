<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createPost, uploadImage } from '@/mock/api'
import { validateContent } from '@/utils/security'
import { showModal, chooseImages } from '@/utils/util'
import { showToast } from '@/utils/toast'

const router = useRouter()

const categories = ['校园日常', '运动组队', '学习搭子', '拼车结伴', '社团动态', '校园求助', '失物招领']
const title = ref('')
const content = ref('')
const category = ref('')
const images = ref<string[]>([])
const isAnonymous = ref(false)
const loading = ref(false)

async function chooseImage() {
  const remaining = 9 - images.value.length
  if (remaining <= 0) {
    showToast('最多上传9张图片', 'none')
    return
  }
  try {
    const tempPaths = await chooseImages(remaining)
    images.value = [...images.value, ...tempPaths]
  } catch (e) {}
}

function removeImage(index: number) {
  images.value.splice(index, 1)
}

async function onSubmit() {
  if (!category.value) {
    showToast('请选择分类', 'none')
    return
  }
  const fullText = `${title.value} ${content.value}`
  const validation = validateContent(fullText, { minLength: 2, maxLength: 2000 })
  if (!validation.valid) {
    showToast(validation.message, 'none')
    return
  }
  loading.value = true
  try {
    const uploadedImages: string[] = []
    for (const img of images.value) {
      const fileID = await uploadImage(img)
      uploadedImages.push(fileID)
    }
    const res = await createPost({
      type: 'forum',
      title: title.value.trim(),
      content: content.value.trim(),
      category: category.value,
      images: uploadedImages,
      isAnonymous: isAnonymous.value,
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
        <div class="form-label">分类 <span class="required">*</span></div>
        <select v-model="category" class="form-select">
          <option value="">请选择分类</option>
          <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>

      <div class="form-item">
        <div class="form-label">标题（可选）</div>
        <input v-model="title" class="form-input" placeholder="请输入标题" maxlength="50" />
      </div>

      <div class="form-item">
        <div class="form-label">内容 <span class="required">*</span></div>
        <textarea v-model="content" class="content-input" placeholder="分享你的校园生活..." maxlength="2000" rows="6" />
      </div>

      <div class="form-item">
        <div class="form-label">图片（可选）</div>
        <div class="image-upload">
          <div v-for="(img, idx) in images" :key="idx" class="image-item">
            <img :src="img" />
            <div class="remove-btn" @click="removeImage(idx)">×</div>
          </div>
          <div v-if="images.length < 9" class="upload-btn" @click="chooseImage">
            <span>+</span>
          </div>
        </div>
      </div>

      <div class="form-item switch-item">
        <div class="form-label">匿名发布</div>
        <label class="switch">
          <input v-model="isAnonymous" type="checkbox" />
          <span class="slider"></span>
        </label>
      </div>

      <div class="word-count">{{ content.length }} / 2000</div>
    </div>

    <button class="submit-btn btn btn-primary" :disabled="loading" @click="onSubmit">
      {{ loading ? '发布中...' : '发布' }}
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

.form-select,
.form-input {
  width: 100%;
  height: 40px;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  background: #fff;

  &:focus {
    border-color: var(--primary);
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

.image-upload {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .image-item {
    position: relative;
    width: 80px;
    height: 80px;

    img {
      width: 100%;
      height: 100%;
      border-radius: 4px;
      object-fit: cover;
    }

    .remove-btn {
      position: absolute;
      top: -6px;
      right: -6px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #fa5151;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      cursor: pointer;
    }
  }

  .upload-btn {
    width: 80px;
    height: 80px;
    border: 1px dashed var(--border);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #999;
    cursor: pointer;
  }
}

.switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 28px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    border-radius: 28px;
    transition: 0.3s;

    &::before {
      position: absolute;
      content: '';
      height: 22px;
      width: 22px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      border-radius: 50%;
      transition: 0.3s;
    }
  }

  input:checked + .slider {
    background-color: var(--primary);
  }

  input:checked + .slider::before {
    transform: translateX(20px);
  }
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
