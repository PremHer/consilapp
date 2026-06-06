import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { Expediente } from '../store/useStore';

export const generateSolicitudPDF = (expediente: Expediente) => {
  const doc = new jsPDF();

  // Configuración inicial
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 20;
  let cursorY = 20;

  // Función para centrar texto
  const addCenteredText = (text: string, y: number, fontSize = 12, fontStyle = 'normal') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
    const textOffset = (pageWidth - textWidth) / 2;
    doc.text(text, textOffset, y);
  };

  // Encabezado Oficial
  addCenteredText('REPÚBLICA DEL PERÚ', cursorY, 14, 'bold');
  cursorY += 8;
  addCenteredText('MINISTERIO DE JUSTICIA Y DERECHOS HUMANOS', cursorY, 12, 'bold');
  cursorY += 8;
  addCenteredText('CENTRO DE CONCILIACIÓN EXTRAJUDICIAL "BRIDGELAW"', cursorY, 12, 'bold');
  cursorY += 15;

  // Título del Documento
  addCenteredText('SOLICITUD DE CONCILIACIÓN EXTRAJUDICIAL', cursorY, 16, 'bold');
  cursorY += 8;
  addCenteredText(`EXPEDIENTE N° ${expediente.numero || expediente.id.substring(0, 8)}`, cursorY, 12, 'normal');
  cursorY += 15;

  // Fecha y Lugar
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const fechaStr = new Date(expediente.fechaCreacion).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(`Lima, ${fechaStr}`, marginLeft, cursorY);
  cursorY += 15;

  // I. Datos del Solicitante
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('I. DATOS DEL SOLICITANTE', marginLeft, cursorY);
  cursorY += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombres y Apellidos: ${expediente.solicitanteNom}`, marginLeft, cursorY);
  cursorY += 6;
  doc.text(`Documento de Identidad (DNI): ${expediente.solicitanteDni}`, marginLeft, cursorY);
  cursorY += 6;
  if (expediente.solicitanteCelular) {
    doc.text(`Celular: ${expediente.solicitanteCelular}`, marginLeft, cursorY);
    cursorY += 6;
  }
  if (expediente.solicitanteEmail) {
    doc.text(`Correo Electrónico: ${expediente.solicitanteEmail}`, marginLeft, cursorY);
    cursorY += 6;
  }
  cursorY += 5;

  // II. Datos del Invitado
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('II. DATOS DEL INVITADO (A CONCILIAR)', marginLeft, cursorY);
  cursorY += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombres y Apellidos: ${expediente.invitadoNom}`, marginLeft, cursorY);
  cursorY += 6;
  doc.text(`Documento de Identidad (DNI): ${expediente.invitadoDni}`, marginLeft, cursorY);
  cursorY += 6;
  if (expediente.invitadoDireccion) {
    doc.text(`Dirección Notificable: ${expediente.invitadoDireccion}`, marginLeft, cursorY);
    cursorY += 6;
  }
  if (expediente.invitadoCelular) {
    doc.text(`Celular de Contacto: ${expediente.invitadoCelular}`, marginLeft, cursorY);
    cursorY += 6;
  }
  cursorY += 5;

  // III. Materia a Conciliar
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('III. MATERIA DE CONCILIACIÓN', marginLeft, cursorY);
  cursorY += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tipo de Materia: ${expediente.materia}`, marginLeft, cursorY);
  cursorY += 15;

  // IV. Hechos
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('IV. DESCRIPCIÓN DE LA CONTROVERSIA (HECHOS)', marginLeft, cursorY);
  cursorY += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const detallesLines = doc.splitTextToSize(expediente.detalles || 'No se proporcionaron detalles adicionales de la controversia.', pageWidth - (marginLeft * 2));
  
  // Añadir lineas y manejar paginación
  detallesLines.forEach((line: string) => {
    if (cursorY > 270) {
      doc.addPage();
      cursorY = 20;
    }
    doc.text(line, marginLeft, cursorY);
    cursorY += 6;
  });
  
  cursorY += 20;
  
  if (cursorY > 240) {
    doc.addPage();
    cursorY = 40;
  }

  // Firma
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 40, cursorY, pageWidth / 2 + 40, cursorY);
  cursorY += 5;
  addCenteredText('FIRMA DEL SOLICITANTE', cursorY, 11, 'bold');
  cursorY += 5;
  addCenteredText(`${expediente.solicitanteNom}`, cursorY, 10, 'normal');
  cursorY += 4;
  addCenteredText(`DNI: ${expediente.solicitanteDni}`, cursorY, 10, 'normal');

  // Descargar PDF
  doc.save(`Solicitud_Conciliacion_${expediente.numero || expediente.id.substring(0, 8)}.pdf`);
};

export const generateActaFinalPDF = (expediente: Expediente, resultado: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 20;
  let cursorY = 20;

  const addCenteredText = (text: string, y: number, fontSize = 12, fontStyle = 'normal') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
    const textOffset = (pageWidth - textWidth) / 2;
    doc.text(text, textOffset, y);
  };

  // Mapeo de Títulos de Resultados
  const titulos: Record<string, string> = {
    'ACUERDO_TOTAL': 'ACTA DE CONCILIACIÓN CON ACUERDO TOTAL',
    'ACUERDO_PARCIAL': 'ACTA DE CONCILIACIÓN CON ACUERDO PARCIAL',
    'FALTA_ACUERDO': 'ACTA DE CONCILIACIÓN POR FALTA DE ACUERDO',
    'INASISTENCIA_UNA_PARTE': 'ACTA DE CONCILIACIÓN POR INASISTENCIA DE UNA DE LAS PARTES',
    'INASISTENCIA_AMBAS_PARTES': 'ACTA DE CONCILIACIÓN POR INASISTENCIA DE AMBAS PARTES',
  };

  const tituloActa = titulos[resultado] || 'ACTA DE CONCILIACIÓN EXTRAJUDICIAL';

  // Encabezado Oficial
  addCenteredText('REPÚBLICA DEL PERÚ', cursorY, 14, 'bold');
  cursorY += 8;
  addCenteredText('MINISTERIO DE JUSTICIA Y DERECHOS HUMANOS', cursorY, 12, 'bold');
  cursorY += 8;
  addCenteredText('CENTRO DE CONCILIACIÓN EXTRAJUDICIAL "BRIDGELAW"', cursorY, 12, 'bold');
  cursorY += 15;

  // Título del Documento
  addCenteredText(tituloActa, cursorY, 14, 'bold');
  cursorY += 8;
  addCenteredText(`EXPEDIENTE N° ${expediente.numero || expediente.id.substring(0, 8)}`, cursorY, 12, 'normal');
  cursorY += 15;

  // Introducción
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const fechaAudienciaStr = expediente.fechaAudiencia 
    ? new Date(expediente.fechaAudiencia).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' }) 
    : '____________________';

  const introText = `En la ciudad de Lima, a las ${fechaAudienciaStr}, ante mí, Conciliador Extrajudicial del Centro de Conciliación "Bridgelaw", se hicieron presentes:`;
  const introLines = doc.splitTextToSize(introText, pageWidth - (marginLeft * 2));
  doc.text(introLines, marginLeft, cursorY);
  cursorY += (introLines.length * 6) + 5;

  // Partes
  doc.setFont('helvetica', 'bold');
  doc.text('I. IDENTIFICACIÓN DE LAS PARTES:', marginLeft, cursorY);
  cursorY += 8;
  doc.setFont('helvetica', 'normal');
  doc.text(`SOLICITANTE: ${expediente.solicitanteNom}, con DNI N° ${expediente.solicitanteDni}`, marginLeft, cursorY);
  cursorY += 6;
  doc.text(`INVITADO: ${expediente.invitadoNom}, con DNI N° ${expediente.invitadoDni}`, marginLeft, cursorY);
  cursorY += 15;

  // Hechos / Materia
  doc.setFont('helvetica', 'bold');
  doc.text('II. HECHOS Y MATERIA A CONCILIAR:', marginLeft, cursorY);
  cursorY += 8;
  doc.setFont('helvetica', 'normal');
  doc.text(`Materia: ${expediente.materia}`, marginLeft, cursorY);
  cursorY += 6;
  const detallesLines = doc.splitTextToSize(expediente.detalles || 'Descripción de los hechos objeto de conciliación.', pageWidth - (marginLeft * 2));
  detallesLines.forEach((line: string) => {
    if (cursorY > 270) { doc.addPage(); cursorY = 20; }
    doc.text(line, marginLeft, cursorY);
    cursorY += 6;
  });
  cursorY += 10;

  // ACUERDOS / RESULTADO
  doc.setFont('helvetica', 'bold');
  if (resultado.includes('ACUERDO')) {
    doc.text('III. ACUERDOS ADOPTADOS:', marginLeft, cursorY);
    cursorY += 10;
    doc.setFont('helvetica', 'italic');
    doc.text('(Espacio reservado para redactar detalladamente los acuerdos...)', marginLeft, cursorY);
    // Dejar gran espacio en blanco
    cursorY += 60;
  } else {
    doc.text('III. CONSTANCIA DE RESULTADO:', marginLeft, cursorY);
    cursorY += 10;
    doc.setFont('helvetica', 'normal');
    let constancia = '';
    if (resultado === 'FALTA_ACUERDO') constancia = 'Se deja constancia que las partes no llegaron a ningún acuerdo respecto a la materia en conflicto tras agotar el diálogo.';
    if (resultado === 'INASISTENCIA_UNA_PARTE') constancia = 'Se deja constancia de la inasistencia de una de las partes a la sesión de conciliación programada.';
    if (resultado === 'INASISTENCIA_AMBAS_PARTES') constancia = 'Se deja constancia de la inasistencia de ambas partes a la sesión de conciliación programada.';
    
    const constanciaLines = doc.splitTextToSize(constancia, pageWidth - (marginLeft * 2));
    doc.text(constanciaLines, marginLeft, cursorY);
    cursorY += (constanciaLines.length * 6) + 10;
  }

  // Cierre
  if (cursorY > 200) { doc.addPage(); cursorY = 20; }
  doc.setFont('helvetica', 'normal');
  const cierreText = `Leída que fue la presente acta, las partes manifiestan su conformidad, procediendo a suscribirla y estampar su huella digital en señal de aceptación.`;
  const cierreLines = doc.splitTextToSize(cierreText, pageWidth - (marginLeft * 2));
  doc.text(cierreLines, marginLeft, cursorY);
  cursorY += 40;

  // Firmas
  const firmY = cursorY;
  doc.setLineWidth(0.5);
  // Firma Solicitante
  doc.line(marginLeft, firmY, marginLeft + 60, firmY);
  doc.setFontSize(10);
  doc.text('FIRMA DEL SOLICITANTE', marginLeft + 5, firmY + 5);
  doc.text(`DNI: ${expediente.solicitanteDni}`, marginLeft + 5, firmY + 10);
  
  // Firma Invitado
  doc.line(pageWidth - marginLeft - 60, firmY, pageWidth - marginLeft, firmY);
  doc.text('FIRMA DEL INVITADO', pageWidth - marginLeft - 55, firmY + 5);
  doc.text(`DNI: ${expediente.invitadoDni}`, pageWidth - marginLeft - 55, firmY + 10);

  cursorY += 40;
  // Firma Conciliador (Centro)
  const centroX = (pageWidth / 2);
  doc.line(centroX - 30, cursorY, centroX + 30, cursorY);
  addCenteredText('CONCILIADOR EXTRAJUDICIAL', cursorY + 5, 10, 'bold');
  addCenteredText('Centro de Conciliación Bridgelaw', cursorY + 10, 10, 'normal');

  doc.save(`Acta_Final_Conciliacion_${expediente.numero || expediente.id.substring(0, 8)}.pdf`);
};
