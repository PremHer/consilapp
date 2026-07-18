import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, FileText, Calendar, CheckCircle, ShieldAlert } from 'lucide-react';
import type { Expediente } from '../store/useStore';

const SeguimientoModule = () => {
  const { numero } = useParams();
  const navigate = useNavigate();
  const [expediente, setExpediente] = useState<Expediente | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [buscarInput, setBuscarInput] = useState('');

  useEffect(() => {
    const fetchExpediente = async () => {
      try {
        setIsLoading(true);
        setError('');
        const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000/api' : 'https://consilapp-production.up.railway.app/api');
        const res = await fetch(`${API_URL}/expedientes/buscar/${numero}`);
        
        if (!res.ok) throw new Error('Expediente no encontrado');
        
        const data = await res.json();
        setExpediente(data);
      } catch (err: any) {
        setExpediente(null);
        setError(err.message || 'Error al buscar el expediente.');
      } finally {
        setIsLoading(false);
      }
    };

    if (numero) {
      fetchExpediente();
    } else {
      setExpediente(null);
      setIsLoading(false);
    }
  }, [numero]);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = buscarInput.trim();
    if (cleanCode) {
      navigate(`/seguimiento/${cleanCode}`);
    }
  };

  // Interfaz de búsqueda cuando no hay número de expediente especificado o hay error
  const renderBuscarConsola = (msgError?: string) => {
    return (
      <div className="max-w-md mx-auto pt-xl px-md pb-xl">
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-surface-container-lowest border border-outline-variant p-lg md:p-xl rounded-xl shadow-lg text-center"
        >
          <div className="bg-primary-container text-primary p-md rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-lg">
            <Search size={32} />
          </div>
          <h2 className="font-headline-sm text-on-surface mb-xs">Consulta de Expediente</h2>
          <p className="text-body-md text-on-surface-variant mb-xl">
            Ingrese el número de seguimiento de su trámite de conciliación para verificar su estado actual.
          </p>

          {msgError && (
            <div className="mb-md p-sm bg-error-container text-on-error-container rounded-lg text-label-md flex items-center gap-xs justify-center">
              <ShieldAlert size={16} />
              <span>Código de expediente no encontrado. Intente nuevamente.</span>
            </div>
          )}

          <form onSubmit={handleBuscar} className="space-y-md">
            <div>
              <input 
                type="text" 
                value={buscarInput}
                onChange={(e) => setBuscarInput(e.target.value)}
                placeholder="Ej. 2026-003 o ID de expediente" 
                className="w-full p-sm bg-surface border border-outline-variant rounded-lg text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-center font-bold text-lg"
                required
              />
            </div>
            <button 
              type="submit" 
              className="w-full py-sm bg-primary text-on-primary rounded-lg font-label-lg hover:opacity-90 transition-colors shadow-md flex items-center justify-center gap-sm"
            >
              <Search size={18} />
              Buscar Solicitud
            </button>
          </form>

          <div className="mt-xl border-t border-outline-variant/50 pt-md">
            <Link to="/" className="text-label-md text-on-surface-variant hover:text-primary transition-colors">
              Volver a la página de inicio
            </Link>
          </div>
        </motion.div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] p-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!numero) {
    return renderBuscarConsola();
  }

  if (error || !expediente) {
    return renderBuscarConsola(error || 'No encontrado');
  }

  const getStatusStep = () => {
    switch(expediente.estado) {
      case 'RECIBIDO': return 1;
      case 'CALIFICADO': return 2;
      case 'INVITACIONES': return 3;
      case 'AUDIENCIA': return 4;
      case 'CONCLUIDO': return 5;
      default: return 1;
    }
  };

  const step = getStatusStep();

  return (
    <div className="max-w-4xl mx-auto pt-xl px-md pb-xl">
      <div className="mb-xl text-center flex flex-col items-center">
        <h1 className="font-headline-lg text-primary mb-xs">Seguimiento de Expediente</h1>
        <p className="text-on-surface-variant text-body-lg mb-md">Consulte el estado actual de su solicitud de conciliación.</p>
        <button 
          onClick={() => { setBuscarInput(''); navigate('/seguimiento'); }} 
          className="text-label-md text-primary font-bold hover:underline flex items-center gap-xs"
        >
          <Search size={14} />
          Consultar otro expediente
        </button>
      </div>

      <div className="bg-surface-container-lowest p-lg md:p-xl border border-outline-variant rounded-xl shadow-sm mb-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-outline-variant pb-md mb-md">
          <div>
            <h2 className="font-headline-md text-on-surface mb-xs">Expediente #{expediente.numero || expediente.id.substring(0,8)}</h2>
            <p className="text-label-lg font-bold text-primary">{expediente.materia}</p>
          </div>
          <div className="mt-sm md:mt-0 px-md py-xs rounded-full bg-surface-container border border-outline-variant font-bold text-label-md text-on-surface">
            Estado: {expediente.estado}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-xl">
          <div className="bg-surface-container p-md rounded-lg">
            <p className="text-label-sm text-on-surface-variant mb-xs">Parte Solicitante</p>
            <p className="font-bold text-body-lg">{expediente.solicitanteNom}</p>
          </div>
          <div className="bg-surface-container p-md rounded-lg">
            <p className="text-label-sm text-on-surface-variant mb-xs">Parte Invitada</p>
            <p className="font-bold text-body-lg">{expediente.invitadoNom}</p>
          </div>
        </div>

        {/* Timeline Lineal Simple */}
        <h3 className="font-headline-sm mb-md text-on-surface">Progreso del Trámite</h3>
        <div className="relative pt-md pb-lg">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-container-high -translate-y-1/2 rounded-full hidden sm:block"></div>
          <div className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full hidden sm:block transition-all duration-500" style={{ width: `${((step - 1) / 4) * 100}%` }}></div>
          
          <div className="flex flex-col sm:flex-row justify-between relative z-10 gap-md sm:gap-0">
            {[
              { num: 1, label: 'Recibido', icon: FileText },
              { num: 2, label: 'Calificado', icon: Search },
              { num: 3, label: 'Invitaciones', icon: CheckCircle },
              { num: 4, label: 'Audiencia', icon: Calendar },
              { num: 5, label: 'Concluido', icon: CheckCircle }
            ].map((s) => {
              const Icon = s.icon;
              const isActive = step >= s.num;
              const isCurrent = step === s.num;
              
              return (
                <div key={s.num} className="flex sm:flex-col items-center gap-md sm:gap-sm">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 shadow-sm ${isActive ? 'bg-primary border-primary text-on-primary' : 'bg-surface border-outline-variant text-on-surface-variant'}`}>
                    <Icon size={20} />
                  </div>
                  <div className="sm:text-center">
                    <p className={`font-bold text-label-md ${isCurrent ? 'text-primary' : isActive ? 'text-on-surface' : 'text-on-surface-variant'}`}>{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {expediente.fechaAudiencia && expediente.estado !== 'CONCLUIDO' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-primary-container p-lg border border-primary/20 rounded-xl shadow-sm flex flex-col sm:flex-row items-center gap-lg">
          <div className="bg-primary text-on-primary p-md rounded-full">
            <Calendar size={32} />
          </div>
          <div>
            <h3 className="font-headline-sm text-primary mb-xs">Audiencia Programada</h3>
            <p className="text-body-lg text-on-surface">La audiencia de conciliación se llevará a cabo el <strong>{new Date(expediente.fechaAudiencia).toLocaleString('es-PE')}</strong>.</p>
            <p className="text-label-md text-on-surface-variant mt-xs">Se le enviará el enlace de Google Meet por WhatsApp minutos antes.</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SeguimientoModule;
