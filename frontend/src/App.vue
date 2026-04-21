<script setup>
import { ref, onMounted } from 'vue'

const status = ref('Esperando...')
const data = ref(null)
const loading = ref(false)

const checkBackend = async () => {
  loading.value = true
  status.value = 'Conectando...'
  try {
    // Apuntamos al puerto 18080 que es Nginx
    const response = await fetch('http://localhost:18080/api/check')
    const result = await response.json()
    data.value = result
    status.value = '¡Conexión OK!'
  } catch (error) {
    status.value = 'Error de conexión'
    console.error("Error:", error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  checkBackend()
})
</script>

<template>
  <div class="container">
    <h1>Prueba Laravel + Vue</h1>

    <div class="status-card" :class="{ 'ok': status === '¡Conexión OK!', 'error': status === 'Error de conexión' }">
      <h2>Estado: {{ status }}</h2>
      <button @click="checkBackend" :disabled="loading">
        {{ loading ? 'Consultando...' : 'Reintentar conexión' }}
      </button>
    </div>

    <div v-if="data" class="info-box">
      <p><strong>Framework:</strong> {{ data.framework }}</p>
      <p><strong>Base de Datos:</strong> {{ data.database }}</p>
      <p><strong>Versión PHP:</strong> {{ data.php_version }}</p>
      <p><small>Última consulta: {{ data.timestamp }}</small></p>
    </div>
  </div>
</template>

<style scoped>
.container { font-family: sans-serif; text-align: center; max-width: 600px; margin: 50px auto; }
.status-card { padding: 20px; border-radius: 8px; background: #eee; border: 2px solid #ccc; margin-bottom: 20px; }
.status-card.ok { background: #e6ffed; border-color: #28a745; }
.status-card.error { background: #ffeef0; border-color: #d73a49; }
.info-box { text-align: left; background: #f8f9fa; padding: 20px; border-left: 5px solid #007bff; display: inline-block; }
button { padding: 10px 20px; cursor: pointer; background: #007bff; color: white; border: none; border-radius: 4px; }
button:disabled { background: #ccc; }
</style>
