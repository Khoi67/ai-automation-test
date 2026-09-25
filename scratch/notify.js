const https = require('https');
require('dotenv').config();

const msg = process.argv[2] || 'Ping from Agent';
const chatId = process.env.TELEGRAM_CHAT_ID || 'your-telegram-chat-id';
const data = JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'HTML' });
const req = https.request({
  hostname: 'api.telegram.org',
  path: '/bot' + process.env.TELEGRAM_BOT_TOKEN + '/sendMessage',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
}, res => { let b = ''; res.on('data', c => b += c); res.on('end', () => console.log(b)); });
req.write(data);
req.end();
