/**
 * Pipeline Step Notifier
 * Gửi thông báo tiến trình từng bước của E2E Automation về Telegram Bot.
 */

const { parseArgs, sendTelegramMessage } = require('../utils');

const argv = parseArgs(process.argv.slice(2));

const ticket = argv.ticket || 'SCRUM';
const step = argv.step || '1';
let title = argv.title || '';
let detail = argv.detail || '';

// Fallback nếu truyền chuỗi tự do
if (!title && argv._ && argv._.length > 0) {
  detail = argv._.join(' ');
}

const msg = `🤖 <b>[E2E PIPELINE: ${ticket}]</b>\n\n` +
            `📌 <b>Bước ${step}: ${title || 'Cập nhật tiến trình'}</b>\n` +
            (detail ? `• ${detail}` : '');

sendTelegramMessage(msg)
  .then((res) => {
    if (res && res.ok) {
      console.log(`[OK] Đã gửi thông báo Bước ${step} có dấu đầy đủ.`);
    }
  })
  .catch((err) => {
    console.error('[NOTIFY ERROR]', err.message);
  });
