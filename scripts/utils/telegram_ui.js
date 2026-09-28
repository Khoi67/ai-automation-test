/**
 * Telegram UI Components & Navigation Helpers
 */

function getStandardNavigationButtons() {
  return [
    [{ text: '🔍 Quét User Story Mới', callback_data: 'view_new_stories' }],
    [{ text: '🐞 Ticket Bị Bug (Cần Retest)', callback_data: 'view_bug_stories' }],
    [{ text: '📋 Danh sách toàn bộ Story', callback_data: 'view_all_stories' }],
    [{ text: '🐛 Xem Chi Tiết Các Bug', callback_data: 'view_all_bugs' }],
    [{ text: '📊 Trạng thái Hệ thống', callback_data: 'status' }]
  ];
}

/**
 * Returns standardized action buttons for test reports.
 * @param {string} ticket - Jira ticket key
 * @param {boolean} isPassed - Whether the test passed
 * @param {boolean} isRetest - Whether this is a retest scenario
 * @returns {Array<Array<object>>}
 */
function getActionButtons(ticket, isPassed = false, isRetest = false) {
  const actionButtons = [];
  
  if (isPassed) {
    actionButtons.push([
      { text: `🚀 Duyệt & Push Git (${ticket})`, callback_data: `confirm_push:${ticket}` }
    ]);
  }
  
  const retestAction = isRetest ? `retest:${ticket}` : `dev:${ticket}`;
  const retestText = isRetest ? `🔄 Test Lại (${ticket})` : `🔄 Chạy lại Test Local (${ticket})`;
  
  actionButtons.push([
    { text: retestText, callback_data: retestAction }
  ]);
  
  return actionButtons;
}

/**
 * Builds an inline keyboard markup object with optional action buttons and standard navigation.
 * @param {Array<Array<object>>} customButtons - Array of button rows
 * @param {boolean} includeNavigation - Whether to append standard navigation buttons (default: true)
 * @returns {object} { inline_keyboard: [...] }
 */
function buildInlineKeyboard(customButtons = [], includeNavigation = true) {
  const keyboard = [...customButtons];
  if (includeNavigation) {
    keyboard.push(...getStandardNavigationButtons());
  }
  return { inline_keyboard: keyboard };
}

/**
 * Safely escapes HTML entities to prevent Telegram parse errors
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

module.exports = {
  getStandardNavigationButtons,
  getActionButtons,
  buildInlineKeyboard,
  escapeHtml
};
