/**
 * Local Test Report Generator
 * Tổng hợp kết quả kiểm thử chạy tại máy Local và gửi báo cáo về Telegram
 * Kèm nút Duyệt & Push Git (nếu PASS) hoặc chặn Push (nếu FAIL/BUG).
 */

const { parseArgs, sendTelegramMessage, buildInlineKeyboard, getActionButtons } = require('../utils');

const argv = parseArgs(process.argv.slice(2));

const ticket = argv.ticket || 'SCRUM-TEST';
const pass = parseInt(argv.pass, 10) || 0;
const fail = parseInt(argv.fail, 10) || 0;
const bugs = parseInt(argv.bugs, 10) || 0;
const duration = argv.duration || '0';
const files = (argv.files || '').split(',').map(f => f.trim()).filter(Boolean);

async function sendReport() {
  const isPassed = fail === 0;
  const displayFail = fail + bugs;
  const statusEmoji = isPassed ? '✅' : '❌';
  const statusText = isPassed 
    ? '<b>ĐẠT TIÊU CHUẨN (Definition of Done)</b>' 
    : '<b>CHƯA ĐẠT (Cần kiểm tra trước khi push)</b>';

  const fileListStr = files.length > 0 
    ? files.map(f => `  • <code>${f}</code>`).join('\n')
    : '  • <i>(Không có file liệt kê)</i>';

  const isPoorQuality = pass === 0 || (pass === 1 && bugs > 0);

  let msg = `📊 <b>[KẾT QUẢ TEST LOCAL: ${ticket}]</b>\n\n` +
            `✅ <b>Passed:</b> ${pass} tests\n` +
            `❌ <b>Failed:</b> ${displayFail} tests\n` +
            `🐞 <b>Bugs ghi nhận:</b> ${bugs}\n` +
            `⏱ <b>Thời gian thực thi:</b> ${duration}s\n\n` +
            `📁 <b>Mã nguồn cập nhật:</b>\n${fileListStr}\n\n`;

  if (!isPoorQuality) {
    msg += `⚖️ <b>Chất lượng:</b> ${statusEmoji} ${statusText}\n`;
  }

  if (bugs > 0) {
    msg += `ℹ️ <i>(Đã cho <code>test.fixme()</code> các code test failed)</i>\n`;
  }

  msg += `\n`;

  if (!isPassed) {
    msg += `🛑 <b>CHẶN PUSH GIT:</b> <i>Kiểm thử chưa đạt chuẩn (có test FAILED hoặc Bug ứng dụng). Hệ thống từ chối đẩy code lên Git để bảo vệ nhánh chính. Hãy kiểm tra và khắc phục lỗi tại local!</i>`;
  }

  // Use standardized action buttons
  const isRetest = argv.retest === 'true' || argv.retest === true;
  const actionButtons = getActionButtons(ticket, isPassed, isRetest);
  const inlineKeyboard = buildInlineKeyboard(actionButtons);

  try {
    const res = await sendTelegramMessage(msg, inlineKeyboard);
    if (res && res.ok) {
      console.log('[OK] Đã gửi báo cáo kết quả kiểm thử về Telegram Bot thành công.');
    }
  } catch (err) {
    console.error('[ERROR] Lỗi khi gửi báo cáo Telegram:', err.message);
  }
}

sendReport();
