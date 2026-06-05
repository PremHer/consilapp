import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { connectToWhatsApp, sendWhatsAppMessage } from './services/whatsapp';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});
export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Obtener todos los expedientes
app.get('/api/expedientes', async (req, res) => {
  try {
    const expedientes = await prisma.expediente.findMany({
      orderBy: { fechaCreacion: 'desc' }
    });
    res.json(expedientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los expedientes' });
  }
});

// Crear un nuevo expediente
app.post('/api/expedientes', async (req, res) => {
  try {
    const { materia, solicitanteNom, solicitanteDni, invitadoNom, invitadoDni, invitadoCelular, detalles, solicitanteEmail, solicitanteCelular, invitadoDireccion } = req.body;
    
    // Generar un número de expediente tipo #2024-XXX
    const count = await prisma.expediente.count();
    const numero = `#2024-${(count + 1).toString().padStart(3, '0')}`;

    const expediente = await prisma.expediente.create({
      data: {
        numero,
        materia,
        solicitanteNom,
        solicitanteDni,
        invitadoNom,
        invitadoDni,
        invitadoCelular,
        detalles,
        solicitanteEmail,
        solicitanteCelular,
        invitadoDireccion,
        estado: 'RECIBIDO',
        urgency: 'NORMAL'
      }
    });
    
    // Emitir evento en tiempo real
    io.emit('expediente_creado', expediente);
    
    res.status(201).json(expediente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el expediente' });
  }
});

// Actualizar el estado de un expediente
app.put('/api/expedientes/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    const expediente = await prisma.expediente.update({
      where: { id },
      data: { estado }
    });
    
    // Si el estado pasa a INVITACIONES y hay celular, notificar
    if (estado === 'INVITACIONES' && expediente.invitadoCelular) {
      const baseUrl = process.env.FRONTEND_URL || 'https://consilapp-production.up.railway.app';
      const docLink = `${baseUrl}/seguimiento/${expediente.numero.replace('#', '')}`;
      
      const msj = `🏛️ *BRIDGELAW*\n\nEstimado(a) *${expediente.invitadoNom}*,\n\nLe informamos formalmente que se ha ingresado una solicitud de conciliación donde usted figura como parte invitada. \n\n📋 *Detalles del Expediente:*\n▪️ *N° Expediente:* ${expediente.numero}\n▪️ *Materia:* ${expediente.materia}\n▪️ *Solicitante:* ${expediente.solicitanteNom}\n\n🔗 *Puede revisar los documentos y anexos presentados ingresando al siguiente enlace seguro:*\n${docLink}\n\n⚠️ *Importante:* La conciliación es un mecanismo rápido y económico para resolver conflictos y evitar un juicio judicial. Le rogamos ponerse en contacto con nuestro Centro para coordinar la fecha y hora de la audiencia.\n\nAtentamente,\n*Área de Notificaciones*`;
      await sendWhatsAppMessage(expediente.invitadoCelular, msj);
    }
    
    // Emitir evento en tiempo real
    io.emit('expediente_actualizado', expediente);

    res.json(expediente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el estado' });
  }
});

// Agendar audiencia
app.put('/api/expedientes/:id/audiencia', async (req, res) => {
  try {
    const { id } = req.params;
    const { fechaAudiencia } = req.body;
    
    const expediente = await prisma.expediente.update({
      where: { id },
      data: { fechaAudiencia: new Date(fechaAudiencia) }
    });
    
    // Emitir evento en tiempo real
    io.emit('expediente_actualizado', expediente);

    res.json(expediente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agendar audiencia' });
  }
});

// Endpoint de Chatbot IA (Triaje)
app.post('/api/chat', async (req, res) => {
  try {
    const { history, message } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ 
        response: "🤖 *Aviso de Sistema:* La Inteligencia Artificial no está conectada (Falta GEMINI_API_KEY en Railway). Configúrala para obtener respuestas legales reales. Por ahora te recomiendo llenar tu solicitud de conciliación directamente." 
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // System prompt para actuar como experto en conciliación peruana
    const systemInstruction = "Eres un abogado conciliador experto en Perú, encargado del 'Triaje Legal'. Tu misión es orientar al ciudadano si su caso es conciliable. REGLAS ESTRICTAS DE FORMATO: 1) Tu respuesta debe ser EXTREMADAMENTE BREVE y directa (máximo 100 palabras). 2) NO USES NINGÚN FORMATO MARKDOWN (cero asteriscos, cero negritas, cero numerales). 3) Usa guiones simples (-) para listar los requisitos legales indispensables (ej: - Partida de nacimiento. - Contrato de alquiler). Sé empático pero ve directo al grano.";
    
    const chat = model.startChat({
      history: history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessage(systemInstruction + "\n\nPregunta del usuario: " + message);
    const response = result.response.text();
    
    res.json({ response });
  } catch (error: any) {
    console.error("Error en AI Chat:", error);
    res.status(500).json({ error: error?.message || 'Error procesando el chat' });
  }
});

// Endpoint de emergencia para limpiar sesión corrupta de WhatsApp
app.get('/api/clear-session', async (req, res) => {
  try {
    await prisma.whatsAppSession.deleteMany();
    res.send('✅ Sesión de WhatsApp borrada exitosamente. Por favor, revisa la consola de Railway en unos segundos para escanear el nuevo código QR.');
    // Matamos el proceso para forzar un reinicio del bot y genere un QR nuevo
    setTimeout(() => process.exit(0), 2000);
  } catch (error) {
    res.status(500).send('Error borrando la sesión');
  }
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor de Conciliación corriendo en el puerto ${PORT}`);
  connectToWhatsApp(); // Iniciar bot
});
