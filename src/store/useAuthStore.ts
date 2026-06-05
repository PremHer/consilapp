import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  nombre: string;
  rol: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

// Inicializar desde localStorage si existe
const savedToken = localStorage.getItem('auth_token');
const savedUser = localStorage.getItem('auth_user');

export const useAuthStore = create<AuthState>((set, get) => ({
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken || null,
  
  login: (user, token) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({ user, token });
  },
  
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    set({ user: null, token: null });
  },
  
  isAuthenticated: () => {
    return !!get().token;
  }
}));
