const axios = require('axios');
const path = require('path');

// Load .env variables
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const JIRA_BASE_URL = (process.env.JIRA_BASE_URL || '').replace(/\/+$/, '');
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;

if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
  console.error('[ERROR] Thiếu cấu hình Jira trong file .env');
  process.exit(1);
}

const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
const headers = {
  'Authorization': `Basic ${auth}`,
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

async function transitionIssue(issueKey, targetStatusName) {
  try {
    console.log(`[LOG] Đang lấy danh sách transitions khả dụng cho ${issueKey}...`);
    // 1. Get available transitions
    const transRes = await axios.get(`${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}/transitions`, { headers });
    const transitions = transRes.data.transitions;
    
    // 2. Find transition matching targetStatusName
    const targetTransition = transitions.find(t => t.name.toLowerCase() === targetStatusName.toLowerCase() || t.to.name.toLowerCase() === targetStatusName.toLowerCase());
    
    if (!targetTransition) {
      console.log(`[WARN] Không tìm thấy trạng thái đích "${targetStatusName}" cho ${issueKey}. Các trạng thái có thể chuyển: ${transitions.map(t => t.to.name).join(', ')}`);
      return;
    }

    // 3. Perform transition
    console.log(`[LOG] Đang chuyển trạng thái ${issueKey} sang "${targetTransition.to.name}" (ID: ${targetTransition.id})...`);
    await axios.post(`${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}/transitions`, {
      transition: { id: targetTransition.id }
    }, { headers });
    
    console.log(`[OK] Chuyển trạng thái thành công!`);
  } catch (error) {
    console.error('[ERROR] Lỗi khi đổi trạng thái Jira:', error.response ? JSON.stringify(error.response.data) : error.message);
  }
}

// Parse arguments
const args = process.argv.slice(2);
let issueKey = '';
let targetStatus = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--issue') issueKey = args[i+1];
  if (args[i] === '--status') targetStatus = args[i+1];
}

if (!issueKey || !targetStatus) {
  console.error('Usage: node jira_transition.js --issue <KEY> --status "<STATUS_NAME>"');
  process.exit(1);
}

transitionIssue(issueKey, targetStatus);
