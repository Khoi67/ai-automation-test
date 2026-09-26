const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const TG_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TG_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TG_BOT_TOKEN || !TG_CHAT_ID) {
  console.error('[ERROR] Thiếu TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID trong .env');
  process.exit(1);
}

// Parse CLI args
const args = process.argv.slice(2);
let ticket = 'SCRUM-TEST';
let pass = 0;
let fail = 0;
let bugs = 0;
let duration = '0';
let files = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--ticket') ticket = args[i + 1];
  if (args[i] === '--pass') pass = parseInt(args[i + 1], 10) || 0;
  if (args[i] === '--fail') fail = parseInt(args[i + 1], 10) || 0;
  if (args[i] === '--bugs') bugs = parseInt(args[i + 1], 10) || 0;
  if (args[i] === '--duration') duration = args[i + 1];
  if (args[i] === '--files') files = (args[i + 1] || '').split(',').map(f => f.trim()).filter(Boolean);
}

async function sendReport() {
  const isPassed = fail === 0;
  const statusEmoji = isPassed ? '✅' : '❌';
  const statusText = isPassed 
    ? '<b>ĐẠT TIÊU CHUẨN (Definition of Done)</b>' 
    : '<b>CHƯA ĐẠT (Cần kiểm tra trước khi push)</b>';

  let fileListStr = files.length > 0 
    ? files.map(f => `  • <code>${f}</code>`).join('\n')
    : '  • <i>(Không có file liệt kê)</i>';

  let msg = `📊 <b>[KẾT QUẢ TEST LOCAL: ${ticket}]</b>\n\n` +
            `✅ <b>Passed:</b> ${pass} tests\n` +
            `❌ <b>Failed:</b> ${fail} tests\n` +
            `🐞 <b>Bugs ghi nhận:</b> ${bugs}\n` +
            `⏱ <b>Thời gian thực thi:</b> ${duration}s\n\n` +
            `📁 <b>Mã nguồn cập nhật:</b>\n${fileListStr}\n\n` +
            `⚖️ <b>Chất lượng:</b> ${statusEmoji} ${statusText}\n\n`;

  if (isPassed) {
    msg += `👉 <i>Kết quả kiểm thử đã sẵn sàng. Nhấn nút bên dưới để duyệt và tự động Push code lên GitHub:</i>`;
  } else {
    msg += `⚠️ <i>Vẫn còn test case bị lỗi hoặc Bug ứng dụng. Vui lòng cân nhắc kỹ trước khi duyệt Push!</i>`;
  }

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: `🚀 Duyệt & Push Git (${ticket})`, callback_data: `confirm_push:${ticket}` }
      ],
      [
        { text: `🔄 Chạy lại Test Local`, callback_data: `dev:${ticket}` }
      ]
    ]
  };

  try {
    const res = await axios.post(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
      chat_id: TG_CHAT_ID,
      text: msg,
      parse_mode: 'HTML',
      reply_markup: inlineKeyboard
    });
    console.log('[OK] Đã gửi báo cáo kết quả kiểm thử về Telegram Bot thành công.');
  } catch (err) {
    console.error('[ERROR] Lỗi khi gửi báo cáo Telegram:', err.response?.data || err.message);
  }
}

sendReport();
