/**
 * Unified Jira API Client & Helpers
 */

const fs = require('fs');
const path = require('path');

// Auto-load .env if needed
if (!process.env.JIRA_BASE_URL || !process.env.JIRA_EMAIL || !process.env.JIRA_API_TOKEN) {
  const rootEnv = path.resolve(__dirname, '../../.env');
  if (fs.existsSync(rootEnv)) {
    try {
      require('dotenv').config({ path: rootEnv });
    } catch (e) {}
  }
}

function getJiraConfig() {
  return {
    baseUrl: (process.env.JIRA_BASE_URL || '').replace(/\/+$/, ''),
    email: process.env.JIRA_EMAIL,
    apiToken: process.env.JIRA_API_TOKEN,
    pat: process.env.JIRA_PAT,
    projectKey: process.env.JIRA_PROJECT_KEY || 'SCRUM',
  };
}

function getJiraHeaders() {
  const { email, apiToken, pat } = getJiraConfig();
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (pat) {
    headers.Authorization = `Bearer ${pat}`;
  } else if (email && apiToken) {
    const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
    headers.Authorization = `Basic ${auth}`;
  }

  return headers;
}

/**
 * Extracts linked Bug issue keys from a Jira Story issue object
 * @param {object} issue
 * @returns {string[]} Array of linked bug keys (e.g. ['SCRUM-20', 'SCRUM-21'])
 */
function extractLinkedBugs(issue) {
  const linkedBugs = [];
  if (issue && issue.fields && Array.isArray(issue.fields.issuelinks)) {
    for (const link of issue.fields.issuelinks) {
      const linked = link.inwardIssue || link.outwardIssue;
      if (linked && linked.fields && linked.fields.issuetype && linked.fields.issuetype.name === 'Bug') {
        linkedBugs.push(linked.key);
      }
    }
  }
  return linkedBugs;
}

/**
 * Search Jira issues via JQL
 * @param {string} jql
 * @param {object} options
 * @returns {Promise<Array>}
 */
async function searchJira(jql, options = {}) {
  const { baseUrl } = getJiraConfig();
  const headers = getJiraHeaders();
  const params = new URLSearchParams({
    jql,
    maxResults: String(options.maxResults || 15),
    fields: options.fields || 'summary,updated,status,creator,issuelinks',
  });

  const url = `${baseUrl}/rest/api/3/search/jql?${params.toString()}`;
  const res = await fetch(url, { method: 'GET', headers });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Jira API error ${res.status}: ${errText}`);
  }
  const data = await res.json();
  return data.issues || [];
}

module.exports = {
  getJiraConfig,
  getJiraHeaders,
  extractLinkedBugs,
  searchJira,
};
