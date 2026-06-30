import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Search, X } from 'lucide-react';
import { useStore } from '../store/useStore';

const CalendarioModule = () => {
  const expedientes = useStore((state) => state.expedientes);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filtrar solo expedientes con audiencia programada
  const audiencias = useMemo(() => {
    let filtered = expedientes.filter(e => e.fechaAudiencia);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        (e.solicitanteNom && e.solicitanteNom.toLowerCase().includes(q)) ||
        (e.invitadoNom && e.invitadoNom.toLowerCase().includes(q)) ||
        (e.solicitanteDni && e.solicitanteDni.includes(q)) ||
        (e.invitadoDni && e.invitadoDni.includes(q)) ||
        (e.numero && e.numero.toLowerCase().includes(q))
      );
    }

    return filtered.sort((a, b) => new Date(a.fechaAudiencia!).getTime() - new Date(b.fechaAudiencia!).getTime());
  }, [expedientes, searchQuery]);

  // Resumen mensual real
  const resumenMensual = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const audienciasEsteMes = expedientes.filter(e => {
      if (!e.fechaAudiencia) return false;
      const d = new Date(e.fechaAudiencia);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    const programadas = audienciasEsteMes.filter(e => new Date(e.fechaAudiencia!) > now).length;
    const realizadas = audienciasEsteMes.filter(e => new Date(e.fechaAudiencia!) <= now && e.estado === 'CONCLUIDO').length;
    const pendientes = audienciasEsteMes.filter(e => new Date(e.fechaAudiencia!) <= now && e.estado !== 'CONCLUIDO').length;

    return { programadas, realizadas, pendientes };
  }, [expedientes]);

  return (
    <div className="max-w-6xl mx-auto pt-lg px-md w-full">
      <div className="mb-xl flex flex-col md:flex-row justify-between md:items-end gap-md">
        <div>
          <h1 className="font-headline-lg text-primary mb-xs">Calendario de Audiencias</h1>
          <p className="text-on-surface-variant text-body-lg">Vista cronológica de las conciliaciones programadas.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por DNI o Nombres..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-xl pr-xl py-sm bg-surface-container-lowest border border-outline-variant rounded-lg w-full md:w-64 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {/* Próximas Audiencias */}
        <div className="md:col-span-2 space-y-md">
          {audiencias.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl text-center text-on-surface-variant">
              <Calendar size={48} className="mx-auto mb-md opacity-50" />
              <p className="font-label-lg">
                {searchQuery ? 'No se encontraron audiencias con esa búsqueda' : 'No hay audiencias programadas'}
              </p>
              <p className="text-body-md">
                {searchQuery ? 'Intenta con otro término de búsqueda.' : 'Vaya al Tablero y mueva expedientes a estado AUDIENCIA.'}
              </p>
            </div>
          ) : (
            audiencias.map((exp, i) => (
              <motion.div key={exp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} 
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col md:flex-row gap-md shadow-sm hover:shadow-md transition-shadow">
                
                <div className="bg-primary-container text-on-primary-container rounded-lg p-md text-center min-w-[120px] flex flex-col justify-center border border-primary/20">
                  <span className="text-label-lg uppercase">{new Date(exp.fechaAudiencia!).toLocaleString('es-PE', { month: 'short' })}</span>
                  <span className="text-4xl font-bold font-display leading-none">{new Date(exp.fechaAudiencia!).getDate()}</span>
                  <span className="text-label-md mt-xs">{new Date(exp.fechaAudiencia!).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-sm">
                    <span className="bg-surface-container-highest px-sm py-xs rounded text-label-sm font-bold border border-outline-variant text-on-surface-variant">
                      {exp.numero || exp.id.substring(0,8)}
                    </span>
                    <span className="bg-secondary-container text-on-secondary-container px-sm py-xs rounded text-label-sm font-bold flex items-center gap-xs">
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                      {exp.materia}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-on-surface mb-xs truncate" title={`${exp.solicitanteNom} vs. ${exp.invitadoNom}`}>{exp.solicitanteNom} vs. {exp.invitadoNom}</h3>
                  
                  <div className="flex flex-col gap-xs mt-md">
                    <p className="text-body-sm text-on-surface-variant flex items-center gap-xs">
                      <Clock size={16} /> 
                      Duración estimada: 1 hora
                    </p>
                    <p className="text-body-sm text-on-surface-variant flex items-center gap-xs">
                      <MapPin size={16} /> 
                      Sala de Conciliación 1 (Virtual / Presencial)
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-end mt-sm md:mt-0">
                  {exp.enlaceSala && Date.now() < new Date(exp.fechaAudiencia!).getTime() + (2 * 60 * 60 * 1000) ? (
                    <a 
                      href={exp.enlaceSala} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="border border-primary text-primary px-md py-sm rounded-lg font-label-md hover:bg-primary hover:text-on-primary transition-colors whitespace-nowrap text-center flex items-center justify-center gap-xs"
                    >
                      Ingresar a Sala
                    </a>
                  ) : (
                    <span className="bg-surface-container-highest text-on-surface-variant px-md py-sm rounded-lg font-label-md whitespace-nowrap text-center border border-outline-variant">
                      Audiencia Vencida
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Resumen Lateral */}
        <div className="space-y-md">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
            <h3 className="font-headline-sm mb-md text-on-surface">Resumen Mensual</h3>
            <div className="space-y-sm">
              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Programadas</span>
                <span className="font-bold">{resumenMensual.programadas}</span>
              </div>
              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Realizadas</span>
                <span className="font-bold" style={{ color: '#4caf50' }}>{resumenMensual.realizadas}</span>
              </div>
              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Pendientes</span>
                <span className="font-bold text-secondary">{resumenMensual.pendientes}</span>
              </div>
            </div>
          </div>
          {searchQuery && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md text-center">
              <p className="text-label-sm text-on-surface-variant">
                Mostrando <strong className="text-on-surface">{audiencias.length}</strong> resultado{audiencias.length !== 1 ? 's' : ''} para "<strong className="text-primary">{searchQuery}</strong>"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarioModule;
