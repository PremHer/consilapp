import { create } from 'zustand';
import { io } from 'socket.io-client';

export interface Expediente {
  id: string;
  numero: string;
  materia: string;
  solicitanteNom: string;
  solicitanteDni: string;
  invitadoNom: string;
  invitadoDni: string;
  invitadoCelular?: string;
  estado: 'RECIBIDO' | 'CALIFICADO' | 'INVITACIONES' | 'AUDIENCIA';
  urgency?: 'NORMAL' | 'URGENTE';
  fechaAudiencia?: string;
  createdAt: string;
}

interface StoreState {
  expedientes: Expediente[];
  isLoading: boolean;
  fetchExpedientes: () => Promise<void>;
  addExpediente: (expediente: Partial<Expediente>) => Promise<void>;
  updateExpedienteStatus: (id: string, nuevoEstado: Expediente['estado']) => Promise<void>;
  agendarAudiencia: (id: string, fechaAudiencia: string) => Promise<void>;
}

// Usar la URL de producción si existe, sino localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const useStore = create<StoreState>((set) => ({
  expedientes: [],
  isLoading: false,
  
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
        set((state) => ({ expedientes: [newExp, ...state.expedientes] }));
      }
    } catch (error) {
      console.error("Error adding expediente:", error);
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
  }
}));

// Integración de Socket.IO para tiempo real
const SOCKET_URL = API_URL.replace('/api', '');
const socket = io(SOCKET_URL);

socket.on('expediente_creado', (newExp: Expediente) => {
  useStore.setState((state) => {
    // Evitar duplicados si ya se añadió localmente
    if (state.expedientes.some(e => e.id === newExp.id)) return state;
    return { expedientes: [newExp, ...state.expedientes] };
  });
});

socket.on('expediente_actualizado', (updatedExp: Expediente) => {
  useStore.setState((state) => ({
    expedientes: state.expedientes.map(exp => 
      exp.id === updatedExp.id ? { ...exp, ...updatedExp } : exp
    )
  }));
});
