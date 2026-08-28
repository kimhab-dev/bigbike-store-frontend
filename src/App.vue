<script setup>
import { useRoute } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import ToastContainer from '@/components/ToastContainer.vue'

const route = useRoute()
</script>

<template>
  <div id="layout">
    <Navbar v-if="!route.meta.hideNavbar" />
    <main class="main-content">
      <router-view />
    </main>
    <ToastContainer />
  </div>
</template>

<style scoped>
#layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #070a13;
  color: #f8fafc;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>

