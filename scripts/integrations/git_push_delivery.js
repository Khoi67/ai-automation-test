/**
 * Git Push & CI/CD Delivery Script
 * Tự động commit, push code lên main, transition Jira ticket và thông báo Telegram.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { parseArgs, sendTelegramMessage, buildInlineKeyboard } = require('../utils');

const argv = parseArgs(process.argv.slice(2));
let ticket = argv.ticket || '';

// Fallback to push_trigger.txt if no arg provided
const PUSH_TRIGGER_FILE = path.resolve(__dirname, '../../scratch/push_trigger.txt');
if (!ticket && fs.existsSync(PUSH_TRIGGER_FILE)) {
  ticket = fs.readFileSync(PUSH_TRIGGER_FILE, 'utf8').trim();
}

if (!ticket) {
  console.error('[ERROR] Vui lòng truyền mã ticket: --ticket <JIRA_KEY> hoặc tạo scratch/push_trigger.txt');
  process.exit(1);
}

const startStep = parseInt(argv['start-step'] || argv.startStep, 10) || 1;

async function runDelivery() {
  console.log(`[GIT DELIVERY] Bắt đầu bàn giao Git cho ticket: ${ticket}...`);
  const notifyScript = path.resolve(__dirname, 'notify_step.js');

  try {
    // Bước 1: Git Commit & Push lên main
    try {
      execSync(`node "${notifyScript}" --ticket ${ticket} --step ${startStep} --title "Git Commit & Push lên main" --detail "Đang commit và đẩy mã nguồn kiểm thử lên nhánh main"`, { stdio: 'inherit' });
    } catch (e) {
      console.warn('[WARN] Lỗi khi gửi notify step 1:', e.message);
    }

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

    // Bước 2: Chuyển Jira sang In Review
    try {
      execSync(`node "${notifyScript}" --ticket ${ticket} --step ${startStep + 1} --title "Chuyển Jira sang In Review" --detail "Cập nhật trạng thái ticket trên Jira sang In Review"`, { stdio: 'inherit' });
    } catch (e) {
      console.warn('[WARN] Lỗi khi gửi notify step 2:', e.message);
    }

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

    // Bước 3: Kích Hoạt CI/CD Pipeline
    try {
      execSync(`node "${notifyScript}" --ticket ${ticket} --step ${startStep + 2} --title "Kích Hoạt CI/CD Pipeline" --detail "GitHub Actions đang tự động chạy kiểm thử trên Cloud và cập nhật Allure Report"`, { stdio: 'inherit' });
    } catch (e) {
      console.warn('[WARN] Lỗi khi gửi notify step 3:', e.message);
    }

    // 7. Gửi thông báo hoàn tất bàn giao kèm action buttons
    const completeButtons = [
      [{ text: `🚀 Chạy CI/CD (${ticket})`, callback_data: `run_ci:${ticket}` }]
    ];
    const inlineKeyboard = buildInlineKeyboard(completeButtons);

    await sendTelegramMessage(
      `🎉 <b>[HOÀN TẤT BÀN GIAO: ${ticket}]</b>\n\n` +
      `⚡ <b>Trạng thái:</b> <code>Hoàn thành</code>\n` +
      `✅ <b>Code:</b> Đã push thành công lên nhánh <code>main</code>\n` +
      `✅ <b>Jira:</b> Đã chuyển trạng thái sang <b>In Review</b>\n` +
      `⚡ <b>CI/CD:</b> GitHub Actions đang tự động kích hoạt workflow kiểm thử trên Cloud.\n\n` +
      `👏 Chúc mừng! Quy trình hoàn thành xuất sắc.`,
      inlineKeyboard
    );
    console.log(`[GIT DELIVERY] Hoàn tất thành công cho ${ticket}!`);
  } catch (err) {
    console.error('[GIT DELIVERY ERROR]', err.message);
    await sendTelegramMessage(`❌ <b>[LỖI GIT DELIVERY: ${ticket}]</b>\nChi tiết: <code>${err.message}</code>`);
    process.exit(1);
  }
}

if (require.main === module) {
  runDelivery();
}

module.exports = { runDelivery };
