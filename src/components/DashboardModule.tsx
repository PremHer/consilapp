import React from 'react';
import { motion } from 'framer-motion';

import { useStore, type Expediente } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

const DashboardModule = () => {
  const expedientes = useStore((state) => state.expedientes);
  const searchQuery = useStore((state) => state.searchQuery);
  const filterCategoria = useStore((state) => state.filterCategoria);
  const setFilterCategoria = useStore((state) => state.setFilterCategoria);
  const fetchExpedientes = useStore((state) => state.fetchExpedientes);
  const updateExpedienteStatus = useStore((state) => state.updateExpedienteStatus);
  const [selectedExp, setSelectedExp] = React.useState<Expediente | null>(null);
  const [resultadoAudiencia, setResultadoAudiencia] = React.useState('ACUERDO_TOTAL');
  const navigate = useNavigate();

  // Función utilitaria para Semáforo de Plazos Legales
  const getSemaforoStyle = (fechaCreacion: string, estado: string) => {
    if (estado !== 'RECIBIDO') return ''; // MVP: Evaluamos la calificación inicial
    const hoursElapsed = (new Date().getTime() - new Date(fechaCreacion).getTime()) / (1000 * 60 * 60);
    
    // Para demostración, vamos a simular horas usando minutos si es reciente,
    // o simplemente aplicar la lógica real (Verde < 24h, Amarillo 24h-48h, Rojo > 48h)
    // Usaremos valores arbitrarios de Tailwind
    if (hoursElapsed < 24) return 'border-l-4 border-l-[#4caf50]'; // Verde
    if (hoursElapsed < 48) return 'border-l-4 border-l-[#ffb300]'; // Amarillo
    return 'border-l-4 border-l-error ring-1 ring-error/20'; // Rojo
  };

  // Filtrado de expedientes
  const filteredExpedientes = React.useMemo(() => {
    let filtered = expedientes;

    if (filterCategoria && filterCategoria !== 'Todas las materias') {
      filtered = filtered.filter(exp => exp.materia === filterCategoria || exp.materia.startsWith(filterCategoria));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(exp => 
        (exp.numero && exp.numero.toLowerCase().includes(q)) ||
        (exp.solicitanteNom && exp.solicitanteNom.toLowerCase().includes(q)) ||
        (exp.invitadoNom && exp.invitadoNom.toLowerCase().includes(q)) ||
        (exp.solicitanteDni && exp.solicitanteDni.includes(q)) ||
        (exp.invitadoDni && exp.invitadoDni.includes(q))
      );
    }

    return filtered;
  }, [expedientes, filterCategoria, searchQuery]);

  const exportToCSV = () => {
    const headers = ['Nro Expediente', 'Estado', 'Materia', 'Solicitante', 'Invitado', 'Fecha Creacion'];
    const rows = filteredExpedientes.map(exp => [
      exp.numero || exp.id,
      exp.estado,
      exp.materia,
      exp.solicitanteNom,
      exp.invitadoNom,
      new Date(exp.fechaCreacion).toLocaleString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_expedientes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

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
            <h2 className="font-headline-md text-headline-md text-primary">Bridgelaw</h2>
            <p className="font-body-md text-on-surface-variant">Sede Central - Lima Cercado</p>
          </div>
        </div>
        <button onClick={() => navigate('/admisibilidad')} className="flex items-center gap-sm bg-primary text-on-primary px-lg py-sm rounded-lg font-label-lg hover:opacity-90 active:scale-95 transition-all shadow-md">
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
              <span className="flex items-center gap-xs"><span className="w-2 h-2 rounded-full bg-primary"></span> {filteredExpedientes.filter(e => e.urgency === 'URGENTE').length} Urgentes</span>
              <span className="mx-xs">|</span>
              <span className="flex items-center gap-xs"><span className="w-2 h-2 rounded-full bg-secondary"></span> {filteredExpedientes.filter(e => e.estado !== 'AUDIENCIA').length} En Proceso</span>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">filter_list</span>
              <select 
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant rounded-lg text-label-md py-sm pl-xl pr-md focus:border-primary focus:ring-1 focus:ring-primary appearance-none hover:bg-surface-container-low transition-colors cursor-pointer outline-none">
                <option value="Todas las materias">Todas las materias</option>
                <option value="CIVIL">Civil</option>
                <option value="FAMILIA">Familia</option>
                <option value="ALIMENTOS">Alimentos</option>
                <option value="DESALOJO">Desalojos</option>
                <option value="DEUDAS">Deudas</option>
                <option value="LABORAL">Laboral</option>
              </select>
              <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">arrow_drop_down</span>
            </div>
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-sm bg-surface-container-lowest border border-outline-variant px-md py-sm rounded-lg text-label-lg hover:border-primary hover:text-primary transition-all shadow-sm">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Exportar
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-md md:gap-gutter overflow-x-auto pb-lg snap-x snap-mandatory hide-scrollbar w-full">
          
          {/* Column 1: RECIBIDO */}
          <div className="flex-1 min-w-[85vw] sm:min-w-[300px] snap-center">
            <div className="flex items-center justify-between mb-md px-xs">
              <div className="flex items-center gap-sm">
                <span className="font-label-lg text-on-surface">RECIBIDO</span>
                <span className="bg-surface-container-highest px-sm rounded-full text-label-sm">
                  {filteredExpedientes.filter(e => e.estado === 'RECIBIDO').length.toString().padStart(2, '0')}
                </span>
              </div>
              <button className="text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">more_vert</span></button>
            </div>
            <div className="kanban-column flex flex-col gap-md bg-surface-container-low rounded-xl p-md border border-outline-variant/30">
              {filteredExpedientes.filter(e => e.estado === 'RECIBIDO').map((exp, i) => (
                <motion.div key={exp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedExp(exp)}
                  className={`bg-surface-container-lowest p-md border-t border-r border-b border-outline-variant rounded-lg shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group ${getSemaforoStyle(exp.fechaCreacion, exp.estado)}`}>
                  <div className="flex justify-between items-start mb-sm">
                    <span className="text-label-sm text-primary font-bold">{exp.numero || exp.id.substring(0,8)}</span>
                    <span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">drag_indicator</span>
                  </div>
                  <h4 className="font-label-lg mb-xs">{exp.solicitanteNom}</h4>
                  <div className="flex gap-xs mb-md">
                    <span className="bg-surface-container-high px-sm py-xs rounded text-[10px] font-bold text-on-tertiary-fixed-variant">{exp.materia}</span>
                  </div>
                  <div className="flex items-center justify-between mt-lg">
                    <div className="flex items-center gap-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      <span className="text-label-sm">{new Date(exp.fechaCreacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateExpedienteStatus(exp.id, 'CALIFICADO'); }}
                      className="px-sm py-xs bg-primary text-on-primary rounded text-label-sm font-bold hover:opacity-90 transition-opacity"
                    >
                      Calificar
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Column 2: CALIFICADO */}
          <div className="flex-1 min-w-[85vw] sm:min-w-[300px] snap-center">
            <div className="flex items-center justify-between mb-md px-xs">
              <div className="flex items-center gap-sm">
                <span className="font-label-lg text-on-surface">CALIFICADO</span>
                <span className="bg-secondary-container px-sm rounded-full text-label-sm">
                  {filteredExpedientes.filter(e => e.estado === 'CALIFICADO').length.toString().padStart(2, '0')}
                </span>
              </div>
            </div>
            <div className="kanban-column flex flex-col gap-md bg-surface-container-low rounded-xl p-md border border-outline-variant/30">
              {filteredExpedientes.filter(e => e.estado === 'CALIFICADO').map((exp, i) => (
                <motion.div key={exp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedExp(exp)}
                  className={`bg-surface-container-lowest p-md border-l-4 border-l-secondary border-t border-r border-b border-outline-variant rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer`}>
                  <div className="flex justify-between items-start mb-sm">
                    <span className="text-label-sm text-primary font-bold">{exp.numero || exp.id.substring(0, 8)}</span>
                    <span className="flex items-center gap-xs bg-secondary-container text-on-secondary-fixed px-sm py-xs rounded text-[10px] font-bold">NORMAL</span>
                  </div>
                  <h4 className="font-label-lg mb-xs">{exp.solicitanteNom}</h4>
                  <p className="text-label-sm text-on-surface-variant mb-md">Materia: {exp.materia}</p>
                  <div className="flex items-center justify-between pt-sm border-t border-outline-variant">
                    <div className="flex items-center gap-xs">
                      <div className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant text-[10px] font-bold">DR</div>
                      <span className="text-label-sm truncate max-w-[80px]">Resp: AI</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateExpedienteStatus(exp.id, 'INVITACIONES'); }}
                      className="px-sm py-xs bg-secondary-container text-on-secondary-container rounded text-label-sm font-bold hover:bg-secondary hover:text-on-secondary transition-colors"
                    >
                      Invitar (WhatsApp)
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Column 3: INVITACIONES */}
          <div className="flex-1 min-w-[85vw] sm:min-w-[300px] snap-center">
            <div className="flex items-center justify-between mb-md px-xs">
              <div className="flex items-center gap-sm">
                <span className="font-label-lg text-on-surface">INVITACIONES</span>
                <span className="bg-surface-container-highest px-sm rounded-full text-label-sm">
                  {filteredExpedientes.filter(e => e.estado === 'INVITACIONES').length.toString().padStart(2, '0')}
                </span>
              </div>
            </div>
            <div className="kanban-column flex flex-col gap-md bg-surface-container-low rounded-xl p-md border border-outline-variant/30">
              {filteredExpedientes.filter(e => e.estado === 'INVITACIONES').map((exp, i) => (
                <motion.div key={exp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedExp(exp)}
                  className="bg-surface-container-lowest p-md border border-outline-variant rounded-lg shadow-sm hover:border-primary transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-sm">
                    <span className="text-label-sm text-primary font-bold">{exp.numero || exp.id.substring(0, 8)}</span>
                    <span className="text-label-sm text-on-surface-variant">{exp.solicitanteNom}</span>
                  </div>
                  <h4 className="font-label-lg mb-md">{exp.materia}</h4>
                  <div className="w-full bg-surface-container-high rounded-full h-1.5 mb-sm overflow-hidden">
                    <div className={`h-full bg-secondary`} style={{ width: `50%` }}></div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-on-surface-variant">
                    <div className="flex items-center gap-xs">
                      <span className={`material-symbols-outlined text-[14px] text-primary`}>schedule</span>
                      <span>En espera</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateExpedienteStatus(exp.id, 'AUDIENCIA'); }}
                      className="px-sm py-xs border border-outline-variant rounded text-label-sm font-bold hover:bg-surface-container transition-colors"
                    >
                      Audiencia
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Column 4: AUDIENCIA */}
          <div className="flex-1 min-w-[85vw] sm:min-w-[300px] snap-center">
            <div className="flex items-center justify-between mb-md px-xs">
              <div className="flex items-center gap-sm">
                <span className="font-label-lg text-on-surface">AUDIENCIA</span>
                <span className="bg-primary-container/20 text-primary px-sm rounded-full text-label-sm">
                  {filteredExpedientes.filter(e => e.estado === 'AUDIENCIA').length.toString().padStart(2, '0')}
                </span>
              </div>
            </div>
            <div className="kanban-column flex flex-col gap-md bg-surface-container-low rounded-xl p-md border border-outline-variant/30">
              {filteredExpedientes.filter(e => e.estado === 'AUDIENCIA').map((exp, i) => (
                <motion.div key={exp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedExp(exp)}
                  className="bg-surface-container-lowest p-md border border-outline-variant rounded-lg shadow-sm ring-1 ring-primary/5 hover:border-primary transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-sm">
                    <span className="font-label-md text-on-surface-variant bg-surface-container-highest px-sm py-xs rounded-md border border-outline-variant">
                      {exp.numero || exp.id.substring(0, 8)}
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
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="py-sm px-md border border-primary text-primary rounded-lg text-label-sm font-bold hover:bg-primary hover:text-on-primary transition-all">
                      Ver Detalles de Sala
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* Modal de Detalles del Expediente */}
      {selectedExp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedExp(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-outline-variant">
            <div className="flex justify-between items-center p-md bg-surface-container border-b border-outline-variant">
              <h3 className="font-headline-sm text-on-surface">Detalles del Expediente</h3>
              <button onClick={() => setSelectedExp(null)} className="text-on-surface-variant hover:text-primary p-xs rounded-full hover:bg-surface-container-highest transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-lg space-y-md">
              <div className="grid grid-cols-2 gap-md">
                <div className="bg-surface-container-lowest p-sm rounded-lg border border-outline-variant/50">
                  <p className="text-label-sm text-on-surface-variant mb-xs">N° Expediente</p>
                  <p className="font-label-md text-primary">{selectedExp.numero || selectedExp.id}</p>
                </div>
                <div className="bg-surface-container-lowest p-sm rounded-lg border border-outline-variant/50">
                  <p className="text-label-sm text-on-surface-variant mb-xs">Materia</p>
                  <p className="font-label-md text-on-surface flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px] text-secondary">gavel</span>
                    {selectedExp.materia}
                  </p>
                </div>
              </div>

              <div className="border border-outline-variant rounded-lg overflow-hidden">
                <div className="bg-surface-container px-md py-sm border-b border-outline-variant flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary">person</span>
                  <h4 className="font-label-lg text-primary">Datos del Solicitante</h4>
                </div>
                <div className="p-md bg-surface-container-lowest space-y-sm">
                  <div className="flex justify-between">
                    <span className="text-body-sm text-on-surface-variant">Nombre Completo:</span>
                    <span className="font-label-md text-on-surface">{selectedExp.solicitanteNom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-sm text-on-surface-variant">DNI:</span>
                    <span className="font-label-md text-on-surface">{selectedExp.solicitanteDni}</span>
                  </div>
                </div>
              </div>

              <div className="border border-outline-variant rounded-lg overflow-hidden">
                <div className="bg-surface-container px-md py-sm border-b border-outline-variant flex items-center gap-sm">
                  <span className="material-symbols-outlined text-secondary">person_add</span>
                  <h4 className="font-label-lg text-secondary">Datos del Invitado</h4>
                </div>
                <div className="p-md bg-surface-container-lowest space-y-sm">
                  <div className="flex justify-between">
                    <span className="text-body-sm text-on-surface-variant">Nombre Completo:</span>
                    <span className="font-label-md text-on-surface">{selectedExp.invitadoNom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-sm text-on-surface-variant">DNI:</span>
                    <span className="font-label-md text-on-surface">{selectedExp.invitadoDni}</span>
                  </div>
                  {selectedExp.invitadoCelular && (
                    <div className="flex justify-between">
                      <span className="text-body-sm text-on-surface-variant">Celular:</span>
                      <span className="font-label-md text-on-surface">{selectedExp.invitadoCelular}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedExp.estado === 'AUDIENCIA' && (
                <div className="border border-outline-variant rounded-lg overflow-hidden">
                  <div className="bg-primary-container/20 px-md py-sm border-b border-outline-variant flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary">event</span>
                    <h4 className="font-label-lg text-primary">Programación de Audiencia</h4>
                  </div>
                  <div className="p-md bg-surface-container-lowest flex flex-col gap-sm">
                    {selectedExp.fechaAudiencia ? (
                      <div className="flex justify-between items-center">
                        <span className="text-body-sm text-on-surface-variant">Fecha programada:</span>
                        <span className="font-label-md bg-primary-container text-primary px-sm py-xs rounded">
                          {new Date(selectedExp.fechaAudiencia).toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-sm">
                        <input 
                          type="datetime-local" 
                          className="flex-1 bg-surface border border-outline-variant rounded-lg p-sm text-body-md focus:border-primary outline-none"
                          onChange={(e) => {
                            if (e.target.value) {
                              useStore.getState().agendarAudiencia(selectedExp.id, e.target.value);
                              setSelectedExp({ ...selectedExp, fechaAudiencia: e.target.value });
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {selectedExp.estado === 'AUDIENCIA' && (
                <div className="border border-outline-variant rounded-lg overflow-hidden mt-md">
                  <div className="bg-surface-container px-md py-sm border-b border-outline-variant flex items-center gap-sm">
                    <span className="material-symbols-outlined text-secondary">gavel</span>
                    <h4 className="font-label-lg text-secondary">Finalizar Caso</h4>
                  </div>
                  <div className="p-md bg-surface-container-lowest flex flex-col gap-sm">
                    <label className="text-label-sm text-on-surface-variant font-bold">Resultado de la Audiencia</label>
                    <select 
                      value={resultadoAudiencia}
                      onChange={(e) => setResultadoAudiencia(e.target.value)}
                      className="bg-surface border border-outline-variant rounded-lg p-sm text-body-md focus:border-primary outline-none cursor-pointer"
                    >
                      <option value="ACUERDO_TOTAL">Acuerdo Total</option>
                      <option value="ACUERDO_PARCIAL">Acuerdo Parcial</option>
                      <option value="FALTA_ACUERDO">Falta de Acuerdo</option>
                      <option value="INASISTENCIA_UNA_PARTE">Inasistencia de una parte</option>
                      <option value="INASISTENCIA_AMBAS_PARTES">Inasistencia de ambas partes</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-sm mt-md">
                <div className="flex gap-sm">
                  {selectedExp.enlaceSala && (
                    <a 
                      href={selectedExp.enlaceSala}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-md py-sm bg-secondary text-on-secondary rounded-lg font-label-lg hover:bg-secondary/90 transition-colors shadow-sm flex items-center gap-xs"
                    >
                      <span className="material-symbols-outlined">video_camera_front</span>
                      Sala Virtual
                    </a>
                  )}
                  {selectedExp.estado === 'AUDIENCIA' ? (
                    <button 
                      onClick={() => {
                        import('../utils/pdfGenerator').then(module => {
                          module.generateActaFinalPDF(selectedExp, resultadoAudiencia);
                        });
                      }}
                      className="px-md py-sm bg-primary text-on-primary rounded-lg font-label-lg hover:bg-primary/90 transition-colors flex items-center gap-xs shadow-sm"
                    >
                      <span className="material-symbols-outlined">description</span>
                      Generar Acta Final
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        import('../utils/pdfGenerator').then(module => {
                          module.generateSolicitudPDF(selectedExp);
                        });
                      }}
                      className="px-md py-sm bg-surface-container-high text-on-surface rounded-lg font-label-lg hover:bg-surface-container-highest transition-colors flex items-center gap-xs border border-outline-variant"
                    >
                      <span className="material-symbols-outlined">picture_as_pdf</span>
                      Descargar PDF
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => setSelectedExp(null)} 
                  className="px-lg py-sm bg-primary text-on-primary rounded-lg font-label-lg hover:bg-primary/90 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default DashboardModule;
