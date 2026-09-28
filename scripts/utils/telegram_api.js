/**
 * Unified Telegram Bot API Client
 * Built with native Node.js fetch (Node 18+), zero external dependencies.
 * Supports HTML messages, inline keyboards, photo/document attachments.
 */

const fs = require('fs');
const path = require('path');

// Auto-load .env if credentials are not yet present in process.env
if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
  const rootEnv = path.resolve(__dirname, '../../.env');
  if (fs.existsSync(rootEnv)) {
    try {
      require('dotenv').config({ path: rootEnv });
    } catch (e) {
      // dotenv optional if running in CI with native env vars
    }
  }
}

function getTelegramConfig() {
  return {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  };
}

/**
 * Send an HTML-formatted message to Telegram
 * @param {string} text - HTML formatted text
 * @param {object|null} replyMarkup - Optional inline keyboard markup
 * @param {string|number|null} customChatId - Optional target chat ID override
 * @returns {Promise<object|null>}
 */
async function sendTelegramMessage(text, replyMarkup = null, customChatId = null) {
  const { botToken, chatId } = getTelegramConfig();
  const targetChatId = customChatId || chatId;

  if (!botToken || !targetChatId) {
    console.warn('[TELEGRAM WARN] TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID chưa được cấu hình.');
    return null;
  }

  const payload = {
    chat_id: targetChatId,
    text: text,
    parse_mode: 'HTML',
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error('[TG ERROR]', data.description || JSON.stringify(data));
    }
    return data;
  } catch (err) {
    console.error('[TG ERROR] Lỗi gửi tin nhắn:', err.message);
    return null;
  }
}

/**
 * Send an image or document attachment with caption to Telegram
 * @param {string} attachmentPath - Absolute or relative path to file
 * @param {string} caption - HTML caption (max ~1024 chars)
 * @param {object|null} replyMarkup - Optional inline keyboard
 * @param {string|number|null} customChatId - Optional chat ID override
 * @returns {Promise<object|null>}
 */
async function sendTelegramPhoto(attachmentPath, caption = '', replyMarkup = null, customChatId = null) {
  const { botToken, chatId } = getTelegramConfig();
  const targetChatId = customChatId || chatId;

  if (!botToken || !targetChatId) {
    console.warn('[TELEGRAM WARN] TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID chưa được cấu hình.');
    return null;
  }

  try {
    if (attachmentPath && fs.existsSync(attachmentPath)) {
      const ext = path.extname(attachmentPath).toLowerCase();
      const isImg = ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext);
      const endpoint = isImg ? 'sendPhoto' : 'sendDocument';
      const formKey = isImg ? 'photo' : 'document';

      const fileBuffer = fs.readFileSync(attachmentPath);
      const blob = new Blob([fileBuffer]);
      const form = new FormData();
      form.append('chat_id', targetChatId);
      form.append(formKey, blob, path.basename(attachmentPath));

      const truncatedCaption = caption.length > 1000 ? caption.substring(0, 995) + '...' : caption;
      if (truncatedCaption) {
        form.append('caption', truncatedCaption);
        form.append('parse_mode', 'HTML');
      }

      if (replyMarkup) {
        form.append('reply_markup', typeof replyMarkup === 'string' ? replyMarkup : JSON.stringify(replyMarkup));
      }

      const res = await fetch(`https://api.telegram.org/bot${botToken}/${endpoint}`, {
        method: 'POST',
        body: form,
      });

      const data = await res.json();
      if (!data.ok) {
        console.error('[TG PHOTO ERROR]', data.description);
      }
      return data;
    } else {
      // Fallback to text message if attachment not found
      return await sendTelegramMessage(caption, replyMarkup, targetChatId);
    }
  } catch (err) {
    console.error('[TG PHOTO ERROR] Lỗi gửi ảnh:', err.message);
    return null;
  }
}

/**
 * Answer inline callback queries to acknowledge button clicks
 * @param {string} callbackQueryId
 * @param {string} text - Optional toast text
 */
async function answerCallbackQuery(callbackQueryId, text = '') {
  const { botToken } = getTelegramConfig();
  if (!botToken || !callbackQueryId) return;

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text,
      }),
    });
  } catch (e) {
    // Ignore minor network callback answer errors
  }
}

module.exports = {
  getTelegramConfig,
  sendTelegramMessage,
  sendTelegramPhoto,
  answerCallbackQuery,
};
