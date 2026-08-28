<template>
  <div class="not-found">
    <h1>404</h1>
    <p>Page Not Found</p>
    <router-link to="/">Back to Home</router-link>
  </div>
</template>

<script setup>
</script>

<style scoped>
.not-found {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

h1 {
  font-size: 4rem;
  color: #ff4757;
  margin: 0;
}

p {
  font-size: 1.25rem;
  color: #666;
}

a {
  color: #42b883;
  text-decoration: none;
  font-weight: 600;
}

a:hover {
  text-decoration: underline;
}
</style>
