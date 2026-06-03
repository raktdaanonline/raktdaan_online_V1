import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let sock;
let isConnected = false;

export const connectToWhatsApp = async () => {
  const authDir = path.join(__dirname, '..', 'auth_info_baileys');
  const { state, saveCreds } = await useMultiFileAuthState(authDir);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, // We will print it manually
    logger: pino({ level: 'silent' })
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      console.log('====================================================');
      console.log('SCAN THIS QR CODE WITH WHATSAPP TO ENABLE MESSAGING');
      console.log('====================================================');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      isConnected = false;
      console.log('WhatsApp connection closed due to:', lastDisconnect?.error, ', reconnecting:', shouldReconnect);
      if (shouldReconnect) {
        connectToWhatsApp();
      } else {
        console.log('WhatsApp logged out. Please delete auth_info_baileys and restart to scan new QR.');
      }
    } else if (connection === 'open') {
      isConnected = true;
      console.log('WhatsApp connected successfully!');
    }
  });
};

export const getConnectionStatus = () => isConnected;

export const sendMessage = async (phone, message) => {
  if (!sock || !isConnected) {
    console.error('WhatsApp not connected');
    return false;
  }
  try {
    let jid = phone.toString().replace(/\D/g, '');
    if (!jid.startsWith('91')) jid = '91' + jid;
    jid = jid + '@s.whatsapp.net';

    await sock.sendMessage(jid, { 
      text: message 
    });
    console.log(`Message sent to ${phone}`);
    return true;
  } catch (err) {
    console.error(`Failed to send to ${phone}:`, err.message);
    return false;
  }
};
