import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'font-awesome/css/font-awesome.min.css'
import './style.css'

import BaseButton from '@/components/BaseButton.vue'
import BaseModal from '@/components/BaseModal.vue'

const app = createApp(App)

app.component('BaseButton', BaseButton)
app.component('BaseModal', BaseModal)

app.use(pinia)
app.use(router)

app.mount('#app')
