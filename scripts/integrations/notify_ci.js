const https = require('https');

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
// Escape HTML entities to avoid Telegram parse errors
const commitMsg = rawCommit
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

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

const payload = JSON.stringify({
  chat_id: chatId,
  text: text,
  parse_mode: 'HTML'
});

const req = https.request({
  hostname: 'api.telegram.org',
  path: `/bot${botToken}/sendMessage`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  },
  timeout: 10000
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      if (data.ok) {
        console.log('[OK] Đã gửi thông báo CI/CD về Telegram thành công!');
      } else {
        console.error('[TG ERROR]', data.description);
      }
    } catch (e) {
      console.log('[RESPONSE]', body);
    }
  });
});

req.on('error', (err) => {
  console.error('[REQUEST ERROR]', err.message);
});

req.write(payload);
req.end();
