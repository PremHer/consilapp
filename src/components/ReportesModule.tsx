import React from 'react';
import { useStore } from '../store/useStore';
import { BarChart, Activity, CheckCircle, Clock, Download, TrendingUp, TrendingDown } from 'lucide-react';

const ReportesModule = () => {
  const expedientes = useStore((state) => state.expedientes);

  const total = expedientes.length;
  const pendientes = expedientes.filter(e => ['RECIBIDO', 'CALIFICADO', 'INVITACIONES'].includes(e.estado)).length;
  const programados = expedientes.filter(e => e.estado === 'AUDIENCIA').length;
  const concluidos = expedientes.filter(e => e.estado === 'CONCLUIDO').length;

  // Distribución por materia (dinámica)
  const materiaStats = React.useMemo(() => {
    const counts: Record<string, number> = {};
    expedientes.forEach(e => {
      const mat = e.materia || 'Sin materia';
      counts[mat] = (counts[mat] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([materia, count]) => ({ materia, count, pct: total > 0 ? (count / total) * 100 : 0 }))
      .sort((a, b) => b.count - a.count);
  }, [expedientes, total]);

  const materiaColors = ['#8f000d', '#735c00', '#444545', '#b22222', '#fed65b', '#e2beba'];

  // Distribución por estado
  const estadoConfig = [
    { key: 'RECIBIDO', label: 'Recibido', color: '#e2beba' },
    { key: 'CALIFICADO', label: 'Calificado', color: '#735c00' },
    { key: 'INVITACIONES', label: 'Invitaciones', color: '#fed65b' },
    { key: 'AUDIENCIA', label: 'Audiencia', color: '#8f000d' },
    { key: 'CONCLUIDO', label: 'Concluido', color: '#4caf50' },
  ];

  const estadoStats = React.useMemo(() => {
    return estadoConfig.map(cfg => {
      const count = expedientes.filter(e => e.estado === cfg.key).length;
      return { ...cfg, count, pct: total > 0 ? (count / total) * 100 : 0 };
    });
  }, [expedientes, total]);

  // Comparación mensual
  const monthlyComparison = React.useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const thisMonthExps = expedientes.filter(e => {
      const d = new Date(e.fechaCreacion);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const lastMonthExps = expedientes.filter(e => {
      const d = new Date(e.fechaCreacion);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });

    const thisMonthConcluidos = thisMonthExps.filter(e => e.estado === 'CONCLUIDO').length;
    const lastMonthConcluidos = lastMonthExps.filter(e => e.estado === 'CONCLUIDO').length;

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    return {
      thisMonthName: monthNames[thisMonth],
      lastMonthName: monthNames[lastMonth],
      thisMonthTotal: thisMonthExps.length,
      lastMonthTotal: lastMonthExps.length,
      thisMonthConcluidos,
      lastMonthConcluidos,
    };
  }, [expedientes]);

  // Exportación a Excel con estilos formateados
  const exportToExcel = () => {
    const headers = ['Nro Expediente', 'Estado', 'Materia', 'Solicitante', 'DNI Solicitante', 'Invitado', 'DNI Invitado', 'Fecha Creación', 'Sesión'];
    
    const estadoLabels: Record<string, string> = {
      RECIBIDO: 'Recibido',
      CALIFICADO: 'Calificado',
      INVITACIONES: 'Invitaciones',
      AUDIENCIA: 'Audiencia',
      CONCLUIDO: 'Concluido',
    };

    const getEstadoStyle = (estado: string) => {
      switch (estado) {
        case 'CONCLUIDO': return 'background-color: #e8f5e9; color: #2e7d32; font-weight: bold; text-align: center;';
        case 'AUDIENCIA': return 'background-color: #ffebee; color: #c62828; font-weight: bold; text-align: center;';
        case 'INVITACIONES': return 'background-color: #fff8e1; color: #f57f17; font-weight: bold; text-align: center;';
        case 'CALIFICADO': return 'background-color: #efebe9; color: #4e342e; font-weight: bold; text-align: center;';
        default: return 'background-color: #e3f2fd; color: #1565c0; font-weight: bold; text-align: center;';
      }
    };

    // Crear el contenido HTML con estilos para Excel
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <style>
          table { border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; }
          th { background-color: #8f000d; color: #ffffff; font-weight: bold; border: 1px solid #dcd9d9; padding: 10px; text-align: left; }
          td { border: 1px solid #e5e2e1; padding: 8px; vertical-align: middle; }
          .tr-even { background-color: #fcf9f8; }
          .title-row { font-size: 16pt; font-weight: bold; color: #8f000d; text-align: center; padding: 15px; }
          .meta-row { font-size: 10pt; color: #5a403e; font-style: italic; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="${headers.length}" class="title-row">REPORTE GENERAL DE EXPEDIENTES - BRIDGELAW</td>
          </tr>
          <tr>
            <td colspan="${headers.length}" class="meta-row">Generado el: ${new Date().toLocaleString('es-PE')} | Total registros: ${expedientes.length}</td>
          </tr>
          <tr><td colspan="${headers.length}" style="border:none; height:10px;"></td></tr>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${expedientes.map((exp, i) => `
              <tr class="${i % 2 === 0 ? '' : 'tr-even'}">
                <td style="font-weight: bold; color: #8f000d;">${exp.numero || exp.id}</td>
                <td style="${getEstadoStyle(exp.estado)}">${estadoLabels[exp.estado] || exp.estado}</td>
                <td>${exp.materia}</td>
                <td>${exp.solicitanteNom}</td>
                <td style="mso-number-format:'@';">${exp.solicitanteDni}</td>
                <td>${exp.invitadoNom}</td>
                <td style="mso-number-format:'@';">${exp.invitadoDni}</td>
                <td>${new Date(exp.fechaCreacion).toLocaleString('es-PE')}</td>
                <td style="text-align: center;">${exp.sesionActual}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_expedientes_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const pct = (value: number) => total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto pt-lg px-md w-full">
      <div className="mb-xl flex flex-col md:flex-row justify-between md:items-end gap-md">
        <div>
          <h1 className="font-headline-lg text-primary mb-xs">Reportes y Analíticas</h1>
          <p className="text-on-surface-variant text-body-lg">Visión general del desempeño del Centro de Conciliación.</p>
        </div>
        <button 
          onClick={exportToExcel}
          className="flex items-center gap-sm bg-surface-container-lowest border border-outline-variant px-md py-sm rounded-lg text-label-lg hover:border-primary hover:text-primary transition-all shadow-sm self-start"
        >
          <Download size={18} />
          Exportar Excel
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
          <div className="flex items-center gap-sm mb-sm text-on-surface-variant">
            <Activity size={20} className="text-primary" />
            <span className="font-label-md">Total Expedientes</span>
          </div>
          <p className="font-display text-4xl text-on-surface">{total}</p>
          <p className="text-label-sm text-on-surface-variant mt-xs">100% del registro</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
          <div className="flex items-center gap-sm mb-sm text-on-surface-variant">
            <Clock size={20} style={{ color: '#735c00' }} />
            <span className="font-label-md">En Proceso</span>
          </div>
          <p className="font-display text-4xl text-on-surface">{pendientes}</p>
          <p className="text-label-sm text-on-surface-variant mt-xs">{pct(pendientes)}% del total</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
          <div className="flex items-center gap-sm mb-sm text-on-surface-variant">
            <BarChart size={20} className="text-primary" />
            <span className="font-label-md">Audiencias Programadas</span>
          </div>
          <p className="font-display text-4xl text-on-surface">{programados}</p>
          <p className="text-label-sm text-on-surface-variant mt-xs">{pct(programados)}% del total</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
          <div className="flex items-center gap-sm mb-sm text-on-surface-variant">
            <CheckCircle size={20} style={{ color: '#4caf50' }} />
            <span className="font-label-md">Casos Concluidos</span>
          </div>
          <p className="font-display text-4xl text-on-surface">{concluidos}</p>
          <p className="text-label-sm text-on-surface-variant mt-xs">{pct(concluidos)}% del total</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-xl">
        {/* Distribución por Materia */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          <h3 className="font-headline-sm mb-lg text-on-surface">Distribución por Materia</h3>
          {materiaStats.length === 0 ? (
            <p className="text-body-md text-on-surface-variant text-center py-lg">No hay expedientes registrados.</p>
          ) : (
            <div className="space-y-md">
              {materiaStats.map((stat, i) => (
                <div key={stat.materia}>
                  <div className="flex justify-between text-label-sm mb-xs">
                    <span className="text-on-surface">{stat.materia}</span>
                    <span className="text-on-surface-variant">{stat.count} ({Math.round(stat.pct)}%)</span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full transition-all duration-500" 
                      style={{ width: `${stat.pct}%`, backgroundColor: materiaColors[i % materiaColors.length] }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Distribución por Estado */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          <h3 className="font-headline-sm mb-lg text-on-surface">Distribución por Estado</h3>
          <div className="space-y-md">
            {estadoStats.map(stat => (
              <div key={stat.key}>
                <div className="flex justify-between text-label-sm mb-xs">
                  <span className="text-on-surface">{stat.label}</span>
                  <span className="text-on-surface-variant">{stat.count} ({Math.round(stat.pct)}%)</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2.5">
                  <div 
                    className="h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.max(stat.pct, 2)}%`, backgroundColor: stat.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparación Mensual */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
        <h3 className="font-headline-sm mb-lg text-on-surface">Comparación Mensual</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
          <div className="flex items-center justify-between p-md bg-surface-container-low rounded-lg border border-outline-variant">
            <div>
              <p className="text-label-sm text-on-surface-variant mb-xs">Expedientes Ingresados</p>
              <p className="font-headline-sm text-on-surface">{monthlyComparison.thisMonthName}: <strong>{monthlyComparison.thisMonthTotal}</strong></p>
              <p className="text-body-sm text-on-surface-variant">{monthlyComparison.lastMonthName}: {monthlyComparison.lastMonthTotal}</p>
            </div>
            <div className="flex items-center gap-xs">
              {monthlyComparison.thisMonthTotal >= monthlyComparison.lastMonthTotal ? (
                <TrendingUp size={24} style={{ color: '#4caf50' }} />
              ) : (
                <TrendingDown size={24} className="text-error" />
              )}
            </div>
          </div>
          <div className="flex items-center justify-between p-md bg-surface-container-low rounded-lg border border-outline-variant">
            <div>
              <p className="text-label-sm text-on-surface-variant mb-xs">Casos Concluidos</p>
              <p className="font-headline-sm text-on-surface">{monthlyComparison.thisMonthName}: <strong>{monthlyComparison.thisMonthConcluidos}</strong></p>
              <p className="text-body-sm text-on-surface-variant">{monthlyComparison.lastMonthName}: {monthlyComparison.lastMonthConcluidos}</p>
            </div>
            <div className="flex items-center gap-xs">
              {monthlyComparison.thisMonthConcluidos >= monthlyComparison.lastMonthConcluidos ? (
                <TrendingUp size={24} style={{ color: '#4caf50' }} />
              ) : (
                <TrendingDown size={24} className="text-error" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportesModule;
