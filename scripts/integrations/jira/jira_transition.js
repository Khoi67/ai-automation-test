const axios = require('axios');
const { getJiraConfig, getJiraHeaders, parseArgs } = require('../../utils');

const { baseUrl: JIRA_BASE_URL } = getJiraConfig();
const headers = getJiraHeaders();

async function transitionIssue(issueKey, targetStatusName) {
  try {
    console.log(`[LOG] Đang lấy danh sách transitions khả dụng cho ${issueKey}...`);
    // 1. Get available transitions
    const transRes = await axios.get(`${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}/transitions`, { headers });
    const transitions = transRes.data.transitions || [];
    
    // 2. Find transition matching targetStatusName
    const targetTransition = transitions.find(t => 
      t.name.toLowerCase() === targetStatusName.toLowerCase() || 
      t.to.name.toLowerCase() === targetStatusName.toLowerCase()
    );
    
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
const argv = parseArgs(process.argv.slice(2));
const issueKey = argv.issue ? argv.issue.trim() : '';
const targetStatus = argv.status ? argv.status.replace(/^[\\"']+|[\\"']+$/g, '').trim() : '';

if (require.main === module) {
  if (!issueKey || !targetStatus) {
    console.error('Usage: node jira_transition.js --issue <KEY> --status "<STATUS_NAME>"');
    process.exit(1);
  }
  transitionIssue(issueKey, targetStatus);
}

module.exports = { transitionIssue };
