/**
 * Jira Sync Notifier
 * Đồng bộ requirement từ Jira và thông báo thay đổi về Telegram.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { parseArgs, sendTelegramMessage } = require('../../utils');

const argv = parseArgs(process.argv.slice(2));
const issueKey = argv.issue;

if (!issueKey) {
  console.error('Usage: node jira_sync.js --issue <ISSUE_KEY>');
  process.exit(1);
}

async function main() {
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
    await sendTelegramMessage(`📥 <b>[JIRA SYNC]</b> <code>${issueKey}</code>\n\n✅ Không có cập nhật hoặc thay đổi requirement nào mới từ Jira.`);
  } else {
    console.log(`[LOG] Có thay đổi mới cho ${issueKey}. Gửi thông báo Telegram...`);
    let message = `📥 <b>[JIRA UPDATE]</b> <code>${issueKey}</code>\n\n⚠️ Có nội dung Requirement mới được cập nhật trên Jira!`;
    message += `\n\n👉 Bạn có muốn chạy luồng Automation E2E cho Ticket này không?`;
    message += `\n💬 Hãy Reply/Nhắn lại: <code>bắt đầu ${issueKey}</code>`;
    await sendTelegramMessage(message);
  }
}

main();
