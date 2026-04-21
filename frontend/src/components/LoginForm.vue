<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '@/composables/useAuth';

const { login, register, loading, error } = useAuth();

const isLogin = ref(true);
const email = ref('');
const password = ref('');
const name = ref('');
const passwordConfirmation = ref('');

const handleSubmit = async () => {
  if (isLogin.value) {
    const success = await login({ email: email.value, password: password.value });
    if (success) resetForm();
  } else {
    const success = await register({
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    });
    if (success) resetForm();
  }
};

const resetForm = () => {
  email.value = '';
  password.value = '';
  name.value = '';
  passwordConfirmation.value = '';
};

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  error.value = null;
};
</script>

<template>
  <div class="auth-form">
    <h2>{{ isLogin ? 'Iniciar sesión' : 'Registrarse' }}</h2>

    <form @submit.prevent="handleSubmit">
      <div v-if="!isLogin" class="form-group">
        <label>Nombre</label>
        <input v-model="name" type="text" required />
      </div>

      <div class="form-group">
        <label>Email</label>
        <input v-model="email" type="email" required />
      </div>

      <div class="form-group">
        <label>Contraseña</label>
        <input v-model="password" type="password" required />
      </div>

      <div v-if="!isLogin" class="form-group">
        <label>Confirmar contraseña</label>
        <input v-model="passwordConfirmation" type="password" required />
      </div>

      <div v-if="error" class="error">{{ error }}</div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Cargando...' : (isLogin ? 'Entrar' : 'Registrarse') }}
      </button>
    </form>

    <p class="toggle">
      {{ isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?' }}
      <button type="button" @click="toggleMode" class="link">
        {{ isLogin ? 'Regístrate' : 'Inicia sesión' }}
      </button>
    </p>
  </div>
</template>

<style scoped>
.auth-form {
  max-width: 400px;
  margin: 3rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
}
button[type="submit"] {
  width: 100%;
  padding: 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
}
button[type="submit"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.error {
  color: #dc2626;
  background: #fef2f2;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}
.toggle {
  text-align: center;
  margin-top: 1rem;
  color: #6b7280;
}
.link {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  text-decoration: underline;
}
</style>
