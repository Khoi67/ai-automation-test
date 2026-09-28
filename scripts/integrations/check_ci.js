/**
 * GitHub Actions CI Checker & Poller
 * Theo dõi và xác nhận kết quả chạy CI/CD trên GitHub Actions.
 */

const axios = require('axios');
const path = require('path');
const { parseArgs, sendTelegramMessage, buildInlineKeyboard } = require('../utils');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const argv = parseArgs(process.argv.slice(2));
const ticket = argv.ticket || 'SCRUM';
const shouldWait = argv.wait !== 'false' && argv.wait !== false;
const shouldNotify = argv.notify !== 'false' && argv.notify !== false;
const step = argv.step || '4';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'Khoi67';
const GITHUB_REPO = process.env.GITHUB_REPO || 'ai-automation-test';

async function checkCI() {
  console.log(`[CHECK CI] Bắt đầu kiểm tra GitHub Actions cho ticket: ${ticket}...`);

  if (!GITHUB_OWNER || !GITHUB_REPO) {
    console.error('[ERROR] Thiếu cấu hình GITHUB_OWNER hoặc GITHUB_REPO trong .env');
    process.exit(1);
  }

  const headers = { Accept: 'application/vnd.github.v3+json' };
  if (GITHUB_TOKEN) {
    headers.Authorization = `token ${GITHUB_TOKEN}`;
  }

  // 1. Gửi thông báo bắt đầu check CI về Telegram
  if (shouldNotify) {
    try {
      const notifyScript = path.resolve(__dirname, 'notify_step.js');
      const { execSync } = require('child_process');
      execSync(`node "${notifyScript}" --ticket ${ticket} --step ${step} --title "Kiểm tra CI/CD trên GitHub" --detail "Đang theo dõi tiến trình chạy kiểm thử Playwright trên Cloud runner"`, { stdio: 'inherit' });
    } catch (e) {
      console.warn('[WARN] Lỗi khi gửi notify step:', e.message);
    }
  }

  const maxAttempts = shouldWait ? 40 : 1; // 40 * 15s = 10 phút max
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      const res = await axios.get(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/runs?per_page=5`,
        { headers, timeout: 15000 }
      );
      const runs = res.data.workflow_runs || [];
      const latestRun = runs[0];

      if (!latestRun) {
        console.log('[CHECK CI] Chưa tìm thấy workflow run nào.');
        if (!shouldWait) break;
      } else {
        const { id, status, conclusion, html_url, created_at } = latestRun;
        console.log(`[ATTEMPT ${attempt}] Run #${id} - Status: ${status} - Conclusion: ${conclusion || 'pending'}`);

        if (status === 'completed') {
          const isSuccess = conclusion === 'success';
          const icon = isSuccess ? '✅' : '❌';
          console.log(`\n========================================================`);
          console.log(`[CHECK CI] KẾT QUẢ GITHUB ACTIONS: ${isSuccess ? 'PASS' : 'FAIL'} (${conclusion})`);
          console.log(`URL: ${html_url}`);
          console.log(`Allure Report: https://${GITHUB_OWNER}.github.io/${GITHUB_REPO}/`);
          console.log(`========================================================\n`);

          if (shouldNotify) {
            const reportUrl = `https://${GITHUB_OWNER}.github.io/${GITHUB_REPO}/`;
            const msg = `${icon} <b>[KẾT QUẢ CI/CD TRÊN GITHUB: ${ticket}]</b>\n\n` +
                        `⚡ <b>Trạng thái:</b> <code>${isSuccess ? 'THÀNH CÔNG (PASS)' : 'THẤT BẠI (FAIL)'}</code>\n` +
                        `📊 <b>Allure Report:</b> ${reportUrl}\n` +
                        `🔗 <a href="${html_url}">Xem chi tiết GitHub Actions Run #${id}</a>\n\n` +
                        `🎉 Toàn bộ quy trình từ Jira -> Test Case -> Code POM -> Test Local -> Git Push -> CI/CD đã hoàn tất!`;

            await sendTelegramMessage(msg, buildInlineKeyboard());
          }

          if (!isSuccess) {
            process.exit(1);
          }
          return latestRun;
        }
      }
    } catch (err) {
      console.warn(`[WARN] Lỗi khi kiểm tra GitHub API (thử lại sau):`, err.message);
    }

    if (shouldWait) {
      await new Promise(resolve => setTimeout(resolve, 15000));
    }
  }

  console.log('[CHECK CI] Hết thời gian chờ (Timeout). Workflow vẫn đang chạy trên GitHub.');
}

if (require.main === module) {
  checkCI().catch(err => {
    console.error('[CHECK CI ERROR]', err.message);
    process.exit(1);
  });
}

module.exports = { checkCI };
