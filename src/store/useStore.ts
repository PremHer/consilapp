import { create } from 'zustand';
import { io } from 'socket.io-client';
import { useNotificationsStore } from './useNotificationsStore';

export interface Expediente {
  id: string;
  numero: string;
  materia: string;
  detalles?: string;
  solicitanteNom: string;
  solicitanteDni: string;
  solicitanteEmail?: string;
  solicitanteCelular?: string;
  invitadoNom: string;
  invitadoDni: string;
  invitadoCelular?: string;
  invitadoDireccion?: string;
  estado: 'RECIBIDO' | 'CALIFICADO' | 'INVITACIONES' | 'AUDIENCIA' | 'CONCLUIDO';
  urgency?: 'NORMAL' | 'URGENTE';
  fechaAudiencia?: string;
  enlaceSala?: string;
  fechaCreacion: string;
  sesionActual: number;
}

interface StoreState {
  expedientes: Expediente[];
  isLoading: boolean;
  fetchExpedientes: () => Promise<void>;
  addExpediente: (expediente: Partial<Expediente>) => Promise<void>;
  updateExpedienteStatus: (id: string, nuevoEstado: Expediente['estado']) => Promise<void>;
  agendarAudiencia: (id: string, fechaAudiencia: string) => Promise<void>;
  avanzarSesion: (id: string) => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterCategoria: string;
  setFilterCategoria: (categoria: string) => void;
}

// Usar la URL de producción si existe, sino localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const useStore = create<StoreState>((set) => ({
  expedientes: [],
  isLoading: false,
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  filterCategoria: 'Todas las materias',
  setFilterCategoria: (categoria) => set({ filterCategoria: categoria }),
  
  fetchExpedientes: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/expedientes`);
      if (response.ok) {
        const data = await response.json();
        set({ expedientes: data });
      }
    } catch (error) {
      console.error("Error fetching expedientes:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  addExpediente: async (expedienteData) => {
    try {
      const response = await fetch(`${API_URL}/expedientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expedienteData)
      });
      if (response.ok) {
        const newExp = await response.json();
        set((state) => {
          if (state.expedientes.some(e => e.id === newExp.id)) return state;
          return { expedientes: [newExp, ...state.expedientes] };
        });
        return Promise.resolve();
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Error HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Error adding expediente:", error);
      throw error;
    }
  },

  updateExpedienteStatus: async (id, nuevoEstado) => {
    try {
      const response = await fetch(`${API_URL}/expedientes/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (response.ok) {
        set((state) => ({
          expedientes: state.expedientes.map(exp => 
            exp.id === id ? { ...exp, estado: nuevoEstado } : exp
          )
        }));
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  },

  agendarAudiencia: async (id, fechaAudiencia) => {
    try {
      const response = await fetch(`${API_URL}/expedientes/${id}/audiencia`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fechaAudiencia })
      });
      if (response.ok) {
        set((state) => ({
          expedientes: state.expedientes.map(exp => 
            exp.id === id ? { ...exp, fechaAudiencia } : exp
          )
        }));
      }
    } catch (error) {
      console.error("Error scheduling audience:", error);
    }
  },

  avanzarSesion: async (id) => {
    try {
      const response = await fetch(`${API_URL}/expedientes/${id}/avanzarsesion`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        set((state) => ({
          expedientes: state.expedientes.map(exp => 
            exp.id === id ? { ...exp, sesionActual: data.sesionActual, estado: 'INVITACIONES', fechaAudiencia: undefined } : exp
          )
        }));
      }
    } catch (error) {
      console.error("Error advancing session:", error);
    }
  }
}));

// Integración de Socket.IO para tiempo real
const SOCKET_URL = API_URL.replace('/api', '');
const socket = io(SOCKET_URL);

socket.on('expediente_creado', (newExp: Expediente) => {
  useStore.setState((state) => {
    if (state.expedientes.some(e => e.id === newExp.id)) return state;
    return { expedientes: [newExp, ...state.expedientes] };
  });
  useNotificationsStore.getState().addNotification({
    type: 'expediente_creado',
    title: 'Nuevo expediente ingresado',
    message: `Se ha registrado el expediente ${newExp.numero} — ${newExp.materia}`,
    expedienteNumero: newExp.numero,
  });
});

socket.on('expediente_actualizado', (updatedExp: Expediente) => {
  useStore.setState((state) => ({
    expedientes: state.expedientes.map(exp => 
      exp.id === updatedExp.id ? { ...exp, ...updatedExp } : exp
    )
  }));
  const estadoLabels: Record<string, string> = {
    RECIBIDO: 'Recibido',
    CALIFICADO: 'Calificado',
    INVITACIONES: 'Invitación enviada',
    AUDIENCIA: 'Audiencia programada',
    CONCLUIDO: 'Concluido',
  };
  useNotificationsStore.getState().addNotification({
    type: 'expediente_actualizado',
    title: `Expediente ${updatedExp.numero} actualizado`,
    message: `Estado: ${estadoLabels[updatedExp.estado] || updatedExp.estado}`,
    expedienteNumero: updatedExp.numero,
  });
});
