const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const TG_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TG_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TG_BOT_TOKEN || !TG_CHAT_ID) {
  process.exit(0);
}

const args = process.argv.slice(2);
let ticket = 'SCRUM';
let step = '1';
let title = '';
let detail = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--ticket') ticket = args[i + 1];
  if (args[i] === '--step') step = args[i + 1];
  if (args[i] === '--title') title = args[i + 1];
  if (args[i] === '--detail') detail = args[i + 1];
}

// Fallback nếu truyền chuỗi tự do
if (!title && args.length > 0) {
  detail = args.join(' ');
}

let msg = `🤖 <b>[E2E PIPELINE: ${ticket}]</b>\n\n` +
          `📌 <b>Bước ${step}: ${title || 'Cập nhật tiến trình'}</b>\n` +
          (detail ? `• ${detail}` : '');

axios.post(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
  chat_id: TG_CHAT_ID,
  text: msg,
  parse_mode: 'HTML'
}).then(() => {
  console.log(`[OK] Đã gửi thông báo Bước ${step} có dấu đầy đủ.`);
}).catch(err => {
  console.error('[NOTIFY ERROR]', err.message);
});
