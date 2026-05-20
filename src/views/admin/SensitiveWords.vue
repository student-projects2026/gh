<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { adminGetSensitiveWords, adminAddSensitiveWord, adminDeleteSensitiveWord } from '@/mock/api'
import { showToast } from '@/utils/toast'

const router = useRouter()

const words = ref<any[]>([])
const newWord = ref('')
const loading = ref(false)

onMounted(() => {
  loadWords()
})

async function loadWords() {
  try {
    const res = await adminGetSensitiveWords()
    if (res.code === 0) {
      words.value = res.data
    }
  } catch (e) {
    console.log(e)
  }
}

async function addWord() {
  if (!newWord.value.trim()) {
    showToast('请输入敏感词', 'none')
    return
  }
  try {
    const res = await adminAddSensitiveWord(newWord.value.trim())
    if (res.code === 0) {
      showToast('添加成功', 'success')
      newWord.value = ''
      loadWords()
    } else {
      showToast(res.message, 'error')
    }
  } catch (e) {
    showToast('添加失败', 'error')
  }
}

async function deleteWord(wordId: string) {
  try {
    const res = await adminDeleteSensitiveWord(wordId)
    if (res.code === 0) {
      showToast('删除成功', 'success')
      loadWords()
    } else {
      showToast(res.message, 'error')
    }
  } catch (e) {
    showToast('删除失败', 'error')
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
      <span class="header-title">敏感词库</span>
      <span></span>
    </div>

    <div class="add-bar">
      <input v-model="newWord" class="search-input" placeholder="输入敏感词" @keyup.enter="addWord" />
      <button class="btn btn-sm btn-primary" @click="addWord">添加</button>
    </div>

    <div v-if="words.length === 0" class="empty-state">
      <span>暂无敏感词</span>
    </div>

    <div v-else class="word-list">
      <div v-for="item in words" :key="item._id" class="word-item">
        <span class="word-text">{{ item.word }}</span>
        <span class="word-level">等级 {{ item.level }}</span>
        <span class="delete-btn" @click="deleteWord(item._id)">删除</span>
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

.add-bar {
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

.word-list {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;

  .word-item {
    display: flex;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .word-text {
      flex: 1;
      font-size: 14px;
      color: #333;
    }

    .word-level {
      font-size: 12px;
      color: #999;
      margin-right: 12px;
    }

    .delete-btn {
      font-size: 12px;
      color: #fa5151;
      cursor: pointer;
    }
  }
}
</style>
