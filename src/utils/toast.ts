import { ref } from 'vue'

interface ToastOptions {
  title: string
  icon?: 'success' | 'error' | 'loading' | 'none'
  duration?: number
}

const toastState = ref<{
  visible: boolean
  title: string
  icon: string
}>({
  visible: false,
  title: '',
  icon: 'none',
})

let timer: any = null

export function showToast(title: string, icon: 'success' | 'error' | 'loading' | 'none' = 'none', duration = 2000) {
  toastState.value = { visible: true, title, icon }
  clearTimeout(timer)
  timer = setTimeout(() => {
    toastState.value.visible = false
  }, duration)
}

export function hideToast() {
  toastState.value.visible = false
  clearTimeout(timer)
}

export function useToastState() {
  return toastState
}
