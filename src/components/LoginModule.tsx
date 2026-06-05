import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';

const LoginModule = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore(state => state.login);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // Ruta a la que intentaba ir antes de ser redirigido
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      login(data.user, data.token);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-md">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-surface-container-lowest p-xl border border-outline-variant rounded-2xl shadow-sm"
      >
        <div className="text-center mb-xl">
          <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-md">
            <Lock className="text-primary" size={32} />
          </div>
          <h1 className="font-headline-md text-primary font-bold">Portal del Conciliador</h1>
          <p className="text-on-surface-variant text-body-md mt-xs">Ingrese sus credenciales de acceso institucional</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-lg">
          <div>
            <label className="block text-label-lg font-bold text-on-surface mb-xs">Correo Electrónico</label>
            <div className="relative">
              <span className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant">
                <Mail size={20} />
              </span>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-xl pr-md py-sm bg-surface border border-outline-variant rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="admin@bridgelaw.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-label-lg font-bold text-on-surface mb-xs">Contraseña</label>
            <div className="relative">
              <span className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant">
                <Lock size={20} />
              </span>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-xl pr-md py-sm bg-surface border border-outline-variant rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-error-container text-on-error-container p-sm rounded-lg text-label-md text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary text-on-primary py-sm rounded-lg font-label-lg hover:opacity-90 transition-all shadow-md flex justify-center items-center gap-sm disabled:opacity-50"
          >
            {isLoading ? 'Verificando...' : (
              <>Ingresar al Sistema <ArrowRight size={18} /></>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginModule;
