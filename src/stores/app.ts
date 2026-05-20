import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  const userInfo = ref<any>(null)
  const isLoggedIn = computed(() => !!userInfo.value)
  const isVerified = computed(() => !!userInfo.value?.isVerified)
  const isAdmin = computed(() => !!userInfo.value?.isAdmin)
  const canPublishContact = computed(() => !!userInfo.value?.canPublishContact)
  const agreedDisclaimer = computed(() => !!userInfo.value?.agreedDisclaimer)

  function setUserInfo(info: any) {
    userInfo.value = info
  }

  function updateUserField(field: string, value: any) {
    if (userInfo.value) {
      userInfo.value[field] = value
    }
  }

  function logout() {
    userInfo.value = null
  }

  return {
    userInfo,
    isLoggedIn,
    isVerified,
    isAdmin,
    canPublishContact,
    agreedDisclaimer,
    setUserInfo,
    updateUserField,
    logout,
  }
})
