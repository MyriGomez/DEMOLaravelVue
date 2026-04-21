<script setup lang="ts">
import { ref, onMounted, defineModel } from 'vue';
import type { Category } from '@/types';
import { api } from '@/api/client';

const modelValue = defineModel<number | null>();
const categories = ref<Category[]>([]);
const loading = ref(false);
const showCreate = ref(false);
const newCategoryName = ref('');
const newCategoryColor = ref('#3b82f6');

const loadCategories = async () => {
  loading.value = true;
  try {
    categories.value = await api.getCategories();
    // Si hay categorías y no hay selección, seleccionar la primera
    if (categories.value.length && !modelValue.value) {
      modelValue.value = categories.value[0]?.id ?? null;
    }
  } catch (e) {
    console.error('Error cargando categorías:', e);
  } finally {
    loading.value = false;
  }
};

const createCategory = async () => {
  if (!newCategoryName.value.trim()) return;

  try {
    const newCat = await api.createCategory(newCategoryName.value, newCategoryColor.value);
    categories.value.push(newCat);
    modelValue.value = newCat.id;
    // Reset form
    newCategoryName.value = '';
    showCreate.value = false;
  } catch (e) {
    console.error('Error creando categoría:', e);
  }
};

onMounted(() => {
  loadCategories();
});
</script>

<template>
  <div class="category-selector">
    <!-- Selector principal -->
    <div class="selector-wrapper">
      <select v-model="modelValue" :disabled="loading" class="select-input">
        <option :value="null" disabled>
          {{ loading ? 'Cargando...' : 'Selecciona categoría' }}
        </option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>

      <!-- Botón para crear nueva -->
      <button type="button" @click="showCreate = !showCreate" class="add-btn">
        {{ showCreate ? 'Cancelar' : '+' }}
      </button>
    </div>

    <!-- Formulario para crear categoría -->
    <div v-if="showCreate" class="create-form">
      <input
        v-model="newCategoryName"
        type="text"
        placeholder="Nombre de categoría"
        class="input-small"
        @keyup.enter="createCategory"
      />
      <input
        v-model="newCategoryColor"
        type="color"
        class="color-input"
        title="Color"
      />
      <button type="button" @click="createCategory" class="save-btn">
        Guardar
      </button>
    </div>
  </div>
</template>

<style scoped>
.category-selector { margin-bottom: 1rem; }
.selector-wrapper { display: flex; gap: 0.5rem; }
.select-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
}
.add-btn {
  padding: 0.75rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}
.add-btn:hover { background: #059669; }
.create-form {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
}
.input-small {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}
.color-input {
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.save-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.save-btn:hover { background: #2563eb; }
</style>
