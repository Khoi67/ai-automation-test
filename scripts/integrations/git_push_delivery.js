const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const TG_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TG_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Parse args
const args = process.argv.slice(2);
let ticket = '';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--ticket') ticket = args[i + 1];
}

// Fallback to push_trigger.txt if no arg provided
const PUSH_TRIGGER_FILE = path.resolve(__dirname, '../../scratch/push_trigger.txt');
if (!ticket && fs.existsSync(PUSH_TRIGGER_FILE)) {
  ticket = fs.readFileSync(PUSH_TRIGGER_FILE, 'utf8').trim();
}

if (!ticket) {
  console.error('[ERROR] Vui lòng truyền mã ticket: --ticket <JIRA_KEY> hoặc tạo scratch/push_trigger.txt');
  process.exit(1);
}

async function sendTg(msg) {
  if (!TG_BOT_TOKEN || !TG_CHAT_ID) return;
  try {
    await axios.post(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
      chat_id: TG_CHAT_ID,
      text: msg,
      parse_mode: 'HTML'
    });
  } catch (e) {
    console.error('[TG ERROR]', e.message);
  }
}

async function runDelivery() {
  console.log(`[GIT DELIVERY] Bắt đầu bàn giao Git cho ticket: ${ticket}...`);
  await sendTg(`🚀 <b>[BẮT ĐẦU GIT DELIVERY: ${ticket}]</b>\nĐang tiến hành commit & push code lên GitHub...`);

  try {
    // 1. Git add
    console.log('[LOG] Chạy git add .');
    execSync('git add .', { stdio: 'inherit' });

    // 2. Git commit
    const commitMsg = `feat(automation): add test suite and POM for ${ticket}`;
    try {
      execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
      console.log(`[LOG] Đã commit với message: "${commitMsg}"`);
    } catch (e) {
      console.log('[LOG] Không có thay đổi mới để commit (Working tree clean).');
    }

    // 3. Git push
    console.log('[LOG] Chạy git push origin main');
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('[LOG] Đã push code lên GitHub thành công.');

    // 4. Jira transition to "In Review"
    console.log(`[LOG] Đổi trạng thái Jira ${ticket} sang "In Review"...`);
    const transScript = path.resolve(__dirname, 'jira/jira_transition.js');
    try {
      execSync(`node "${transScript}" --issue ${ticket} --status "In Review"`, { stdio: 'inherit' });
    } catch (e) {
      console.warn('[WARN] Lỗi khi đổi trạng thái Jira (bỏ qua):', e.message);
    }

    // 5. Cleanup push_trigger.txt
    if (fs.existsSync(PUSH_TRIGGER_FILE)) {
      fs.unlinkSync(PUSH_TRIGGER_FILE);
      console.log('[LOG] Đã dọn dẹp scratch/push_trigger.txt');
    }

    // 6. Gửi thông báo thành công
    await sendTg(
      `🎉 <b>[HOÀN TẤT BÀN GIAO: ${ticket}]</b>\n\n` +
      `✅ <b>Code:</b> Đã push thành công lên nhánh <code>main</code>\n` +
      `✅ <b>Jira:</b> Đã chuyển trạng thái sang <b>In Review</b>\n` +
      `⚡ <b>CI/CD:</b> GitHub Actions đang tự động kích hoạt workflow kiểm thử trên Cloud.\n\n` +
      `👏 Chúc mừng! Quy trình kết thúc thành công.`
    );
    console.log(`[GIT DELIVERY] Hoàn tất thành công cho ${ticket}!`);
  } catch (err) {
    console.error('[GIT DELIVERY ERROR]', err.message);
    await sendTg(`❌ <b>[LỖI GIT DELIVERY: ${ticket}]</b>\nChi tiết: <code>${err.message}</code>`);
    process.exit(1);
  }
}

runDelivery();
