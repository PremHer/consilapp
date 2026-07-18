const { execSync } = require('child_process');

console.log('🔄 Verificando conexión y configuración de Base de Datos...');

if (process.env.DATABASE_URL) {
  try {
    console.log('📦 DATABASE_URL detectada. Sincronizando esquema con Prisma...');
    execSync('npx --yes prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('✅ Sincronización con la base de datos completada exitosamente.');
  } catch (error) {
    console.warn('⚠️ No se pudo conectar o sincronizar con la base de datos Prisma.');
    console.warn('⚠️ El servidor arrancará en modo tolerante a fallos para que la IA y la interfaz web sigan funcionando sin interrupciones.');
  }
} else {
  console.warn('⚠️ DATABASE_URL no se encuentra en las variables de entorno.');
  console.warn('⚠️ Saltando sincronización de base de datos. El servidor arrancará sin conexión a la base de datos para que la IA y la interfaz web funcionen normalmente.');
}
