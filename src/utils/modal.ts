import { ref } from 'vue'

const modalState = ref<{
  visible: boolean
  title: string
  content: string
  resolve: ((value: boolean) => void) | null
}>({
  visible: false,
  title: '',
  content: '',
  resolve: null,
})

export function showModal(title: string, content: string): Promise<boolean> {
  return new Promise((resolve) => {
    modalState.value = { visible: true, title, content, resolve }
  })
}

export function confirmModal() {
  if (modalState.value.resolve) {
    modalState.value.resolve(true)
  }
  modalState.value.visible = false
  modalState.value.resolve = null
}

export function cancelModal() {
  if (modalState.value.resolve) {
    modalState.value.resolve(false)
  }
  modalState.value.visible = false
  modalState.value.resolve = null
}

export function useModalState() {
  return modalState
}
