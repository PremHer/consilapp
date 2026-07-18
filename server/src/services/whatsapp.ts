import makeWASocket, { DisconnectReason, fetchLatestBaileysVersion, Browsers, initAuthCreds, BufferJSON, proto, AuthenticationState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import { prisma } from '../index';

// Variables globales para la conexión del socket
let sock: ReturnType<typeof makeWASocket> | null = null;
let isConnected = false;
export let latestQrUrl: string | null = null;

export function getWhatsAppStatus() {
  return {
    isConnected,
    qrUrl: latestQrUrl,
    hasDatabase: !!process.env.DATABASE_URL
  };
}

const writeData = async (data: any, id: string) => {
  if (!process.env.DATABASE_URL) return;
  const str = JSON.stringify(data, BufferJSON.replacer);
  await prisma.whatsAppSession.upsert({
    where: { id },
    update: { data: str },
    create: { id, data: str },
  }).catch(() => {});
};

const readData = async (id: string) => {
  if (!process.env.DATABASE_URL) return null;
  try {
    const item = await prisma.whatsAppSession.findUnique({ where: { id } });
    if (item) {
      return JSON.parse(item.data, BufferJSON.reviver);
    }
  } catch (e) {}
  return null;
};

const removeData = async (id: string) => {
  if (!process.env.DATABASE_URL) return;
  await prisma.whatsAppSession.delete({ where: { id } }).catch(() => {});
};

async function usePostgresAuthState(): Promise<{ state: AuthenticationState, saveCreds: () => Promise<void> }> {
  const creds = (await readData('creds')) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data: any = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}`);
              if (type === 'app-state-sync-key' && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            })
          );
          return data;
        },
        set: async (data: any) => {
          const tasks: Promise<any>[] = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const key = `${category}-${id}`;
              if (value) {
                tasks.push(writeData(value, key));
              } else {
                tasks.push(removeData(key));
              }
            }
          }
          await Promise.all(tasks);
        }
      }
    },
    saveCreds: () => writeData(creds, 'creds')
  };
}

export async function connectToWhatsApp() {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️ DATABASE_URL no configurada en variables de entorno. Omitiendo inicio del Bot de WhatsApp.');
    return;
  }
  const { state, saveCreds } = await usePostgresAuthState();
  const { version } = await fetchLatestBaileysVersion();
  
  sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }),
    browser: Browsers.macOS('Desktop')
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qr)}`;
      latestQrUrl = qrUrl;
      console.log('🤖 Escanea este código QR con tu WhatsApp para vincular el bot de conciliación:');
      console.log('🔗 HAZ CLIC AQUÍ PARA VER EL QR: ' + qrUrl);
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const error = lastDisconnect?.error as Boom;
      const statusCode = error?.output?.statusCode;
      const isLoggedOut = statusCode === DisconnectReason.loggedOut;
      
      isConnected = false;
      console.error('⚠️ Conexión de WhatsApp cerrada. Código:', statusCode);

      if (isLoggedOut) {
        latestQrUrl = null;
        console.log('🧹 La sesión fue desvinculada o expiró (401). Limpiando credenciales antiguas...');
        prisma.whatsAppSession.deleteMany().then(() => {
          console.log('🔄 Credenciales eliminadas. Iniciando nueva vinculación para generar código QR...');
          setTimeout(connectToWhatsApp, 2000);
        }).catch(err => {
          console.error('❌ Error al limpiar sesión de WhatsApp en base de datos:', err);
          setTimeout(connectToWhatsApp, 5000);
        });
      } else {
        const delay = statusCode === DisconnectReason.restartRequired ? 1000 : 5000;
        console.log(`🔄 Reintentando conectar en ${delay/1000} segundos...`);
        setTimeout(connectToWhatsApp, delay);
      }
    } else if (connection === 'open') {
      console.log('✅ Bot de WhatsApp conectado y listo para enviar invitaciones.');
      isConnected = true;
      latestQrUrl = null;
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

export async function forceClearSession() {
  console.log("🧹 Limpiando sesión de WhatsApp forzosamente...");
  if (sock) {
    sock.ev.removeAllListeners('creds.update');
    sock.ev.removeAllListeners('connection.update');
  }
  await prisma.whatsAppSession.deleteMany();
  console.log("✅ Base de datos limpiada, reiniciando proceso...");
  process.exit(0);
}
