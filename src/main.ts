import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/global.scss'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

// 注册 PWA Service Worker
if ('serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      immediate: true,
      onRegistered(r) {
        console.log('SW registered:', r)
      },
      onRegisterError(error) {
        console.error('SW registration error:', error)
      },
    })
  }).catch(() => {
    // dev mode fallback
  })
}
