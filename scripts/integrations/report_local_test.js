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

  const buttons = [];

  if (isPassed) {
    msg += `👉 <i>Toàn bộ kiểm thử đã ĐẠT chuẩn Definition of Done. Nhấn nút bên dưới để duyệt và tự động Push code lên GitHub:</i>`;
    buttons.push([
      { text: `🚀 Duyệt & Push Git (${ticket})`, callback_data: `confirm_push:${ticket}` }
    ]);
  } else {
    msg += `🛑 <b>CHẶN PUSH GIT:</b> <i>Kiểm thử chưa đạt chuẩn (có test FAILED hoặc Bug ứng dụng). Hệ thống từ chối đẩy code lên Git để bảo vệ nhánh chính. Hãy kiểm tra và khắc phục lỗi tại local!</i>`;
  }

  buttons.push([
    { text: `🔄 Chạy lại Test Local (${ticket})`, callback_data: `dev:${ticket}` }
  ]);
  buttons.push([
    { text: `📋 Xem danh sách User Story`, callback_data: `nav_stories` }
  ]);

  const inlineKeyboard = {
    inline_keyboard: buttons
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
