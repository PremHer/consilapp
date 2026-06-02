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
const prisma = new PrismaClient();

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
    const { materia, solicitanteNom, solicitanteDni, invitadoNom, invitadoDni, invitadoCelular } = req.body;
    
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
      const msj = `🏛️ *Centro de Conciliación*\nHola ${expediente.invitadoNom}, se le ha generado una invitación a conciliar solicitada por ${expediente.solicitanteNom} sobre la materia de *${expediente.materia}*.\n\nPor favor, contacte con nosotros para coordinar la audiencia. Expediente: ${expediente.numero}`;
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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // System prompt para actuar como experto en conciliación peruana
    const systemInstruction = "Eres un asistente virtual experto en Conciliación Extrajudicial en Perú. Tu objetivo es ayudar a los ciudadanos a saber si su problema se puede resolver por conciliación (pensión de alimentos, régimen de visitas, desalojo, pago de deudas). Sé conciso, amigable y profesional. Si el tema es conciliable, anímalo a usar el formulario para enviar su solicitud.";
    
    const chat = model.startChat({
      history: history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessage(systemInstruction + "\n\nPregunta del usuario: " + message);
    const response = result.response.text();
    
    res.json({ response });
  } catch (error) {
    console.error("Error en AI Chat:", error);
    res.status(500).json({ error: 'Error procesando el chat' });
  }
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor de Conciliación corriendo en el puerto ${PORT}`);
  connectToWhatsApp(); // Iniciar bot
});
