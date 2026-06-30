import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Expediente } from '../store/useStore';

// Paleta de colores de Bridgelaw para el PDF
const PRIMARY_COLOR: [number, number, number] = [19, 84, 59];     // #13543b (Verde Esmeralda Primario)
const SECONDARY_COLOR: [number, number, number] = [184, 144, 71]; // #b89047 (Dorado Secundario)
const TEXT_COLOR: [number, number, number] = [25, 28, 26];        // #191c1a (Texto Oscuro)
const BORDER_COLOR: [number, number, number] = [191, 201, 192];   // #bfc9c0 (Bordes)
const LIGHT_BG: [number, number, number] = [241, 243, 240];       // #f1f3f0 (Fondo Claro)

// Helper para dibujar el encabezado de página oficial
const drawPageHeader = (doc: jsPDF, title: string, subTitle?: string) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Dibujar franja decorativa roja superior
  doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.rect(0, 0, pageWidth, 8, 'F');
  
  // Línea dorada sutil abajo de la franja
  doc.setFillColor(SECONDARY_COLOR[0], SECONDARY_COLOR[1], SECONDARY_COLOR[2]);
  doc.rect(0, 8, pageWidth, 2, 'F');

  // Textos oficiales centrados
  doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('REPÚBLICA DEL PERÚ', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('MINISTERIO DE JUSTICIA Y DERECHOS HUMANOS', pageWidth / 2, 24, { align: 'center' });
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text('CENTRO DE CONCILIACIÓN EXTRAJUDICIAL "BRIDGELAW"', pageWidth / 2, 30, { align: 'center' });
  
  // Línea divisora
  doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
  doc.setLineWidth(0.5);
  doc.line(20, 34, pageWidth - 20, 34);

  // Título del documento
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(title.toUpperCase(), pageWidth / 2, 43, { align: 'center' });

  if (subTitle) {
    doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(subTitle, pageWidth / 2, 49, { align: 'center' });
  }

  return 58; // Siguiente posición Y libre
};

// Helper para dibujar el pie de página
const drawPageFooter = (doc: jsPDF, pageNumber: number, totalPages: number) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
  doc.setLineWidth(0.5);
  doc.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(110, 110, 110);
  doc.text('Documento oficial emitido por el sistema de conciliación digital Bridgelaw.', 20, pageHeight - 10);
  doc.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
};

export const generateSolicitudPDF = (expediente: Expediente) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let cursorY = drawPageHeader(
    doc, 
    'Solicitud de Conciliación Extrajudicial', 
    `EXPEDIENTE N° ${expediente.numero || expediente.id.substring(0, 8)}`
  );

  // Fecha y Lugar
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
  const fechaStr = new Date(expediente.fechaCreacion).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(`Lugar y Fecha: Lima, ${fechaStr}`, 20, cursorY);
  cursorY += 8;

  // I. Datos del Solicitante (usando autoTable para formato profesional de grilla)
  autoTable(doc, {
    startY: cursorY,
    head: [[{ content: 'I. DATOS DEL SOLICITANTE', colSpan: 2 }]],
    body: [
      ['Nombres y Apellidos:', expediente.solicitanteNom],
      ['Documento de Identidad:', `DNI N° ${expediente.solicitanteDni}`],
      ['Teléfono / Celular:', expediente.solicitanteCelular || 'No registrado'],
      ['Correo Electrónico:', expediente.solicitanteEmail || 'No registrado']
    ],
    theme: 'plain',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: TEXT_COLOR,
      cellPadding: 4
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, fillColor: LIGHT_BG },
      1: { cellWidth: 120 }
    },
    tableLineColor: BORDER_COLOR,
    tableLineWidth: 0.5,
    styles: {
      lineColor: BORDER_COLOR,
      lineWidth: 0.5
    }
  });

  cursorY = (doc as any).lastAutoTable.finalY + 8;

  // II. Datos del Invitado
  autoTable(doc, {
    startY: cursorY,
    head: [[{ content: 'II. DATOS DEL INVITADO (A CONCILIAR)', colSpan: 2 }]],
    body: [
      ['Nombres y Apellidos:', expediente.invitadoNom],
      ['Documento de Identidad:', `DNI N° ${expediente.invitadoDni}`],
      ['Dirección Notificable:', expediente.invitadoDireccion || 'No registrada'],
      ['Celular de Contacto:', expediente.invitadoCelular || 'No registrado']
    ],
    theme: 'plain',
    headStyles: {
      fillColor: SECONDARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: TEXT_COLOR,
      cellPadding: 4
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, fillColor: LIGHT_BG },
      1: { cellWidth: 120 }
    },
    tableLineColor: BORDER_COLOR,
    tableLineWidth: 0.5,
    styles: {
      lineColor: BORDER_COLOR,
      lineWidth: 0.5
    }
  });

  cursorY = (doc as any).lastAutoTable.finalY + 8;

  // III. Materia a Conciliar
  autoTable(doc, {
    startY: cursorY,
    head: [[{ content: 'III. MATERIA DE CONCILIACIÓN', colSpan: 2 }]],
    body: [
      ['Tipo de Materia:', expediente.materia]
    ],
    theme: 'plain',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: TEXT_COLOR,
      cellPadding: 5
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, fillColor: LIGHT_BG },
      1: { cellWidth: 120, fontStyle: 'bold', textColor: PRIMARY_COLOR }
    },
    tableLineColor: BORDER_COLOR,
    tableLineWidth: 0.5,
    styles: {
      lineColor: BORDER_COLOR,
      lineWidth: 0.5
    }
  });

  cursorY = (doc as any).lastAutoTable.finalY + 8;

  // IV. Hechos / Detalles
  autoTable(doc, {
    startY: cursorY,
    head: [['IV. DESCRIPCIÓN DE LA CONTROVERSIA (HECHOS)']],
    body: [
      [expediente.detalles || 'No se proporcionaron detalles adicionales de la controversia.']
    ],
    theme: 'plain',
    headStyles: {
      fillColor: SECONDARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9.5,
      textColor: TEXT_COLOR,
      cellPadding: 8
    },
    tableLineColor: BORDER_COLOR,
    tableLineWidth: 0.5,
    styles: {
      lineColor: BORDER_COLOR,
      lineWidth: 0.5
    }
  });

  cursorY = (doc as any).lastAutoTable.finalY + 25;

  // Si queda poco espacio para la firma, pasamos a una nueva página
  if (cursorY > 235) {
    doc.addPage();
    cursorY = drawPageHeader(doc, 'Solicitud de Conciliación Extrajudicial', `EXPEDIENTE N° ${expediente.numero || expediente.id.substring(0, 8)}`) + 20;
  }

  // Firmas y Huella Digital (Estructurado profesional)
  const blockX = pageWidth / 2;
  
  // Línea de firma
  doc.setDrawColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
  doc.setLineWidth(0.5);
  doc.line(blockX - 50, cursorY, blockX + 50, cursorY);
  
  // Información de firma
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('FIRMA DEL SOLICITANTE', blockX, cursorY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(expediente.solicitanteNom, blockX, cursorY + 9, { align: 'center' });
  doc.text(`DNI: ${expediente.solicitanteDni}`, blockX, cursorY + 13, { align: 'center' });

  // Recuadro de Huella Digital al costado de la firma
  doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
  doc.rect(blockX + 58, cursorY - 18, 20, 25);
  doc.setFontSize(7);
  doc.text('HUELLA', blockX + 68, cursorY + 10, { align: 'center' });

  // Dibujar pies de página en todas las páginas generadas
  const pagesCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pagesCount; i++) {
    doc.setPage(i);
    drawPageFooter(doc, i, pagesCount);
  }

  // Guardar PDF
  doc.save(`Solicitud_Conciliacion_${expediente.numero || expediente.id.substring(0, 8)}.pdf`);
};

export const generateActaFinalPDF = (expediente: Expediente, resultado: string, inasistente: string = 'INVITADO', sesion: number = 1) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Identificar el tipo de documento según el resultado
  let tituloActa = 'ACTA DE CONCILIACIÓN';
  let subtituloResultado = 'AUDIENCIA DE CONCILIACIÓN';
  
  if (resultado === 'ACUERDO_TOTAL') {
    tituloActa = 'Acta de Conciliación con Acuerdo Total';
    subtituloResultado = 'ACUERDO TOTAL';
  } else if (resultado === 'ACUERDO_PARCIAL') {
    tituloActa = 'Acta de Conciliación con Acuerdo Parcial';
    subtituloResultado = 'SUSPENSIÓN DE AUDIENCIA';
  } else if (resultado === 'FALTA_ACUERDO') {
    tituloActa = 'Acta por Falta de Acuerdo';
    subtituloResultado = 'FALTA DE ACUERDO';
  } else if (resultado === 'INASISTENCIA_UNA_PARTE') {
    if (sesion === 1) {
      tituloActa = `Constancia de Inasistencia - 1ra Invitación`;
      subtituloResultado = `INASISTENCIA DEL ${inasistente}`;
    } else {
      tituloActa = 'Acta por Inasistencia de una de las partes';
      subtituloResultado = '2DA INVITACIÓN - FRUSTRADA';
    }
  } else if (resultado === 'INASISTENCIA_AMBAS_PARTES') {
    tituloActa = 'Acta por Inasistencia de Ambas Partes';
    subtituloResultado = 'INASISTENCIA DOBLE';
  }

  let cursorY = drawPageHeader(
    doc, 
    tituloActa, 
    `EXPEDIENTE N° ${expediente.numero || expediente.id.substring(0, 8)}`
  );

  // Cuerpo del acta / Narración formal
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);

  const fechaAudienciaStr = expediente.fechaAudiencia 
    ? new Date(expediente.fechaAudiencia).toLocaleDateString('es-PE', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }) 
    : '____________________';

  const introText = `En la ciudad de Lima, siendo las ${fechaAudienciaStr}, en las oficinas del Centro de Conciliación Extrajudicial "Bridgelaw", ante mí, el Conciliador formalmente asignado, se da por iniciada la sesión correspondiente a la materia de conciliación, dejando constancia de las siguientes especificaciones técnicas y legales del procedimiento:`;
  const introLines = doc.splitTextToSize(introText, pageWidth - 40);
  doc.text(introLines, 20, cursorY);
  cursorY += (introLines.length * 5) + 6;

  // I. Partes Involucradas (Grilla elegante)
  autoTable(doc, {
    startY: cursorY,
    head: [[{ content: 'I. PARTES DEL PROCEDIMIENTO', colSpan: 2 }]],
    body: [
      ['PARTE SOLICITANTE:', `${expediente.solicitanteNom} (DNI N° ${expediente.solicitanteDni})`],
      ['PARTE INVITADA:', `${expediente.invitadoNom} (DNI N° ${expediente.invitadoDni})`]
    ],
    theme: 'plain',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 9.5,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: TEXT_COLOR,
      cellPadding: 4
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45, fillColor: LIGHT_BG },
      1: { cellWidth: 125 }
    },
    tableLineColor: BORDER_COLOR,
    tableLineWidth: 0.5,
    styles: {
      lineColor: BORDER_COLOR,
      lineWidth: 0.5
    }
  });

  cursorY = (doc as any).lastAutoTable.finalY + 6;

  // II. Materia y Hechos
  autoTable(doc, {
    startY: cursorY,
    head: [[{ content: 'II. MATERIA Y HECHOS EN CONTROVERSIA', colSpan: 2 }]],
    body: [
      ['MATERIA CONCILIAR:', expediente.materia],
      ['DESCRIPCIÓN:', expediente.detalles || 'Descripción general del conflicto objeto del presente trámite de conciliación extrajudicial.']
    ],
    theme: 'plain',
    headStyles: {
      fillColor: SECONDARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 9.5,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: TEXT_COLOR,
      cellPadding: 4
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45, fillColor: LIGHT_BG },
      1: { cellWidth: 125 }
    },
    tableLineColor: BORDER_COLOR,
    tableLineWidth: 0.5,
    styles: {
      lineColor: BORDER_COLOR,
      lineWidth: 0.5
    }
  });

  cursorY = (doc as any).lastAutoTable.finalY + 6;

  // III. Resultado del Proceso
  let constancia = '';
  if (resultado.includes('ACUERDO')) {
    constancia = `Las partes en conflicto, luego de deliberar y de ser asistidas por el conciliador en la búsqueda de soluciones mutuamente satisfactorias, DECLARAN haber arribado a un acuerdo consensuado que se detalla en el presente documento, comprometiéndose a su fiel cumplimiento según la normatividad vigente.`;
  } else {
    if (resultado === 'FALTA_ACUERDO') {
      constancia = 'Se deja formal constancia que las partes participaron activamente en el diálogo conciliatorio, pero no lograron llegar a un punto de encuentro o acuerdo respecto a las materias en conflicto tras finalizar la audiencia.';
    } else if (resultado === 'INASISTENCIA_UNA_PARTE') {
      const nombreAusente = inasistente === 'SOLICITANTE' ? expediente.solicitanteNom : expediente.invitadoNom;
      const rolAusente = inasistente === 'SOLICITANTE' ? 'SOLICITANTE' : 'INVITADO(A)';
      const nombrePresente = inasistente === 'SOLICITANTE' ? expediente.invitadoNom : expediente.solicitanteNom;
      const rolPresente = inasistente === 'SOLICITANTE' ? 'INVITADO(A)' : 'SOLICITANTE';
      
      constancia = `Se deja constancia oficial que, habiendo transcurrido el plazo de tolerancia correspondiente a la citación formal, compareció el ${rolPresente} don(ña) ${nombrePresente}; no habiendo asistido a la misma el ${rolAusente} don(ña) ${nombreAusente}, a pesar de estar debidamente notificado(a) en el domicilio correspondiente.`;
    } else if (resultado === 'INASISTENCIA_AMBAS_PARTES') {
      constancia = 'Se deja constancia oficial de la inasistencia e incomparecencia de ambas partes involucradas al procedimiento de conciliación programado, a pesar de estar debidamente notificadas conforme a Ley.';
    }
  }

  autoTable(doc, {
    startY: cursorY,
    head: [[{ content: `III. RESULTADO: ${subtituloResultado}`, colSpan: 2 }]],
    body: [
      ['SITUACIÓN LEGAL:', resultado.includes('ACUERDO') ? 'AUDIENCIA EXITOSA (CON ACUERDO)' : 'AUDIENCIA FRUSTRADA / CONCLUIDA SIN ACUERDO'],
      ['DECLARACIÓN / HECHOS:', constancia]
    ],
    theme: 'plain',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 9.5,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: TEXT_COLOR,
      cellPadding: 4
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45, fillColor: LIGHT_BG },
      1: { cellWidth: 125 }
    },
    tableLineColor: BORDER_COLOR,
    tableLineWidth: 0.5,
    styles: {
      lineColor: BORDER_COLOR,
      lineWidth: 0.5
    }
  });

  cursorY = (doc as any).lastAutoTable.finalY + 8;

  // Cierre de Acta
  const cierreText = `Leída que fue la presente acta de conciliación, las partes manifestaron su plena conformidad con lo aquí establecido, procediendo a firmar de manera formal y estampar su huella dactilar derecha en señal de conformidad ante el conciliador que autoriza y da fe.`;
  const cierreLines = doc.splitTextToSize(cierreText, pageWidth - 40);
  
  if (cursorY > 210) {
    doc.addPage();
    cursorY = drawPageHeader(doc, tituloActa, `EXPEDIENTE N° ${expediente.numero || expediente.id.substring(0, 8)}`) + 10;
  }
  
  doc.text(cierreLines, 20, cursorY);
  cursorY += (cierreLines.length * 5) + 15;

  // Bloque de Firmas Solicitante e Invitado
  if (cursorY > 220) {
    doc.addPage();
    cursorY = drawPageHeader(doc, tituloActa, `EXPEDIENTE N° ${expediente.numero || expediente.id.substring(0, 8)}`) + 20;
  }

  const firmY = cursorY;
  doc.setDrawColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
  doc.setLineWidth(0.5);

  // Firma Solicitante (Izquierda)
  doc.line(20, firmY, 75, firmY);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('FIRMA DEL SOLICITANTE', 20, firmY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(expediente.solicitanteNom, 20, firmY + 9);
  doc.text(`DNI: ${expediente.solicitanteDni}`, 20, firmY + 13);
  doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
  doc.rect(80, firmY - 15, 12, 17); // Huella Solicitante
  doc.setFontSize(6);
  doc.text('HUELLA', 86, firmY + 5, { align: 'center' });

  // Firma Invitado (Derecha)
  doc.setDrawColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
  doc.line(115, firmY, 170, firmY);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('FIRMA DEL INVITADO', 115, firmY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(expediente.invitadoNom, 115, firmY + 9);
  doc.text(`DNI: ${expediente.invitadoDni}`, 115, firmY + 13);
  doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
  doc.rect(175, firmY - 15, 12, 17); // Huella Invitado
  doc.setFontSize(6);
  doc.text('HUELLA', 181, firmY + 5, { align: 'center' });

  cursorY += 28;

  // Firma del Conciliador (Abajo al centro)
  if (cursorY > 240) {
    doc.addPage();
    cursorY = drawPageHeader(doc, tituloActa, `EXPEDIENTE N° ${expediente.numero || expediente.id.substring(0, 8)}`) + 30;
  }

  const centroX = pageWidth / 2;
  doc.setDrawColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
  doc.line(centroX - 35, cursorY, centroX + 35, cursorY);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CONCILIADOR EXTRAJUDICIAL', centroX, cursorY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Centro de Conciliación Bridgelaw', centroX, cursorY + 9, { align: 'center' });

  // Numerar páginas del documento al final
  const pagesCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pagesCount; i++) {
    doc.setPage(i);
    drawPageFooter(doc, i, pagesCount);
  }

  doc.save(`Acta_Final_Conciliacion_${expediente.numero || expediente.id.substring(0, 8)}.pdf`);
};
