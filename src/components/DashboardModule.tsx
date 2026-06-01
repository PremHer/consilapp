import React from 'react';
import { motion } from 'framer-motion';

import { useStore } from '../store/useStore';

const DashboardModule = () => {
  const expedientes = useStore((state) => state.expedientes);
  const fetchExpedientes = useStore((state) => state.fetchExpedientes);

  React.useEffect(() => {
    fetchExpedientes();
  }, [fetchExpedientes]);

  return (
    <>
      {/* TopAppBar */}
      <div className="flex justify-between items-center px-lg py-md w-full bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-md">
          <span className="material-symbols-outlined text-primary text-headline-md">gavel</span>
          <div>
            <h2 className="font-headline-md text-headline-md text-primary">Centro de Conciliación</h2>
            <p className="font-body-md text-on-surface-variant">Sede Central - Lima Cercado</p>
          </div>
        </div>
        <button className="flex items-center gap-sm bg-primary text-on-primary px-lg py-sm rounded-lg font-label-lg hover:opacity-90 active:scale-95 transition-all shadow-md">
          <span className="material-symbols-outlined">add</span>
          Nueva Solicitud
        </button>
      </div>

      {/* Dashboard Header & Filters */}
      <main className="flex-1 p-lg overflow-x-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xl">
          <div>
            <h3 className="font-headline-sm text-headline-sm mb-xs text-on-surface">Tablero de Conciliación</h3>
            <div className="flex items-center gap-sm text-label-md text-on-surface-variant">
              <span className="flex items-center gap-xs"><span className="w-2 h-2 rounded-full bg-primary"></span> 12 Urgentes</span>
              <span className="mx-xs">|</span>
              <span className="flex items-center gap-xs"><span className="w-2 h-2 rounded-full bg-secondary"></span> 45 En Proceso</span>
            </div>
          </div>
          <div className="flex items-center gap-sm">
            <select className="bg-surface border border-outline-variant rounded-lg text-label-md py-sm px-md focus:border-primary">
              <option>Especialidad: Todas</option>
              <option>Civil</option>
              <option>Familiar</option>
              <option>Laboral</option>
            </select>
            <button className="flex items-center gap-sm bg-surface-container border border-outline-variant px-md py-sm rounded-lg text-label-lg hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-body-md">file_download</span>
              Exportar Reporte
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-gutter overflow-x-auto pb-lg min-w-[1200px]">
          
          {/* Column 1: RECIBIDO */}
          <div className="flex-1 min-w-[300px]">
            <div className="flex items-center justify-between mb-md px-xs">
              <div className="flex items-center gap-sm">
                <span className="font-label-lg text-on-surface">RECIBIDO</span>
                <span className="bg-surface-container-highest px-sm rounded-full text-label-sm">
                  {expedientes.filter(e => e.estado === 'RECIBIDO').length.toString().padStart(2, '0')}
                </span>
              </div>
              <button className="text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">more_vert</span></button>
            </div>
            <div className="kanban-column flex flex-col gap-md bg-surface-container-low rounded-xl p-md border border-outline-variant/30">
              {expedientes.filter(e => e.estado === 'RECIBIDO').map((exp, i) => (
                <motion.div key={exp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-surface-container-lowest p-md border border-outline-variant rounded-lg shadow-sm hover:border-primary transition-all cursor-grab active:cursor-grabbing group">
                  <div className="flex justify-between items-start mb-sm">
                    <span className="text-label-sm text-primary font-bold">{exp.id}</span>
                    <span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">drag_indicator</span>
                  </div>
                  <h4 className="font-label-lg mb-xs">{exp.solicitanteNom}</h4>
                  <div className="flex gap-xs mb-md">
                    <span className="bg-surface-container-high px-sm py-xs rounded text-[10px] font-bold text-on-tertiary-fixed-variant">{exp.materia}</span>
                  </div>
                  <div className="flex items-center justify-between mt-lg">
                    <div className="flex items-center gap-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      <span className="text-label-sm">{new Date(exp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-[10px] font-bold text-on-primary-fixed">{exp.solicitanteNom?.substring(0, 2).toUpperCase() || 'AI'}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Column 2: CALIFICADO */}
          <div className="flex-1 min-w-[300px]">
            <div className="flex items-center justify-between mb-md px-xs">
              <div className="flex items-center gap-sm">
                <span className="font-label-lg text-on-surface">CALIFICADO</span>
                <span className="bg-secondary-container px-sm rounded-full text-label-sm">
                  {expedientes.filter(e => e.estado === 'CALIFICADO').length.toString().padStart(2, '0')}
                </span>
              </div>
            </div>
            <div className="kanban-column flex flex-col gap-md bg-surface-container-low rounded-xl p-md border border-outline-variant/30">
              {expedientes.filter(e => e.estado === 'CALIFICADO').map((exp, i) => (
                <motion.div key={exp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className={`bg-surface-container-lowest p-md border-l-4 border-l-secondary border-t border-r border-b border-outline-variant rounded-lg shadow-sm hover:shadow-md transition-all`}>
                  <div className="flex justify-between items-start mb-sm">
                    <span className="text-label-sm text-primary font-bold">{exp.id.substring(0, 8)}</span>
                    <span className="flex items-center gap-xs bg-secondary-container text-on-secondary-fixed px-sm py-xs rounded text-[10px] font-bold">NORMAL</span>
                  </div>
                  <h4 className="font-label-lg mb-xs">{exp.solicitanteNom}</h4>
                  <p className="text-label-sm text-on-surface-variant mb-md">Materia: {exp.materia}</p>
                  <div className="flex items-center gap-sm pt-sm border-t border-outline-variant">
                    <div className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant text-[10px] font-bold">DR</div>
                    <span className="text-label-sm">Asignado: {exp.solicitanteNom?.substring(0, 2).toUpperCase() || 'AI'}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Column 3: INVITACIONES */}
          <div className="flex-1 min-w-[300px]">
            <div className="flex items-center justify-between mb-md px-xs">
              <div className="flex items-center gap-sm">
                <span className="font-label-lg text-on-surface">INVITACIONES</span>
                <span className="bg-surface-container-highest px-sm rounded-full text-label-sm">
                  {expedientes.filter(e => e.estado === 'INVITACIONES').length.toString().padStart(2, '0')}
                </span>
              </div>
            </div>
            <div className="kanban-column flex flex-col gap-md bg-surface-container-low rounded-xl p-md border border-outline-variant/30">
              {expedientes.filter(e => e.estado === 'INVITACIONES').map((exp, i) => (
                <motion.div key={exp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-surface-container-lowest p-md border border-outline-variant rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-sm">
                    <span className="text-label-sm text-primary font-bold">{exp.id.substring(0, 8)}</span>
                    <span className="text-label-sm text-on-surface-variant">{exp.solicitanteNom}</span>
                  </div>
                  <h4 className="font-label-lg mb-md">{exp.materia}</h4>
                  <div className="w-full bg-surface-container-high rounded-full h-1.5 mb-sm overflow-hidden">
                    <div className={`h-full bg-secondary`} style={{ width: `50%` }}></div>
                  </div>
                  <div className="flex items-center gap-xs text-[10px] text-on-surface-variant">
                    <span className={`material-symbols-outlined text-[14px] text-primary`}>schedule</span>
                    <span>En espera</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Column 4: AUDIENCIA */}
          <div className="flex-1 min-w-[300px]">
            <div className="flex items-center justify-between mb-md px-xs">
              <div className="flex items-center gap-sm">
                <span className="font-label-lg text-on-surface">AUDIENCIA</span>
                <span className="bg-primary-container/20 text-primary px-sm rounded-full text-label-sm">
                  {expedientes.filter(e => e.estado === 'AUDIENCIA').length.toString().padStart(2, '0')}
                </span>
              </div>
            </div>
            <div className="kanban-column flex flex-col gap-md bg-surface-container-low rounded-xl p-md border border-outline-variant/30">
              {expedientes.filter(e => e.estado === 'AUDIENCIA').map((exp, i) => (
                <motion.div key={exp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-surface-container-lowest p-md border border-outline-variant rounded-lg shadow-sm ring-1 ring-primary/5">
                  <div className="flex justify-between items-start mb-sm">
                    <span className="font-label-md text-primary bg-primary-container px-sm py-xs rounded-md">
                      {exp.id.substring(0, 8)}
                    </span>
                    <span className="text-label-sm text-on-surface-variant flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[16px]">schedule</span> Reciente
                    </span>
                  </div>
                  <h4 className="font-headline-sm text-on-surface mb-xs truncate" title={`${exp.solicitanteNom} vs. ${exp.invitadoNom}`}>
                    {exp.solicitanteNom} vs. {exp.invitadoNom}
                  </h4>
                  <p className="text-body-md text-on-surface-variant mb-md flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px]">gavel</span>
                    {exp.materia}
                  </p>
                  <div className="flex justify-between items-center border-t border-outline-variant/30 pt-sm mt-sm">
                    <div className="flex items-center gap-xs">
                      <div className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-label-sm text-[10px]">
                        {exp.solicitanteNom?.substring(0, 2).toUpperCase() || 'AI'}
                      </div>
                      <span className="text-label-sm text-on-surface-variant">Asignar...</span>
                    </div>
                    <button className="py-sm px-md border border-primary text-primary rounded-lg text-label-sm font-bold hover:bg-primary hover:text-on-primary transition-all">
                      Ver Detalles de Sala
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* Floating Action Button (FAB) */}
      <button className="fixed bottom-lg right-lg w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50">
        <span className="material-symbols-outlined text-[32px]">add</span>
      </button>
    </>
  );
};

export default DashboardModule;
