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
