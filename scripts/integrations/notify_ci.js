/**
 * GitHub Actions CI/CD Telegram Notifier (Sync with Single-Pipeline Architecture)
 * Chạy trên Cloud runner (Node 18+), không phụ thuộc node_modules ngoài.
 */

const fs = require('fs');
const path = require('path');
const { sendTelegramMessage, sendTelegramPhoto, escapeHtml } = require('../utils');

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!botToken || !chatId) {
  console.log('[WARN] TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID chưa được cấu hình. Bỏ qua gửi thông báo.');
  process.exit(0);
}

const testResult = process.env.TEST_RESULT || 'success';
const isPass = testResult === 'success';
const refName = process.env.REF_NAME || 'main';
const mergeResult = process.env.MERGE_RESULT || 'skipped';
const actor = process.env.ACTOR || 'system';
const repoOwner = process.env.REPO_OWNER || 'Khoi67';
const repoName = process.env.REPO_NAME || 'ai-automation-test';
const repo = process.env.REPO || `${repoOwner}/${repoName}`;
const runId = process.env.RUN_ID || '';
const rawCommit = (process.env.COMMIT_MSG || 'CI Execution').split('\n')[0];
const commitMsg = escapeHtml(rawCommit);
const reportUrl = process.env.REPORT_URL || `https://${repoOwner}.github.io/${repoName}/`;

// 1. Thống kê Allure Report (nếu có)
let statsText = '';
try {
  const summaryPath = path.resolve(__dirname, '../../allure-report/widgets/summary.json');
  if (fs.existsSync(summaryPath)) {
    const summaryData = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    const s = summaryData.statistic;
    if (s) {
      statsText = `📈 <b>Thống kê Tests:</b>\n` +
        `  • ✅ Passed: <b>${s.passed || 0}</b>\n` +
        `  • ❌ Failed: <b>${s.failed || 0}</b>\n` +
        (s.broken ? `  • 💥 Broken: <b>${s.broken}</b>\n` : '') +
        `  • ⏭️ Skipped: <b>${s.skipped || 0}</b>\n` +
        `  • 🔢 Tổng cộng: <b>${s.total || 0}</b> tests\n\n`;
    }
  }
} catch (e) {}

// 2. Định dạng trạng thái & phân loại nhánh
const isFeatureBranch = refName.startsWith('feat/') || refName.startsWith('fix/');
const statusEmoji = isPass ? '✅' : '❌';
const statusBadge = isPass ? 'PASS TOÀN BỘ (100%)' : 'CÓ TEST THẤT BẠI (FAIL)';
const title = isPass
  ? `🟢 <b>[CI/CD PIPELINE: TEST PASS 100%]</b>`
  : `🔴 <b>[CI/CD PIPELINE: CÓ TEST THẤT BẠI]</b>`;

let branchStatusInfo = '';
if (isPass) {
  if (isFeatureBranch) {
    if (mergeResult === 'success') {
      branchStatusInfo = `🔀 <b>Auto-Merge:</b> ✅ <i>Đã tự động merge vào <code>main</code> và xóa nhánh <code>${refName}</code> thành công!</i>\n`;
    } else {
      branchStatusInfo = `🔀 <b>Trạng thái Nhánh:</b> ℹ️ <i>Kiểm thử thành công trên nhánh <code>${refName}</code>.</i>\n`;
    }
  } else {
    branchStatusInfo = `📌 <b>Nhánh:</b> <code>main</code> (Production / Stable)\n`;
  }
} else {
  if (isFeatureBranch) {
    branchStatusInfo = `🛡️ <b>Trạng thái Nhánh:</b> ⚠️ <i>Giữ nguyên nhánh <code>${refName}</code> trên remote để QA/Dev kiểm tra và debug.</i>\n`;
  } else {
    branchStatusInfo = `📌 <b>Nhánh:</b> <code>${refName}</code> (Cảnh báo: Có test lỗi trên nhánh chính!)\n`;
  }
}

const messageText = `${title}\n\n` +
  `⚡ <b>Kết quả:</b> ${statusEmoji} <code>${statusBadge}</code>\n` +
  `📌 <b>Nhánh:</b> <code>${refName}</code>\n` +
  branchStatusInfo +
  `👤 <b>Tác giả:</b> ${actor}\n` +
  `📝 <b>Commit:</b> <code>${commitMsg}</code>\n\n` +
  statsText +
  `📊 <b>Allure Report:</b> ${reportUrl}\n` +
  (runId ? `🔗 <a href="https://github.com/${repo}/actions/runs/${runId}">Xem chi tiết GitHub Actions Run #${runId}</a>\n` : '');

const buttons = [
  [
    { text: '📊 Xem Allure Report', url: reportUrl },
    ...(runId ? [{ text: '🔗 GitHub Run', url: `https://github.com/${repo}/actions/runs/${runId}` }] : [])
  ]
];
const replyMarkup = { inline_keyboard: buttons };

// 3. Tìm screenshot nếu FAIL
let errorScreenshot = null;
if (!isPass) {
  const testResultsDir = path.resolve(__dirname, '../../test-results');
  if (fs.existsSync(testResultsDir)) {
    const pngFiles = [];
    function findPngs(dir) {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of entries) {
          const fullPath = path.join(dir, item.name);
          if (entry.isDirectory()) findPngs(fullPath);
          else if (entry.isFile() && item.name.toLowerCase().endsWith('.png')) pngFiles.push(fullPath);
        }
      } catch (e) {}
    }
    findPngs(testResultsDir);
    if (pngFiles.length > 0) {
      pngFiles.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
      errorScreenshot = pngFiles[0];
    }
  }
}

async function run() {
  try {
    if (errorScreenshot) {
      const res = await sendTelegramPhoto(errorScreenshot, messageText, replyMarkup, chatId);
      if (res && res.ok) {
        console.log('[OK] Đã gửi thông báo kèm screenshot về Telegram!');
        return;
      }
    }
    const res = await sendTelegramMessage(messageText, replyMarkup, chatId);
    if (res && res.ok) {
      console.log('[OK] Đã gửi thông báo CI/CD về Telegram thành công!');
    }
  } catch (err) {
    console.error('[ERROR] Lỗi gửi thông báo CI:', err.message);
  }
}

run();

