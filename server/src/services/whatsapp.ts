import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import pino from 'pino';

// Variables globales para la conexión del socket
let sock: ReturnType<typeof makeWASocket> | null = null;
let isConnected = false;

export async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info');
  
  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, // Desactivado por defecto de baileys porque usaremos qrcode-terminal
    logger: pino({ level: 'silent' }) // Silenciamos logs excesivos
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      console.log('🤖 Escanea este código QR con tu WhatsApp para vincular el bot de conciliación:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Conexión cerrada. Intentando reconectar:', shouldReconnect);
      isConnected = false;
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === 'open') {
      console.log('✅ Bot de WhatsApp conectado y listo para enviar invitaciones.');
      isConnected = true;
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

export async function sendWhatsAppMessage(phone: string, text: string) {
  if (!isConnected || !sock) {
    console.error('⚠️ No se pudo enviar el mensaje: WhatsApp bot no está conectado.');
    return false;
  }
  
  try {
    // Formatear número para Perú (+51)
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.length === 9) {
      formattedPhone = `51${formattedPhone}`;
    }
    
    const id = `${formattedPhone}@s.whatsapp.net`;
    await sock.sendMessage(id, { text });
    console.log(`✉️ Mensaje enviado exitosamente a ${formattedPhone}`);
    return true;
  } catch (error) {
    console.error('❌ Error enviando mensaje de WhatsApp:', error);
    return false;
  }
}
