/**
 * GitHub Actions CI/CD Telegram Notifier
 * Chạy trên Cloud runner (Node 18+), không phụ thuộc node_modules ngoài.
 */

const { sendTelegramMessage, buildInlineKeyboard, escapeHtml } = require('../utils');

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!botToken || !chatId) {
  console.log('[WARN] TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID chưa được cấu hình. Bỏ qua gửi thông báo.');
  process.exit(0);
}

const testResult = process.env.TEST_RESULT || 'success';
const statusIcon = testResult === 'success' ? '✅' : '❌';
const statusText = testResult === 'success' ? 'PASS TOÀN BỘ' : 'CÓ LỖI (FAIL)';

const rawCommit = (process.env.COMMIT_MSG || 'Auto CI Run').split('\n')[0];
const commitMsg = escapeHtml(rawCommit);

const refName = process.env.REF_NAME || 'main';
const actor = process.env.ACTOR || 'system';
const repoOwner = process.env.REPO_OWNER || 'Khoi67';
const repoName = process.env.REPO_NAME || 'ai-automation-test';
const repo = process.env.REPO || `${repoOwner}/${repoName}`;
const runId = process.env.RUN_ID || '';

const text = `🤖 <b>[CI/CD GITHUB ACTIONS HOÀN TẤT]</b>\n\n` +
  `⚡ <b>Kết quả:</b> ${statusIcon} <code>${statusText}</code>\n` +
  `📌 <b>Nhánh:</b> <code>${refName}</code>\n` +
  `👤 <b>Tác giả:</b> ${actor}\n` +
  `📝 <b>Commit:</b> <code>${commitMsg}</code>\n` +
  `📊 <b>Allure Report:</b> https://${repoOwner}.github.io/${repoName}/\n\n` +
  (runId ? `🔗 <a href="https://github.com/${repo}/actions/runs/${runId}">Xem chi tiết GitHub Actions Run</a>` : '');

const inlineKeyboard = buildInlineKeyboard();

sendTelegramMessage(text, inlineKeyboard, chatId)
  .then((data) => {
    if (data && data.ok) {
      console.log('[OK] Đã gửi thông báo CI/CD về Telegram thành công!');
    } else {
      console.error('[TG ERROR] Không thể gửi thông báo CI/CD:', data);
    }
  })
  .catch((err) => {
    console.error('[REQUEST ERROR]', err.message);
  });
