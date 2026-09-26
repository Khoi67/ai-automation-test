const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const axios = require('axios');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const JIRA_BASE_URL = (process.env.JIRA_BASE_URL || '').replace(/\/+$/, '');
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY || 'SCRUM';

// GitHub CI/CD env
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error('[LỖI] TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID chưa được điền trong file .env');
  process.exit(1);
}

const TG_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// State cache
const CACHE_FILE = path.resolve(__dirname, '../scratch/jira_state.json');
let knownIssuesCache = new Map();
let isCheckingJira = false;
let isExecutingTask = false;

// Đọc cache từ file lúc khởi động
function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf8');
      const parsed = JSON.parse(data);
      knownIssuesCache = new Map(Object.entries(parsed));
      console.log(`[LOG] Đã tải cache với ${knownIssuesCache.size} tickets.`);
    }
  } catch (err) {
    console.error('[CACHE ERROR] Không thể đọc cache:', err.message);
  }
}

// Lưu cache ra file
function saveCache() {
  try {
    const dir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const obj = Object.fromEntries(knownIssuesCache);
    fs.writeFileSync(CACHE_FILE, JSON.stringify(obj, null, 2), 'utf8');
  } catch (err) {
    console.error('[CACHE ERROR] Không thể ghi cache:', err.message);
  }
}

loadCache();

// Helper: send Telegram Message (Uses HTML format to avoid markdown parse errors)
async function sendTelegramMessage(text, replyMarkup = null) {
  try {
    const payload = {
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'HTML',
    };
    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }
    const res = await axios.post(`${TG_API}/sendMessage`, payload, { timeout: 10000 });
    return res.data;
  } catch (err) {
    console.error('[TG ERROR]', err.response?.data || err.message);
  }
}

// Helper: answer callback query
async function answerCallbackQuery(callbackQueryId, text = '') {
  try {
    await axios.post(`${TG_API}/answerCallbackQuery`, {
      callback_query_id: callbackQueryId,
      text: text,
    }, { timeout: 5000 });
  } catch (e) {}
}

// Jira API Helper
function getJiraHeaders() {
  const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
  return {
    Authorization: `Basic ${auth}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

// Fetch latest issues from Jira (Chỉ lấy trạng thái To Do và In Progress)
async function fetchLatestJiraIssues(limit = 5) {
  const jql = `project = "${JIRA_PROJECT_KEY}" AND status in ("To Do", "In Progress") ORDER BY updated DESC`;
  const res = await axios.get(`${JIRA_BASE_URL}/rest/api/3/search/jql`, {
    headers: getJiraHeaders(),
    params: {
      jql,
      maxResults: limit,
      fields: 'summary,updated,status,creator,description',
    },
    timeout: 15000,
  });
  return res.data.issues || [];
}

// Display latest Jira tickets with inline buttons
async function showJiraTicketsList() {
  try {
    console.log('[LOG] Đang tải danh sách ticket từ Jira Cloud...');
    const issues = await fetchLatestJiraIssues(5);
    console.log(`[LOG] Đã nhận ${issues.length} tickets từ Jira.`);

    if (issues.length === 0) {
      await sendTelegramMessage(`ℹ️ Không có User Story nào ở trạng thái <b>To Do</b> hoặc <b>In Progress</b> trong Project <b>${JIRA_PROJECT_KEY}</b>.`);
      return;
    }

    let msg = `📋 <b>DANH SÁCH TICKET CẦN LÀM (${JIRA_PROJECT_KEY}):</b>\n\n`;
    const buttons = [];

    issues.forEach((issue, idx) => {
      const key = issue.key;
      const summary = issue.fields.summary || 'Không có tiêu đề';
      const author = issue.fields.creator?.displayName || 'Team';
      const status = issue.fields.status?.name || 'Open';

      msg += `${idx + 1}️⃣ <b>[${key}]</b> ${summary}\n` +
             `   👤 Tác giả: ${author} | 📌 Trạng thái: <code>${status}</code>\n\n`;

      buttons.push([
        { text: `🛠 Viết Code (${key})`, callback_data: `dev:${key}` },
        { text: `🚀 Chạy CI/CD (${key})`, callback_data: `run_ci:${key}` }
      ]);
    });

    msg += `👇 <i>Bấm nút bên dưới để thực thi kịch bản cho Ticket tương ứng:</i>`;
    buttons.push([{ text: '🔄 Quét lại Jira', callback_data: 'check_jira' }]);

    await sendTelegramMessage(msg, { inline_keyboard: buttons });
    console.log('[LOG] Đã gửi danh sách ticket đến Telegram thành công.');
  } catch (err) {
    console.error('[FETCH JIRA LIST ERROR]', err.response?.data || err.message);
    await sendTelegramMessage(`❌ Lỗi khi tải danh sách từ Jira: ${err.message}`);
  }
}

// Background poller: detect when someone updates Jira
async function pollJiraChanges() {
  if (isCheckingJira) return;
  isCheckingJira = true;
  try {
    const res = await axios.get(`${JIRA_BASE_URL}/rest/api/3/search/jql`, {
      headers: getJiraHeaders(),
      params: {
        jql: `project = "${JIRA_PROJECT_KEY}" ORDER BY updated DESC`,
        maxResults: 5,
        fields: 'summary,updated,status,creator,description',
      },
      timeout: 15000,
    });
    const issues = res.data.issues || [];
    let cacheChanged = false;

    for (const issue of issues) {
      const key = issue.key;
      const updated = issue.fields.updated;
      const summary = issue.fields.summary;
      const author = issue.fields.creator?.displayName || 'Team';
      const statusName = issue.fields.status?.name || 'In Progress';

      const prev = knownIssuesCache.get(key);
      if (prev && prev !== updated) {
        // Detected an update!
        knownIssuesCache.set(key, updated);
        cacheChanged = true;
        console.log(`[ALERT] Phát hiện thay đổi trên ${key} (${statusName})!`);
        await sendNotification(key, summary, author, statusName);
      } else if (!prev) {
        knownIssuesCache.set(key, updated);
        cacheChanged = true;
      }
    }

    if (cacheChanged) {
      saveCache();
    }
  } catch (e) {
    // Silent catch for background polling
  } finally {
    isCheckingJira = false;
  }
}

async function sendNotification(key, summary, author, statusName) {
  const isCompleted = statusName.toLowerCase().includes('review') || 
                      statusName.toLowerCase().includes('done') || 
                      statusName.toLowerCase().includes('hoàn thành');

  const displayStatus = isCompleted ? 'Hoàn thành' : statusName;

  let msg = `🔔 <b>[JIRA UPDATE]</b>\n\n` +
            `🎯 <b>Ticket:</b> <code>${key}</code>\n` +
            `📝 <b>Tiêu đề:</b> ${summary}\n` +
            `👤 <b>Người thực hiện:</b> ${author}\n` +
            `⚡ <b>Trạng thái:</b> <code>${displayStatus}</code>\n\n`;

  let keyboard;
  if (isCompleted) {
    msg += `👉 <i>Code automation đã hoàn thành và sẵn sàng kiểm thử trên Cloud!</i>`;
    keyboard = {
      inline_keyboard: [
        [{ text: `🚀 Chạy CI/CD (${key})`, callback_data: `run_ci:${key}` }],
        [{ text: '📋 Xem danh sách Ticket', callback_data: 'check_jira' }]
      ]
    };
  } else {
    msg += `👉 <i>Bạn muốn AI viết script mới hay Chạy Regression trên Cloud?</i>`;
    keyboard = {
      inline_keyboard: [
        [
          { text: `🛠 Viết Code (${key})`, callback_data: `dev:${key}` },
          { text: `🚀 Chạy CI/CD (${key})`, callback_data: `run_ci:${key}` }
        ],
        [
          { text: '📋 Xem danh sách Ticket', callback_data: 'check_jira' }
        ]
      ]
    };
  }

  await sendTelegramMessage(msg, keyboard);
}

// Delegate E2E Automation to IDE Agent via trigger file
const TRIGGER_FILE = path.resolve(__dirname, '../scratch/trigger.txt');

async function executeDevAutomation(ticketKey) {
  if (isExecutingTask) {
    await sendTelegramMessage(`⚠️ Hiện đang có một tiến trình Automation khác đang chạy. Vui lòng chờ.`);
    return;
  }

  isExecutingTask = true;

  try {
    const dir = path.dirname(TRIGGER_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(TRIGGER_FILE, ticketKey, 'utf8');
    console.log(`[TRIGGER] Đã ghi ${ticketKey} vào trigger.txt cho IDE Agent.`);

    await sendTelegramMessage(
      `🤖 <b>[LUỒNG DEV: ĐÃ CHUYỂN LỆNH CHO AI AGENT]</b>\n\n` +
      `🎯 Ticket: <code>${ticketKey}</code>\n\n` +
      `AI Agent trên IDE đang tiếp nhận và sẽ tự động thực thi quy trình:\n` +
      `1️⃣ Kéo Requirement\n` +
      `2️⃣ Sinh Test Cases\n` +
      `3️⃣ Viết Automation Scripts (POM + Spec)\n` +
      `4️⃣ Chạy Test Local\n` +
      `5️⃣ Push Code lên GitHub\n\n` +
      `⏳ Bạn có thể kích hoạt bằng lệnh: <code>/e2e_jira_to_automation trigger.txt</code> trên IDE.`
    );
  } catch (err) {
    console.error('[TRIGGER ERROR]', err.message);
    await sendTelegramMessage(`❌ Lỗi khi ghi trigger file: ${err.message}`);
  }

  setTimeout(() => { isExecutingTask = false; }, 5000);
}

// Xử lý khi người dùng phê duyệt Push Git
const PUSH_TRIGGER_FILE = path.resolve(__dirname, '../scratch/push_trigger.txt');

async function handleConfirmPush(ticketKey) {
  try {
    const dir = path.dirname(PUSH_TRIGGER_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PUSH_TRIGGER_FILE, ticketKey, 'utf8');
    console.log(`[PUSH TRIGGER] Đã ghi nhận phê duyệt Push cho ${ticketKey} vào push_trigger.txt`);

    await sendTelegramMessage(
      `✅ <b>[ĐÃ DUYỆT PUSH GIT: ${ticketKey}]</b>\n\n` +
      `🎯 Bạn vừa phê duyệt đẩy code cho ticket <code>${ticketKey}</code>!\n\n` +
      `⚡ Hệ thống đã ghi nhận cờ duyệt.\n` +
      `🤖 Trên Antigravity IDE, bạn có thể gõ: <code>/push ${ticketKey}</code> hoặc bảo Agent <i>"Push ticket ${ticketKey}"</i> để thực hiện tự động:\n` +
      `• Git Commit & Push lên main\n` +
      `• Chuyển Jira sang In Review\n` +
      `• Kích hoạt CI/CD`
    );
  } catch (err) {
    console.error('[CONFIRM PUSH ERROR]', err.message);
    await sendTelegramMessage(`❌ Lỗi khi ghi nhận phê duyệt: ${err.message}`);
  }
}

// Kích hoạt chạy Regression Test trên GitHub Actions
async function triggerGithubActions(ticketKey) {
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    await sendTelegramMessage('⚠️ Cấu hình GitHub Actions chưa được thiết lập (Thiếu GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO trong file .env).');
    return;
  }
  try {
    await sendTelegramMessage(`🚀 <b>[LUỒNG RUN: BẮT ĐẦU CHẠY TRÊN CLOUD]</b>\n\nĐang gửi lệnh chạy Test cho <code>${ticketKey}</code> lên GitHub Actions...`);
    const res = await axios.post(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/playwright.yml/dispatches`,
      {
        ref: 'main',
        inputs: { test_suite: 'all' }
      },
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${GITHUB_TOKEN}`
        }
      }
    );
    await sendTelegramMessage(`✅ <b>[THÀNH CÔNG]</b>\n\nĐã kích hoạt thành công GitHub Actions cho <code>${ticketKey}</code>!\n\nVui lòng kiểm tra tab "Actions" trên GitHub repository của bạn để theo dõi tiến độ và chờ link báo cáo Allure Report.`);
  } catch (err) {
    console.error('[GITHUB ERROR]', err.response?.data || err.message);
    await sendTelegramMessage(`❌ Lỗi kích hoạt GitHub Actions: ${err.response?.data?.message || err.message}`);
  }
}

// Telegram Long Polling Handler
let lastUpdateId = 0;

async function startPolling() {
  console.log('========================================================');
  console.log('  Telegram Native Bot Started (Zero-Config, Long-Polling)');
  console.log(`  Target Project: ${JIRA_PROJECT_KEY}`);
  console.log('========================================================');

  // Xóa mọi webhook cũ để kích hoạt Long-Polling
  try {
    await axios.post(`${TG_API}/deleteWebhook`, { drop_pending_updates: true }, { timeout: 10000 });
    console.log('[LOG] Đã xóa webhook cũ, kích hoạt chế độ Long-Polling thành công.');
  } catch (e) {
    console.log('[WARN] Không thể xóa webhook cũ:', e.message);
  }

  // Khởi tạo cache ban đầu và gửi thông báo khởi động ngay
  try {
    const initialIssues = await fetchLatestJiraIssues(5);
    initialIssues.forEach(i => knownIssuesCache.set(i.key, i.fields.updated));
    saveCache();
    console.log(`[LOG] Đã nạp ${initialIssues.length} tickets ban đầu vào bộ nhớ cache.`);
  } catch (e) {
    console.error('[CACHE INIT ERROR]', e.message);
  }

  // Gửi thông báo và hiển thị danh sách ticket
  await showJiraTicketsList();

  // Quét định kỳ mỗi 15 giây xem có thay đổi trên Jira không
  setInterval(() => {
    pollJiraChanges();
  }, 15000);

  // Long polling loop
  while (true) {
    try {
      const response = await axios.get(`${TG_API}/getUpdates`, {
        params: {
          offset: lastUpdateId + 1,
          timeout: 20,
          allowed_updates: JSON.stringify(['message', 'callback_query']),
        },
        timeout: 25000,
      });

      const updates = response.data.result || [];
      for (const update of updates) {
        lastUpdateId = update.update_id;

        // 1. Handle Inline Button clicks
        if (update.callback_query) {
          const cb = update.callback_query;
          const data = cb.data;
          console.log(`[LOG] Nhận được cú click nút từ Telegram: ${data}`);
          await answerCallbackQuery(cb.id, 'Đang tiến hành...');

          if (data.startsWith('dev:')) {
            const ticket = data.replace('dev:', '');
            console.log(`[ACTION] Kích hoạt Automation Dev cho ${ticket}`);
            executeDevAutomation(ticket);
          } else if (data.startsWith('run_ci:')) {
            const ticket = data.replace('run_ci:', '');
            console.log(`[ACTION] Kích hoạt Automation Run cho ${ticket}`);
            triggerGithubActions(ticket);
          } else if (data.startsWith('confirm_push:')) {
            const ticket = data.replace('confirm_push:', '');
            console.log(`[ACTION] Người dùng phê duyệt Push Git cho ${ticket}`);
            handleConfirmPush(ticket);
          } else if (data === 'check_jira') {
            await showJiraTicketsList();
          } else if (data === 'status') {
            await sendTelegramMessage(
              `📊 <b>[TRẠNG THÁI HỆ THỐNG]</b>\n\n` +
              `• Jira URL: <code>${JIRA_BASE_URL}</code>\n` +
              `• Project Key: <code>${JIRA_PROJECT_KEY}</code>\n` +
              `• Trạng thái Bot: 🟢 Đang hoạt động (Polling mượt mà)\n` +
              `• Đang chạy task: ${isExecutingTask ? 'Có' : 'Không'}`
            );
          }
          continue;
        }

        // 2. Handle Text Messages
        if (update.message && update.message.text) {
          const text = update.message.text.trim();
          console.log(`[USER MESSAGE] ${text}`);

          if (text === '/start' || text === '/check' || text === '/list' || text.toLowerCase().includes('quét')) {
            await showJiraTicketsList();
          } else if (text === '/status') {
            await sendTelegramMessage(
              `📊 <b>[TRẠNG THÁI]</b>\n• Jira: <code>${JIRA_PROJECT_KEY}</code>\n• Bot: 🟢 Trực tuyến\n• Đang thực thi: ${isExecutingTask ? 'Có' : 'Sẵn sàng'}`
            );
          } else if (text.toLowerCase().startsWith('bắt đầu') || text.toLowerCase().startsWith('/run')) {
            const match = text.match(/[A-Za-z0-9]+-\d+/);
            if (match) {
              const ticket = match[0].toUpperCase();
              executeDevAutomation(ticket); // Mặc định luồng Dev nếu gõ chữ
            } else {
              await sendTelegramMessage('⚠️ Vui lòng cung cấp mã Ticket. Ví dụ: <code>bắt đầu SCRUM-6</code> hoặc <code>/run SCRUM-6</code>');
            }
          }
        }
      }
    } catch (err) {
      if (err.code !== 'ECONNABORTED') {
        console.error('[POLLING ERROR]', err.message);
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

startPolling();
