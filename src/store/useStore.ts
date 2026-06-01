import { create } from 'zustand';

export interface Expediente {
  id: string;
  numero: string;
  materia: string;
  solicitanteNom: string;
  solicitanteDni: string;
  invitadoNom: string;
  invitadoDni: string;
  estado: 'RECIBIDO' | 'CALIFICADO' | 'INVITACIONES' | 'AUDIENCIA';
  urgency?: 'NORMAL' | 'URGENTE';
}

interface StoreState {
  expedientes: Expediente[];
  isLoading: boolean;
  fetchExpedientes: () => Promise<void>;
  addExpediente: (expediente: Partial<Expediente>) => Promise<void>;
  updateExpedienteStatus: (id: string, nuevoEstado: Expediente['estado']) => Promise<void>;
}

const API_URL = 'http://localhost:3000/api';

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
  }
}));
