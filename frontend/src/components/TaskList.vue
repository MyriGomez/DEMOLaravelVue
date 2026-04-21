<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Task, Category, PaginatedResponse } from '@/types';
import { api } from '@/api/client';
import CategorySelector from '@/components/CategorySelector.vue';

const tasks = ref<Task[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const currentPage = ref(1);
const lastPage = ref(1);

const loadTasks = async (page: number = 1) => {
  loading.value = true;
  error.value = null;
  try {
    const response = await api.getTasks(page);
    tasks.value = response.data;
    currentPage.value = response.meta.current_page;
    lastPage.value = response.meta.last_page;
  } catch (e: any) {
    error.value = e.message || 'Error al cargar tareas';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadTasks();
});

const newTask = ref<{
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  category_id: number | null;
}>({
  title: '',
  description: '',
  status: 'pending',
  category_id: null,
});

const createTask = async () => {
  if (!newTask.value.title.trim()) {
    error.value = 'El título es obligatorio';
    return;
  }
  if (!newTask.value.category_id) {
    error.value = 'Selecciona una categoría';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    await api.createTask({
      title: newTask.value.title,
      description: newTask.value.description?.trim() || null,
      status: newTask.value.status,
      category_id: newTask.value.category_id!,
    });
    // Reset form
    newTask.value = { title: '', description: '', status: 'pending', category_id: null };
    loadTasks();
  } catch (e: any) {
    error.value = e.message || 'Error al crear tarea';
  } finally {
    loading.value = false;
  }
};

const editingTaskId = ref<number | null>(null);
const editForm = ref<{
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  category_id: number | null;
}>({
  title: '',
  description: '',
  status: 'pending',
  category_id: null,
});

const startEdit = (task: Task) => {
  editingTaskId.value = task.id;
  editForm.value = {
    title: task.title,
    description: task.description || '',
    status: task.status,
    category_id: task.category.id,
  };
};

const cancelEdit = () => {
  editingTaskId.value = null;
};

const saveEdit = async (taskId: number) => {
  if (!editForm.value.title.trim()) {
    error.value = 'El título es obligatorio';
    return;
  }
  if (!editForm.value.category_id) {
    error.value = 'Selecciona una categoría';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    await api.updateTask(taskId, {
      title: editForm.value.title,
      description: editForm.value.description.trim() || null,
      status: editForm.value.status,
      category_id: editForm.value.category_id,
    });
    editingTaskId.value = null;
    loadTasks(); // Refrescar listado
  } catch (e: any) {
    error.value = e.message || 'Error al actualizar';
  } finally {
    loading.value = false;
  }
};

const deleteTask = async (taskId: number) => {
  if (!confirm('¿Seguro que quieres eliminar esta tarea?')) return;

  loading.value = true;
  try {
    await api.deleteTask(taskId);
    loadTasks(); // Refrescar listado
  } catch (e: any) {
    error.value = e.message || 'Error al eliminar';
  } finally {
    loading.value = false;
  }
};

const categories = ref<Category[]>([]);

onMounted(async () => {
  try {
    categories.value = await api.getCategories();
  } catch (e) {
    console.error('Error cargando categorías:', e);
  }
  loadTasks();
});

</script>

<template>
  <div class="task-list">
    <h2>📋 Tareas</h2>

    <!-- Estados -->
    <div v-if="loading" class="state">Cargando...</div>
    <div v-if="error" class="state error">❌ {{ error }}</div>

    <!-- Formulario para crear tarea -->
    <div class="create-task">
      <h3>➕ Nueva tarea</h3>

      <div class="form-group">
        <input
          v-model="newTask.title"
          type="text"
          placeholder="Título de la tarea"
          required
        />
      </div>

      <div class="form-group">
    <textarea
      v-model="newTask.description"
      placeholder="Descripción (opcional)"
      rows="2"
    ></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Estado</label>
          <select v-model="newTask.status">
            <option value="pending">⏳ Pendiente</option>
            <option value="in_progress">🔄 En progreso</option>
            <option value="completed">✅ Completada</option>
          </select>
        </div>

        <div class="form-group">
          <label>Categoría</label>
          <CategorySelector v-model="newTask.category_id" />
        </div>
      </div>

      <div v-if="error" class="error">{{ error }}</div>

      <button type="button" @click="createTask" :disabled="loading" class="create-btn">
        {{ loading ? 'Creando...' : 'Crear tarea' }}
      </button>
    </div>


    <!-- Listado -->
    <ul v-if="tasks.length">
      <li v-for="task in tasks" :key="task.id" class="task-item">

        <!-- Modo visualización (por defecto) -->
        <div v-if="editingTaskId !== task.id" class="task-view">
          <div class="task-header">
            <strong>{{ task.title }}</strong>
            <div class="task-actions">
              <button @click="startEdit(task)" class="btn-edit" title="Editar">✏️</button>
              <button @click="deleteTask(task.id)" class="btn-delete" title="Eliminar">🗑️</button>
            </div>
          </div>

          <p v-if="task.description" class="task-desc">{{ task.description }}</p>

          <div class="task-meta">
            <span :class="['badge', task.status]">{{ task.status }}</span>
            <span class="category-badge" :style="{ backgroundColor: task.category.color }">
        {{ task.category.name }}
      </span>
          </div>
        </div>

        <!-- Modo edición (inline) -->
        <div v-else class="task-edit">
          <div class="form-group">
            <input v-model="editForm.title" type="text" placeholder="Título" required />
          </div>

          <div class="form-group">
            <textarea v-model="editForm.description" placeholder="Descripción" rows="2"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Estado</label>
              <select v-model="editForm.status">
                <option value="pending">⏳ Pendiente</option>
                <option value="in_progress">🔄 En progreso</option>
                <option value="completed">✅ Completada</option>
              </select>
            </div>

            <div class="form-group">
              <label>Categoría</label>
              <select v-model="editForm.category_id" required>
                <option :value="null" disabled>Selecciona...</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="edit-actions">
            <button @click="saveEdit(task.id)" :disabled="loading" class="btn-save">
              {{ loading ? 'Guardando...' : 'Guardar' }}
            </button>
            <button @click="cancelEdit" :disabled="loading" class="btn-cancel">
              Cancelar
            </button>
          </div>
        </div>

      </li>
    </ul>

    <p v-else-if="!loading && !error" class="empty">No hay tareas aún.</p>

    <!-- Paginación simple -->
    <div v-if="lastPage > 1" class="pagination">
      <button @click="loadTasks(currentPage - 1)" :disabled="currentPage === 1">← Anterior</button>
      <span>Página {{ currentPage }} de {{ lastPage }}</span>
      <button @click="loadTasks(currentPage + 1)" :disabled="currentPage === lastPage">Siguiente →</button>
    </div>
  </div>
</template>

<style scoped>
.task-list { max-width: 800px; margin: 2rem auto; padding: 1rem; }
.task-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #fff;
}
.task-view {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit, .btn-delete {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-edit:hover { background: #dbeafe; }
.btn-delete:hover { background: #fef2f2; }

.task-desc {
  margin: 0;
  color: #4b5563;
  font-size: 0.95rem;
}

.task-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.task-edit {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}
.badge.pending { background: #fef3c7; color: #92400e; }
.badge.in_progress { background: #dbeafe; color: #1e40af; }
.badge.completed { background: #d1fae5; color: #065f46; }

.category-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  color: white;
}

.category {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  color: white;
  margin-left: 0.5rem;
}
.state { text-align: center; padding: 1rem; color: #6b7280; }
.state.error { color: #dc2626; background: #fef2f2; border-radius: 8px; }
.empty { text-align: center; color: #9ca3af; }
.pagination {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}
.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}
.pagination button:disabled { opacity: 0.5; cursor: not-allowed; }

.create-task {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.form-group { margin-bottom: 1rem; }
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  color: #374151;
}
.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.create-btn {
  width: 100%;
  padding: 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
}
.create-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.create-btn:hover:not(:disabled) {
  background: #2563eb;
}
.error {
  color: #dc2626;
  background: #fef2f2;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-save, .btn-cancel {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
}

.btn-save {
  background: #10b981;
  color: white;
}
.btn-save:hover { background: #059669; }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-cancel {
  background: #6b7280;
  color: white;
}
.btn-cancel:hover { background: #4b5563; }

</style>
