const QRCode = require('qrcode');

QRCode.toFile(
  'C:/Users/anthony/.gemini/antigravity/brain/c336ec85-5382-4cf2-ad07-fd7b812117ea/app_qr.png',
  'https://attractive-reverence-production-6949.up.railway.app/',
  {
    color: {
      dark: '#000000',
      light: '#ffffff'
    },
    width: 300,
    margin: 2
  },
  function (err) {
    if (err) throw err;
    console.log('QR Code generated!');
  }
);
