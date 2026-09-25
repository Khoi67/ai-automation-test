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

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error('[LỖI] TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID chưa được điền trong file .env');
  process.exit(1);
}

const TG_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// State cache
const knownIssuesCache = new Map();
let isCheckingJira = false;
let isExecutingTask = false;

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

// Fetch latest issues from Jira
async function fetchLatestJiraIssues(limit = 5) {
  const jql = `project = "${JIRA_PROJECT_KEY}" AND status = "In Progress" ORDER BY updated DESC`;
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
      await sendTelegramMessage(`ℹ️ Không tìm thấy User Story nào trong Project <b>${JIRA_PROJECT_KEY}</b>.`);
      return;
    }

    let msg = `📋 <b>DANH SÁCH TICKET MỚI NHẤT TRÊN JIRA (${JIRA_PROJECT_KEY}):</b>\n\n`;
    const buttons = [];

    issues.forEach((issue, idx) => {
      const key = issue.key;
      const summary = issue.fields.summary || 'Không có tiêu đề';
      const author = issue.fields.creator?.displayName || 'Team';
      const status = issue.fields.status?.name || 'Open';

      msg += `${idx + 1}️⃣ <b>[${key}]</b> ${summary}\n` +
             `   👤 Tác giả: ${author} | 📌 Trạng thái: <code>${status}</code>\n\n`;

      buttons.push([{ text: `🚀 Chạy Automation ${key}`, callback_data: `run:${key}` }]);
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
    const issues = await fetchLatestJiraIssues(5);
    for (const issue of issues) {
      const key = issue.key;
      const updated = issue.fields.updated;
      const summary = issue.fields.summary;
      const author = issue.fields.creator?.displayName || 'Team';

      const prev = knownIssuesCache.get(key);
      if (prev && prev !== updated) {
        // Detected an update!
        knownIssuesCache.set(key, updated);
        console.log(`[ALERT] Phát hiện thay đổi trên ${key}!`);
        await sendNotification(key, summary, author, 'Yêu cầu được Cập Nhật');
      } else if (!prev) {
        knownIssuesCache.set(key, updated);
      }
    }
  } catch (e) {
    // Silent catch for background polling
  } finally {
    isCheckingJira = false;
  }
}

async function sendNotification(key, summary, author, actionType) {
  const msg = `🔔 <b>[JIRA UPDATE]</b>\n\n🎯 <b>Ticket:</b> <code>${key}</code>\n📝 <b>Tiêu đề:</b> ${summary}\n👤 <b>Người thực hiện:</b> ${author}\n⚡ <b>Trạng thái:</b> ${actionType}\n\n👉 Bạn có muốn chạy Automation cho Ticket này ngay không?`;
  
  const keyboard = {
    inline_keyboard: [
      [
        { text: `🚀 Chạy Automation ${key}`, callback_data: `run:${key}` }
      ],
      [
        { text: '📋 Xem danh sách Ticket', callback_data: 'check_jira' }
      ]
    ]
  };

  await sendTelegramMessage(msg, keyboard);
}

// Execute command runner
function runCommand(command) {
  return new Promise((resolve) => {
    exec(command, { cwd: path.resolve(__dirname, '..') }, (error, stdout, stderr) => {
      resolve({
        success: !error,
        stdout: stdout || '',
        stderr: stderr || '',
        error: error ? error.message : null,
      });
    });
  });
}

// Delegate E2E Automation to IDE Agent via trigger file
const TRIGGER_FILE = path.resolve(__dirname, '../scratch/trigger.txt');

async function executeAutomation(ticketKey) {
  if (isExecutingTask) {
    await sendTelegramMessage(`⚠️ Hiện đang có một tiến trình Automation khác đang chạy. Vui lòng chờ.`);
    return;
  }

  isExecutingTask = true;

  // Write ticket key to trigger file for IDE Agent to pick up
  try {
    fs.writeFileSync(TRIGGER_FILE, ticketKey, 'utf8');
    console.log(`[TRIGGER] Đã ghi ${ticketKey} vào trigger.txt cho IDE Agent.`);

    await sendTelegramMessage(
      `🤖 <b>[ĐÃ CHUYỂN LỆNH CHO AI AGENT]</b>\n\n` +
      `🎯 Ticket: <code>${ticketKey}</code>\n\n` +
      `AI Agent trên IDE đang tiếp nhận và sẽ tự động thực thi quy trình <b>/e2e_jira_to_automation</b> đầy đủ 6 bước:\n\n` +
      `1️⃣ Fetch Requirement từ Jira\n` +
      `2️⃣ Phân tích & Sinh Test Cases\n` +
      `3️⃣ Viết Automation Scripts (POM + Spec)\n` +
      `4️⃣ Chạy Test & Self-Healing (đến khi PASS)\n` +
      `5️⃣ Git Commit & Push lên GitHub\n` +
      `6️⃣ Báo cáo kết quả về Telegram\n\n` +
      `⏳ Vui lòng chờ... Agent sẽ phản hồi khi hoàn tất!`
    );
  } catch (err) {
    console.error('[TRIGGER ERROR]', err.message);
    await sendTelegramMessage(`❌ Lỗi khi ghi trigger file: ${err.message}`);
  }

  // Reset flag after a short delay (Agent will handle the rest)
  setTimeout(() => { isExecutingTask = false; }, 5000);
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

          if (data.startsWith('run:')) {
            const ticket = data.replace('run:', '');
            console.log(`[ACTION] Kích hoạt Automation cho ${ticket}`);
            executeAutomation(ticket);
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
              executeAutomation(ticket);
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
