<!-- frontend/src/App.vue -->
<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuth } from '@/composables/useAuth';
import LoginForm from '@/components/LoginForm.vue';
import TaskList from '@/components/TaskList.vue';

const { isAuthenticated, logout, initAuth, user } = useAuth();

onMounted(() => {
  initAuth();
});
</script>

<template>
  <nav v-if="isAuthenticated" class="navbar">
    <span class="welcome">👋 Hola, {{ user?.name }}</span>
    <button @click="logout" class="logout-btn">Cerrar sesión</button>
  </nav>

  <main>
    <LoginForm v-if="!isAuthenticated" />
    <TaskList v-else />
  </main>
</template>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #f9fafb;
  color: #111827;
}
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}
.welcome { font-weight: 500; }
.logout-btn {
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
