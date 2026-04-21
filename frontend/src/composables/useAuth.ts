import { ref, computed } from 'vue';
import type { User, AuthResponse, LoginCredentials, RegisterCredentials } from '@/types';
import { api, setAuthToken } from '@/api/client';

const user = ref<User | null>(null);
const token = ref<string | null>(localStorage.getItem('auth_token'));
const loading = ref(false);
const error = ref<string | null>(null);

const isAuthenticated = computed(() => !!token.value && !!user.value);

const setAuth = (data: AuthResponse) => {
  token.value = data.token;
  user.value = data.user;
  setAuthToken(data.token);
};

const clearAuth = () => {
  token.value = null;
  user.value = null;
  setAuthToken(null);
};

export const useAuth = () => {
  const login = async (credentials: LoginCredentials) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.login(credentials);
      setAuth(response);
      return true;
    } catch (e: any) {
      error.value = e.message || 'Error al iniciar sesión';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.register(credentials);
      setAuth(response);
      return true;
    } catch (e: any) {
      error.value = e.message || 'Error al registrar';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      clearAuth();
    }
  };

  const initAuth = async () => {
    if (token.value) {
      try {
        user.value = await api.getUser();
      } catch {
        clearAuth();
      }
    }
  };

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    initAuth,
  };
};
