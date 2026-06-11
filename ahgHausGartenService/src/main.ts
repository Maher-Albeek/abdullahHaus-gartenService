import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useWebsiteContentStore } from './stores/websiteContent'
import './style.css'
import './admin.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

setActivePinia(pinia)
await useWebsiteContentStore().ready
await router.isReady()

app.mount('#app')
