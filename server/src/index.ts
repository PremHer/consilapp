import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { connectToWhatsApp, sendWhatsAppMessage } from './services/whatsapp';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});
export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_bridgelaw_2024';

// Seeding: Crear usuario admin si no existe
async function seedAdmin() {
  const adminExists = await prisma.usuario.findUnique({
    where: { email: 'admin@bridgelaw.com' }
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.usuario.create({
      data: {
        email: 'admin@bridgelaw.com',
        password: hashedPassword,
        nombre: 'Dra. Yocely Tapia',
        rol: 'ADMIN'
      }
    });
    console.log('Usuario administrador creado con éxito.');
  }
}

seedAdmin().catch(console.error);

// Endpoint de Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isPasswordValid = await bcrypt.compare(password, usuario.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

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

// Obtener un solo expediente por número para la vista pública
app.get('/api/expedientes/buscar/:numero', async (req, res) => {
  try {
    // El frontend nos enviará el número sin el # (ej. 2024-028)
    const numero = `#${req.params.numero}`;
    const expediente = await prisma.expediente.findFirst({
      where: { numero }
    });
    
    if (!expediente) {
      return res.status(404).json({ error: 'Expediente no encontrado' });
    }
    
    res.json(expediente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al buscar el expediente' });
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
      const baseUrl = process.env.FRONTEND_URL || 'https://attractive-reverence-production-6949.up.railway.app';
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
        response: "🤖 *Aviso de Sistema:* La Inteligencia Artificial no está conectada (Falta GEMINI_API_KEY en Railway). Configúrala para obtener respuestas legales reales. Por ahora te recomiendo llenar tu solicitud de conciliación directamente.",
        isConciliable: true,
        categoria: "OTRO_CIVIL"
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });
    
    // System prompt para actuar como experto en conciliación peruana y retornar JSON
    const systemInstruction = `Eres un abogado conciliador experto en Perú, encargado del 'Triaje Legal'. Tu misión es orientar al ciudadano si su caso es conciliable de manera MUY empática y sencilla.
Debes responder en JSON estricto con esta estructura:
{
  "isConciliable": boolean,
  "categoria": "ALIMENTOS" | "VISITAS_TENENCIA" | "DESALOJO" | "DEUDAS" | "OTRO_CIVIL" | "OTRO_FAMILIA" | "NO_CONCILIABLE",
  "response": "Explicación en lenguaje MUY sencillo, amigable y empático (máximo 80 palabras). Usa párrafos cortos separados por dobles saltos de línea. Usa emojis para hacerlo amigable. Usa viñetas (•) si debes listar requisitos. Usa negritas **texto** para resaltar lo más importante. Debe ser facilísimo de leer para cualquier persona de cualquier nivel educativo."
}`;
    
    const chat = model.startChat({
      history: history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessage(systemInstruction + "\n\nPregunta del usuario: " + message);
    const jsonStr = result.response.text();
    const data = JSON.parse(jsonStr);
    
    res.json({ 
      response: data.response, 
      isConciliable: data.isConciliable 
    });
  } catch (error: any) {
    console.error("Error en AI Chat:", error);
    res.status(500).json({ error: error?.message || 'Error procesando el chat' });
  }
});

// Endpoint de emergencia para limpiar sesión corrupta de WhatsApp
app.get('/api/clear-session', async (req, res) => {
  try {
    res.send('✅ Ejecutando limpieza de WhatsApp... En unos segundos revisa los logs en Railway para escanear el código QR.');
    const { forceClearSession } = require('./services/whatsapp');
    setTimeout(() => forceClearSession(), 500);
  } catch (error) {
    res.status(500).send('Error borrando la sesión');
  }
});


const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor de Conciliación corriendo en el puerto ${PORT}`);
  connectToWhatsApp(); // Iniciar bot
});
