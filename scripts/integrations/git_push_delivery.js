/**
 * Git Push & CI/CD Delivery Script
 * Tự động commit, push code lên main, transition Jira ticket và thông báo Telegram.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { parseArgs, sendTelegramMessage, buildInlineKeyboard, getJiraConfig, getJiraHeaders } = require('../utils');

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

/**
 * Kiểm tra xem Ticket có Bug hay không (từ test.fixme trong code hoặc linked bugs trên Jira)
 */
async function checkTicketBugs(ticketKey) {
  let hasBugs = false;
  let linkedBugs = [];

  // 1. Kiểm tra trong mã nguồn test spec xem có cờ test.fixme() hay không
  try {
    const testsDir = path.resolve(__dirname, '../../tests');
    function findSpecFiles(dir) {
      let results = [];
      if (!fs.existsSync(dir)) return results;
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          results = results.concat(findSpecFiles(fullPath));
        } else if (file.endsWith('.spec.ts')) {
          results.push(fullPath);
        }
      }
      return results;
    }

    const allSpecs = findSpecFiles(testsDir);
    for (const file of allSpecs) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes(ticketKey) && content.includes('test.fixme(')) {
        hasBugs = true;
        break;
      }
    }
  } catch (e) {}

  // 2. Kiểm tra trên Jira API xem có linked bugs nào chưa đóng hay không
  try {
    const { baseUrl } = getJiraConfig();
    const res = await axios.get(`${baseUrl}/rest/api/3/issue/${ticketKey}?fields=issuelinks,status`, {
      headers: getJiraHeaders(),
      timeout: 10000
    });
    const issue = res.data;
    if (issue && issue.fields && Array.isArray(issue.fields.issuelinks)) {
      for (const link of issue.fields.issuelinks) {
        const linked = link.inwardIssue || link.outwardIssue;
        if (linked && linked.fields && linked.fields.issuetype && linked.fields.issuetype.name === 'Bug') {
          const bugStatus = (linked.fields.status?.name || '').toLowerCase();
          const isClosed = bugStatus.includes('done') || bugStatus.includes('closed') || bugStatus.includes('resolved') || bugStatus.includes('hoàn thành');
          if (!isClosed) {
            hasBugs = true;
            linkedBugs.push(linked.key);
          }
        }
      }
    }
  } catch (e) {
    console.warn('[WARN] Không thể kiểm tra Jira bugs qua API, sử dụng kết quả kiểm tra test.fixme:', e.message);
  }

  return { hasBugs, linkedBugs: [...new Set(linkedBugs)] };
}

async function runDelivery() {
  console.log(`[GIT DELIVERY] Bắt đầu bàn giao Git cho ticket: ${ticket}...`);
  const notifyScript = path.resolve(__dirname, 'notify_step.js');

  // =========================================================================
  // BƯỚC 0: PRE-PUSH QUALITY GATE (BẮT BUỘC KIỂM THỬ XÁC THỰC TRƯỚC KHI PUSH)
  // =========================================================================
  const skipTest = argv['skip-test'] === true || argv['skip-test'] === 'true';
  if (!skipTest) {
    console.log(`\n[QUALITY GATE] Đang chạy kiểm thử xác thực chất lượng trước khi Push...`);
    try {
      const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
      const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
      console.log(`[QUALITY GATE] 1. Kiểm tra TypeScript typecheck...`);
      execSync(`${npmCmd} run typecheck`, { stdio: 'inherit' });
      console.log(`[QUALITY GATE] 2. Kiểm tra targeted tests cho @${ticket}...`);
      execSync(`${npxCmd} playwright test --grep @${ticket}`, { stdio: 'inherit' });
      console.log(`[QUALITY GATE PASS] ✅ Toàn bộ test suite cho ${ticket} ĐẠT chuẩn Definition of Done (0 Failures). Cho phép bàn giao.\n`);
    } catch (testError) {
      console.error(`\n❌ [QUALITY GATE FAILED] Phát hiện Test Case bị FAILED trên máy cục bộ!`);
      console.error(`[BLOCKED] TỪ CHỐI commit và push code lên GitHub để bảo vệ CI/CD Pipeline không bị FAIL!\n`);

      const alertMsg = `🚫 <b>[CHẶN PUSH CODE: ${ticket}]</b>\n\n` +
                       `⚠️ <b>Cảnh báo Chốt Chặn Chất Lượng (Pre-Push Quality Gate):</b>\n` +
                       `Hệ thống phát hiện có Test Case bị <b>FAILED</b> khi chạy kiểm thử cục bộ!\n\n` +
                       `🛡️ <b>Hành động tự động:</b> Đã <b>TỪ CHỐI</b> đẩy code lên GitHub để bảo vệ CI/CD Pipeline không bị gãy.\n` +
                       `👉 Vui lòng kiểm tra lại log kiểm thử, sửa lỗi hoặc đánh dấu <code>test.fixme()</code> cho các test bị lỗi app trước khi bàn giao!`;
      try {
        await sendTelegramMessage(alertMsg, buildInlineKeyboard());
      } catch (tgErr) {
        console.warn('[WARN] Không thể gửi cảnh báo chặn push về Telegram:', tgErr.message);
      }
      process.exit(1);
    }
  } else {
    console.warn(`[WARN] Bỏ qua Pre-Push Quality Gate theo tham số (--skip-test).\n`);
  }

  const branchName = argv.branch || `feat/${ticket}`;

  try {
    // Bước 1: Tạo/chuyển sang Feature Branch và Push
    try {
      execSync(`node "${notifyScript}" --ticket ${ticket} --step ${startStep} --title "Tạo & Push Feature Branch" --detail "Đang tạo nhánh ${branchName} và đẩy mã nguồn kiểm thử lên GitHub"`, { stdio: 'inherit' });
    } catch (e) {
      console.warn('[WARN] Lỗi khi gửi notify step 1:', e.message);
    }

    // 1. Kiểm tra và chuyển nhánh
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    if (currentBranch !== branchName) {
      console.log(`[LOG] Chuyển từ nhánh '${currentBranch}' sang nhánh '${branchName}'...`);
      execSync(`git checkout -B "${branchName}"`, { stdio: 'inherit' });
    } else {
      console.log(`[LOG] Đang ở nhánh '${branchName}'.`);
    }

    // 2. Selective Staging
    console.log('[LOG] Staging có chọn lọc các thư mục mã nguồn và tài liệu...');
    execSync('git add tests/ page-object/ fixture/ workflow/ core/ constant/ test-data/ requirements/ test-cases/ .agent/ GEMINI.md RULE_GLOBAL.md scripts/', { stdio: 'inherit' });

    // 3. Git commit
    const commitMsg = `feat(automation): add test suite and POM for ${ticket}`;
    try {
      execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
      console.log(`[LOG] Đã commit với message: "${commitMsg}"`);
    } catch (e) {
      console.log('[LOG] Không có thay đổi mới để commit (Working tree clean).');
    }

    // 4. Git push branch
    console.log(`[LOG] Chạy git push -u origin ${branchName}`);
    execSync(`git push -u origin "${branchName}"`, { stdio: 'inherit' });
    console.log(`[LOG] Đã push code lên GitHub nhánh '${branchName}' thành công.`);

    const prUrl = `https://github.com/Khoi67/ai-automation-test/compare/main...${branchName}?expand=1`;
    console.log(`[LOG] Đường dẫn mở Pull Request: ${prUrl}`);

    // Bước 2: Cập nhật trạng thái Jira
    const { hasBugs, linkedBugs } = await checkTicketBugs(ticket);
    const targetStatus = hasBugs ? 'In Progress' : 'In Review';
    const bugInfoStr = linkedBugs.length > 0 ? ` (Bugs: ${linkedBugs.join(', ')})` : '';
    const statusDetail = hasBugs 
      ? `Giữ trạng thái In Progress do còn Bug ứng dụng chưa fix${bugInfoStr}`
      : 'Toàn bộ kiểm thử PASS (không có Bug), chuyển sang In Review';

    try {
      execSync(`node "${notifyScript}" --ticket ${ticket} --step ${startStep + 1} --title "Cập nhật trạng thái Jira" --detail "${statusDetail}"`, { stdio: 'inherit' });
    } catch (e) {
      console.warn('[WARN] Lỗi khi gửi notify step 2:', e.message);
    }

    console.log(`[LOG] Cập nhật trạng thái Jira ${ticket} sang "${targetStatus}"...`);
    const transScript = path.resolve(__dirname, 'jira/jira_transition.js');
    try {
      execSync(`node "${transScript}" --issue ${ticket} --status "${targetStatus}"`, { stdio: 'inherit' });
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
      execSync(`node "${notifyScript}" --ticket ${ticket} --step ${startStep + 2} --title "Kích Hoạt CI/CD Pipeline" --detail "GitHub Actions đang tự động chạy kiểm thử trên Cloud cho nhánh ${branchName}"`, { stdio: 'inherit' });
    } catch (e) {
      console.warn('[WARN] Lỗi khi gửi notify step 3:', e.message);
    }

    // 7. Gửi thông báo hoàn tất bàn giao kèm action buttons
    const completeButtons = [
      [{ text: `🔍 Mở Pull Request (${branchName})`, url: prUrl }],
      [{ text: `🚀 Chạy CI/CD (${ticket})`, callback_data: `run_ci:${ticket}` }]
    ];
    const inlineKeyboard = buildInlineKeyboard(completeButtons);

    const jiraStatusMsg = hasBugs 
      ? `🟡 Giữ nguyên <b>In Progress</b> <i>(Còn Bug chờ Dev fix: ${linkedBugs.join(', ') || 'test.fixme'})</i>`
      : `🟢 Đã chuyển sang <b>In Review</b> <i>(Toàn bộ test PASS sạch sẽ)</i>`;

    await sendTelegramMessage(
      `🎉 <b>[HOÀN TẤT BÀN GIAO: ${ticket}]</b>\n\n` +
      `⚡ <b>Trạng thái quy trình:</b> <code>Hoàn thành</code>\n` +
      `🌿 <b>Nhánh Git:</b> <code>${branchName}</code> (Protected Main Safe)\n` +
      `🔗 <b>Pull Request:</b> <a href="${prUrl}">Tạo Pull Request trên GitHub</a>\n` +
      `📌 <b>Jira:</b> ${jiraStatusMsg}\n` +
      `⚡ <b>CI/CD:</b> Nhánh đã sẵn sàng để review và merge vào main.\n\n` +
      `👏 Chúc mừng! Quy trình bàn giao feature branch hoàn tất an toàn.`,
      inlineKeyboard
    );
    console.log(`[GIT DELIVERY] Hoàn tất thành công cho ${ticket} trên nhánh ${branchName}!`);
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
