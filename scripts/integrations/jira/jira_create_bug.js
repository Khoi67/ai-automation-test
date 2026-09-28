const axios = require('axios');
const path = require('path');
const fs = require('fs');

const { getJiraConfig, getJiraHeaders, sendTelegramPhoto, escapeHtml, parseArgs } = require('../../utils');

const { baseUrl: JIRA_BASE_URL, projectKey: JIRA_PROJECT_KEY } = getJiraConfig();
const headers = getJiraHeaders();

async function getValidIssueType() {
  try {
    const res = await axios.get(`${JIRA_BASE_URL}/rest/api/3/issue/createmeta?projectKeys=${JIRA_PROJECT_KEY}`, { headers });
    const types = res.data.projects[0]?.issuetypes || [];
    const bugType = types.find(t => t.name.toLowerCase() === 'bug');
    if (bugType) return bugType.name;
    const taskType = types.find(t => t.name.toLowerCase() === 'task');
    if (taskType) return taskType.name;
    const standardType = types.find(t => !t.subtask);
    return standardType ? standardType.name : 'Task';
  } catch {
    return 'Task';
  }
}

// Convert literal \n or real newlines to clean text
function normalizeText(text) {
  if (!text) return '';
  return text
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .trim();
}

// Convert plaintext with newlines to ADF paragraph nodes
function textToParagraphNodes(text) {
  if (!text) return [];
  const normalized = normalizeText(text);
  const lines = normalized.split('\n');
  return lines.map(line => ({
    type: 'paragraph',
    content: line.trim() ? [{ type: 'text', text: line }] : []
  }));
}

function makeAdfSection(headingText, bodyText) {
  if (!bodyText) return [];
  return [
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: headingText }]
    },
    ...textToParagraphNodes(bodyText)
  ];
}

// Format steps as a numbered orderedList in ADF
function makeAdfSteps(headingText, stepsText) {
  if (!stepsText) return [];
  const normalized = normalizeText(stepsText);
  const rawLines = normalized.split('\n').map(l => l.trim()).filter(Boolean);

  if (rawLines.length === 0) return [];

  return [
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: headingText }]
    },
    {
      type: 'orderedList',
      content: rawLines.map(line => {
        // Strip leading numbering like '1. ', '2) ' if already present
        const cleanText = line.replace(/^\d+[\.\)]\s*/, '');
        return {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: cleanText }]
            }
          ]
        };
      })
    }
  ];
}

// Auto-detect the latest Playwright failed screenshot in test-results
function getLatestPlaywrightScreenshot(filterText = null) {
  const searchDirs = [
    path.resolve(__dirname, '../../../test-results'),
    path.resolve(process.cwd(), 'test-results')
  ];

  const testResultsDir = searchDirs.find(d => fs.existsSync(d));
  if (!testResultsDir) return null;

  let matchedFile = null;
  let matchedMtime = 0;
  let fallbackFile = null;
  let fallbackMtime = 0;

  function scan(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scan(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.png') || entry.name.endsWith('.jpg'))) {
          const stat = fs.statSync(fullPath);
          if (filterText && fullPath.toLowerCase().includes(filterText.toLowerCase())) {
            if (stat.mtimeMs > matchedMtime) {
              matchedMtime = stat.mtimeMs;
              matchedFile = fullPath;
            }
          }
          if (stat.mtimeMs > fallbackMtime) {
            fallbackMtime = stat.mtimeMs;
            fallbackFile = fullPath;
          }
        }
      }
    } catch {}
  }

  scan(testResultsDir);
  return matchedFile || fallbackFile;
}

// Parse Markdown test case file to extract Pre-condition, Steps, Expected Results
function parseTestCaseFile(tcFilePath, tcId) {
  if (!tcFilePath || !fs.existsSync(tcFilePath)) return null;
  const content = fs.readFileSync(tcFilePath, 'utf8');
  const sections = content.split(/\n##\s+/);
  for (const sec of sections) {
    if (sec.toUpperCase().includes(tcId.toUpperCase())) {
      const lines = sec.split('\n');
      const headerLine = lines[0];
      const body = lines.slice(1).join('\n');

      const preMatch = body.match(/\*\*Pre-?condition:?\*\*([\s\S]*?)(?=\*\*Steps)/i);
      const stepsMatch = body.match(/\*\*Steps:?\*\*([\s\S]*?)(?=\*\*Expected)/i);
      const expMatch = body.match(/\*\*Expected\s*Results?:?\*\*([\s\S]*?)$/i);

      return {
        header: headerLine.trim(),
        precondition: preMatch ? preMatch[1].replace(/^[\s\-\*]+/gm, '').trim() : '',
        steps: stepsMatch ? stepsMatch[1].trim() : '',
        expected: expMatch ? expMatch[1].trim() : ''
      };
    }
  }
  return null;
}

// Upload file to Jira issue
async function uploadAttachment(issueKey, filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  const fileName = path.basename(filePath);
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer]);
  const form = new FormData();
  form.append('file', blob, fileName);

  try {
    await axios.post(`${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}/attachments`, form, {
      headers: {
        Authorization: `Basic ${auth}`,
        'X-Atlassian-Token': 'no-check',
      },
      timeout: 30000,
    });
    console.log(`[OK] Đã đính kèm file ${fileName} lên Jira issue ${issueKey}`);
    return fileName;
  } catch (err) {
    console.error(`[WARN] Lỗi tải đính kèm lên Jira:`, err.response?.data || err.message);
    return null;
  }
}

// Send Telegram notification with optional image/document attachment
async function sendTelegramAlert(text, attachmentPath = null) {
  try {
    await sendTelegramPhoto(attachmentPath, text);
    console.log(`[OK] Đã gửi thông báo Bug đến Telegram thành công!`);
  } catch (err) {
    console.error('[WARN] Lỗi gửi thông báo Telegram:', err.message);
  }
}

async function createJiraBug({
  parentKey,
  summary,
  precondition,
  steps,
  actual,
  expected,
  attachment,
  desc,
  testFilter
}) {
  try {
    console.log(`[LOG] Đang kiểm tra cấu hình Issue Type trên Jira...`);
    const issueTypeName = await getValidIssueType();
    console.log(`[LOG] Sử dụng Issue Type: "${issueTypeName}" cho Project ${JIRA_PROJECT_KEY}`);

    // Giữ nguyên format title do người dùng hoặc agent đặt (ví dụ: [Search] ...)
    const finalSummary = summary.trim();

    // Tự động tìm Playwright screenshot mới nhất nếu không truyền file cụ thể hoặc file không tồn tại
    let resolvedAttachment = attachment;
    if (!resolvedAttachment || resolvedAttachment === 'auto' || !fs.existsSync(resolvedAttachment)) {
      const autoShot = getLatestPlaywrightScreenshot(testFilter || parentKey);
      if (autoShot) {
        resolvedAttachment = autoShot;
        console.log(`[LOG] Tự động lấy screenshot Playwright thất bại: ${resolvedAttachment}`);
      }
    }

    // Build ADF description
    const adfContent = [];
    if (precondition) {
      adfContent.push(...makeAdfSection('📌 Precondition', precondition));
    }
    if (steps) {
      adfContent.push(...makeAdfSteps('👣 Steps to Reproduce', steps));
    }
    if (actual) {
      adfContent.push(...makeAdfSection('❌ Actual Result', actual));
    }
    if (expected) {
      adfContent.push(...makeAdfSection('✅ Expected Result', expected));
    }
    if (resolvedAttachment) {
      adfContent.push(...makeAdfSection('📎 Attachment', path.basename(resolvedAttachment)));
    }
    if (desc && !steps && !actual && !expected) {
      adfContent.push(...makeAdfSection('📋 Description', desc));
    }

    const payload = {
      fields: {
        project: {
          key: JIRA_PROJECT_KEY
        },
        summary: finalSummary,
        description: {
          type: "doc",
          version: 1,
          content: adfContent.length > 0 ? adfContent : [
            {
              type: "paragraph",
              content: [{ type: "text", text: desc || summary }]
            }
          ]
        },
        issuetype: {
          name: issueTypeName
        },
        labels: ["bug", "automation-failure"]
      }
    };

    console.log(`[LOG] Đang tạo Bug trên Jira liên kết với ${parentKey || 'N/A'}...`);
    const response = await axios.post(`${JIRA_BASE_URL}/rest/api/3/issue`, payload, { headers });
    const newBugKey = response.data.key;
    const bugUrl = `${JIRA_BASE_URL}/browse/${newBugKey}`;
    console.log(`[OK] Đã tạo thành công Bug: ${newBugKey} (${bugUrl})`);

    // Link the new bug to the parent story (Blocks / Relates)
    if (parentKey) {
      try {
        await axios.post(`${JIRA_BASE_URL}/rest/api/3/issueLink`, {
          type: { name: "Blocks" },
          inwardIssue: { key: newBugKey },
          outwardIssue: { key: parentKey }
        }, { headers });
        console.log(`[OK] Đã link ${newBugKey} -> blocks -> ${parentKey}`);
      } catch(linkErr) {
        console.log(`[WARN] Không thể link issue: ${linkErr.response?.data?.errorMessages || linkErr.message}`);
      }
    }

    // Upload attachment to Jira issue if provided or auto-detected
    if (resolvedAttachment && fs.existsSync(resolvedAttachment)) {
      await uploadAttachment(newBugKey, resolvedAttachment);
    }

    // Format message for Telegram
    let tgMsg = 
      `🚨 <b>[PHÁT HIỆN APPLICATION BUG TRÊN UI]</b>\n\n` +
      `🎯 <b>User Story:</b> <code>${parentKey || 'N/A'}</code>\n` +
      `🐛 <b>Mã Bug:</b> <a href="${bugUrl}"><b>${newBugKey}</b></a>\n` +
      `📝 <b>Tiêu đề:</b> ${escapeHtml(finalSummary)}\n\n`;

    if (precondition) tgMsg += `📌 <b>Precondition:</b>\n${escapeHtml(normalizeText(precondition))}\n\n`;
    if (steps) tgMsg += `👣 <b>Steps to Reproduce:</b>\n${escapeHtml(normalizeText(steps))}\n\n`;
    if (actual) tgMsg += `❌ <b>Actual Result:</b>\n${escapeHtml(normalizeText(actual))}\n\n`;
    if (expected) tgMsg += `✅ <b>Expected Result:</b>\n${escapeHtml(normalizeText(expected))}\n\n`;
    if (resolvedAttachment) tgMsg += `📎 <b>Attachment:</b> ${escapeHtml(path.basename(resolvedAttachment))}\n\n`;
    tgMsg += `🔗 <b>Xem trên Jira:</b> ${bugUrl}`;

    await sendTelegramAlert(tgMsg, resolvedAttachment);

    return newBugKey;
  } catch (error) {
    console.error('[ERROR] Lỗi tạo Jira Bug:', error.response ? JSON.stringify(error.response.data) : error.message);
  }
}

// Parse arguments
const argv = parseArgs(process.argv.slice(2));
let params = {
  parentKey: argv.parent || '',
  summary: argv.summary || '',
  precondition: argv.precondition || '',
  steps: argv.steps || '',
  actual: argv.actual || '',
  expected: argv.expected || '',
  attachment: argv.attachment || '',
  desc: argv.desc || '',
  testFilter: argv.test || argv.filter || '',
  tcId: argv.tc || '',
  tcFile: argv.tcfile || ''
};

// Tự động đồng bộ từ file Test Case Markdown nếu có chỉ định --tc
if (params.tcId) {
  const defaultTcFile = path.resolve(process.cwd(), `test-cases/${params.parentKey}_testcases.md`);
  const tcFilePath = params.tcFile || defaultTcFile;
  const parsedTc = parseTestCaseFile(tcFilePath, params.tcId);

  if (parsedTc) {
    console.log(`[VALIDATE] Đã nạp thành công dữ liệu từ Test Case: ${params.tcId}`);
    if (!params.precondition && parsedTc.precondition) {
      params.precondition = parsedTc.precondition;
    }
    if (!params.steps && parsedTc.steps) {
      params.steps = parsedTc.steps;
    }
    if (!params.expected && parsedTc.expected) {
      params.expected = parsedTc.expected;
    }
    if (!params.testFilter) {
      params.testFilter = params.tcId;
    }
    if (!params.summary) {
      params.summary = `[Search] ${parsedTc.header}`;
    }
  } else {
    console.warn(`[WARN] Không tìm thấy Test Case "${params.tcId}" trong ${tcFilePath}`);
  }
}

if (!params.summary) {
  console.error('Usage: node jira_create_bug.js --parent <KEY> --summary "<TITLE>" [--tc "<TC_ID>"] [--precondition "<PRE>"] [--steps "<STEPS>"] [--actual "<ACTUAL>"] [--expected "<EXPECTED>"] [--attachment "<FILE>|auto"] [--test "<FILTER>"]');
  process.exit(1);
}

createJiraBug(params);
