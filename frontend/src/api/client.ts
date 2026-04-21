import type {
  ApiError,
  PaginatedResponse,
  Task,
  Category,
  User,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
} from '@/types';

const API_BASE = 'http://localhost:18080/api';

let authToken: string | null = localStorage.getItem('auth_token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || `Error ${response.status}`);
  }
  return response.json();
}

async function fetchAuth(url: string, options: RequestInit = {}): Promise<any> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
  };

  const response = await fetch(url, { ...options, headers });
  return handleResponse(response);
}

export const api = {
  // 🔐 AUTH
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return fetchAuth(`${API_BASE}/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return fetchAuth(`${API_BASE}/register`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async logout(): Promise<void> {
    await fetchAuth(`${API_BASE}/logout`, { method: 'POST' });
    setAuthToken(null);
  },

  async getUser(): Promise<User> {
    return fetchAuth(`${API_BASE}/user`);
  },

  // 📋 TASKS
  async getTasks(page = 1, status?: string): Promise<PaginatedResponse<Task>> {
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.append('status', status);
    return fetchAuth(`${API_BASE}/tasks?${params}`);
  },

  async createTask(data: Omit<Task, 'id' | 'category' | 'user_id' | 'created_at' | 'updated_at'> & { category_id: number }): Promise<Task> {
    return fetchAuth(`${API_BASE}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTask(id: number, data: {
    title?: string;
    description?: string | null;
    status?: 'pending' | 'in_progress' | 'completed';
    category_id?: number;
  }): Promise<Task> {
    return fetchAuth(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteTask(id: number): Promise<void> {
    await fetchAuth(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
  },

  // 🏷️ CATEGORIES
  async getCategories(): Promise<Category[]> {
    return fetchAuth(`${API_BASE}/categories`);
  },

  async createCategory(name: string, color: string): Promise<Category> {
    return fetchAuth(`${API_BASE}/categories`, {
      method: 'POST',
      body: JSON.stringify({ name, color }),
    });
  },

};
