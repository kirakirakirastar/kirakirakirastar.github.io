import { createApp } from 'vue'
import { createPinia } from 'pinia'

import { persistencePlugin } from './utils/persistence'

import App from './App.vue'
import router from './router'
import './styles/index.css'

const app = createApp(App)
const pinia = createPinia()
pinia.use(persistencePlugin)

app.use(pinia)
app.use(router)
app.mount('#app')
