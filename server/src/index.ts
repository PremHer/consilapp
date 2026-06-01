import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
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
    const { materia, solicitanteNom, solicitanteDni, invitadoNom, invitadoDni } = req.body;
    
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
        estado: 'RECIBIDO',
        urgency: 'NORMAL'
      }
    });
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
    res.json(expediente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el estado' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor de Conciliación corriendo en el puerto ${PORT}`);
});
