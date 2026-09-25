const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Load .env variables
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

// Telegram credentials from environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error('[ERROR] TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID chưa được cấu hình trong file .env');
  process.exit(1);
}

async function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'Markdown'
    });
    console.log('[OK] Đã gửi thông báo Telegram');
  } catch (err) {
    console.error('[ERROR] Lỗi gửi Telegram:', err.message);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const issueIndex = args.indexOf('--issue');
  if (issueIndex === -1 || !args[issueIndex + 1]) {
    console.error('Usage: node jira_sync.js --issue <ISSUE_KEY>');
    process.exit(1);
  }
  
  const issueKey = args[issueIndex + 1];
  const outputDir = path.resolve(__dirname, '../../../requirements/jira');
  const filePath = path.join(outputDir, issueKey, issueKey, `${issueKey}_requirement.md`);
  
  let oldContent = '';
  if (fs.existsSync(filePath)) {
    oldContent = fs.readFileSync(filePath, 'utf-8');
  }
  
  console.log(`[LOG] Đang fetch dữ liệu mới nhất từ Jira cho ${issueKey}...`);
  try {
    execSync(`node scripts/integrations/jira/jira_fetcher.js --issue ${issueKey} --format md --output ./requirements/jira`, { stdio: 'inherit' });
  } catch (err) {
    console.error('[ERROR] Fetch thất bại.');
    process.exit(1);
  }
  
  let newContent = '';
  if (fs.existsSync(filePath)) {
    newContent = fs.readFileSync(filePath, 'utf-8');
  }
  
  if (oldContent === newContent) {
    console.log(`[LOG] Không có thay đổi nào cho ${issueKey}. Gửi thông báo Telegram...`);
    await sendTelegramMessage(`📥 *[JIRA SYNC]* \`${issueKey}\`\n\n✅ Không có cập nhật hoặc thay đổi requirement nào mới từ Jira.`);
  } else {
    console.log(`[LOG] Có thay đổi mới cho ${issueKey}. Gửi thông báo Telegram...`);
    // Extract a small summary of changes or just send the new content (truncated if too long)
    let message = `📥 *[JIRA UPDATE]* \`${issueKey}\`\n\n⚠️ Có nội dung Requirement mới được cập nhật trên Jira!`;
    message += `\n\n👉 Bạn có muốn chạy luồng Automation E2E cho Ticket này không?`;
    message += `\n💬 *Hãy Reply/Nhắn lại:* \`bắt đầu ${issueKey}\``;
    await sendTelegramMessage(message);
  }
}

main();
