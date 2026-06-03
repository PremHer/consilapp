import { useStore } from '../store/useStore';
import { BarChart, Activity, CheckCircle, Clock } from 'lucide-react';

const ReportesModule = () => {
  const expedientes = useStore((state) => state.expedientes);

  const total = expedientes.length;
  const civiles = expedientes.filter(e => e.materia.toUpperCase() === 'CIVIL').length;
  const familiares = expedientes.filter(e => e.materia.toUpperCase() === 'FAMILIA').length;
  
  const pendientes = expedientes.filter(e => ['RECIBIDO', 'CALIFICADO', 'INVITACIONES'].includes(e.estado)).length;
  const programados = expedientes.filter(e => e.estado === 'AUDIENCIA').length;

  return (
    <div className="max-w-6xl mx-auto pt-lg px-md w-full">
      <div className="mb-xl">
        <h1 className="font-headline-lg text-primary mb-xs">Reportes y Analíticas</h1>
        <p className="text-on-surface-variant text-body-lg">Visión general del desempeño del Centro de Conciliación.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
          <div className="flex items-center gap-sm mb-sm text-on-surface-variant">
            <Activity size={20} className="text-primary" />
            <span className="font-label-md">Total Expedientes</span>
          </div>
          <p className="font-display text-4xl text-on-surface">{total}</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
          <div className="flex items-center gap-sm mb-sm text-on-surface-variant">
            <Clock size={20} className="text-secondary" />
            <span className="font-label-md">En Proceso</span>
          </div>
          <p className="font-display text-4xl text-on-surface">{pendientes}</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
          <div className="flex items-center gap-sm mb-sm text-on-surface-variant">
            <BarChart size={20} className="text-primary" />
            <span className="font-label-md">Audiencias Programadas</span>
          </div>
          <p className="font-display text-4xl text-on-surface">{programados}</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
          <div className="flex items-center gap-sm mb-sm text-on-surface-variant">
            <CheckCircle size={20} className="text-success" />
            <span className="font-label-md">Casos Resueltos</span>
          </div>
          <p className="font-display text-4xl text-on-surface">0</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        {/* Gráfico por Materia */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          <h3 className="font-headline-sm mb-lg text-on-surface">Distribución por Materia</h3>
          
          <div className="space-y-md">
            <div>
              <div className="flex justify-between text-label-sm mb-xs">
                <span>Civil</span>
                <span>{Math.round((civiles/total)*100) || 0}%</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${(civiles/total)*100}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-label-sm mb-xs">
                <span>Familia</span>
                <span>{Math.round((familiares/total)*100) || 0}%</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-2">
                <div className="bg-secondary h-2 rounded-full" style={{ width: `${(familiares/total)*100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Tiempos */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          <h3 className="font-headline-sm mb-lg text-on-surface">Tiempos de Atención (Promedio)</h3>
          
          <div className="space-y-md text-on-surface-variant">
            <div className="flex justify-between items-center p-sm bg-surface-container-low rounded-lg border border-outline-variant">
              <span>Recepción a Calificación</span>
              <span className="font-bold text-on-surface">1.2 días</span>
            </div>
            <div className="flex justify-between items-center p-sm bg-surface-container-low rounded-lg border border-outline-variant">
              <span>Calificación a Invitación</span>
              <span className="font-bold text-on-surface">2.4 días</span>
            </div>
            <div className="flex justify-between items-center p-sm bg-surface-container-low rounded-lg border border-outline-variant">
              <span>Invitación a Audiencia</span>
              <span className="font-bold text-on-surface">5.0 días</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportesModule;
