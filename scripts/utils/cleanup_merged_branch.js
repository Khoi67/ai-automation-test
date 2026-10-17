/**
 * Cleanup Local Merged Branches Script
 * Tự động chuyển về main, pull code mới nhất và xóa sạch các nhánh feature/fix local đã hoàn thành.
 */

const { execSync } = require('child_process');

function runCommand(cmd, ignoreError = false) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (err) {
    if (!ignoreError) {
      console.warn(`[WARN] Lệnh thất bại: ${cmd} (${err.message.trim()})`);
    }
    return '';
  }
}

function cleanupLocalBranches() {
  console.log('========================================================');
  console.log('  Git Local Branch Cleaner & Main Synchronizer');
  console.log('========================================================');

  // 1. Fetch & Prune từ remote
  console.log('[1/4] Đồng bộ danh sách nhánh từ remote (git fetch --prune)...');
  runCommand('git fetch --prune origin');

  // 2. Chuyển về nhánh main
  console.log('[2/4] Chuyển sang nhánh main (git checkout main)...');
  runCommand('git checkout main');

  // 3. Kéo mã nguồn mới nhất từ origin main
  console.log('[3/4] Kéo code mới nhất đã auto-merge về máy (git pull origin main)...');
  const pullOutput = runCommand('git pull origin main');
  console.log(pullOutput || 'Đã cập nhật mới nhất.');

  // 4. Tìm và xóa các nhánh local feat/* và fix/*
  console.log('[4/4] Quét và xóa các nhánh feature/fix đã hoàn tất tại local...');
  const branchListRaw = runCommand('git branch --format="%(refname:short)"');
  const branches = branchListRaw.split('\n').map(b => b.trim()).filter(Boolean);

  let deletedCount = 0;
  for (const b of branches) {
    if (b.startsWith('feat/') || b.startsWith('fix/')) {
      console.log(` -> Xóa nhánh local: ${b}...`);
      runCommand(`git branch -D "${b}"`, true);
      deletedCount++;
    }
  }

  console.log('\n========================================================');
  if (deletedCount > 0) {
    console.log(`✅ [THÀNH CÔNG] Đã xóa ${deletedCount} nhánh feature/fix local và đồng bộ main sạch sẽ!`);
  } else {
    console.log('✅ [HOÀN HẢO] Máy local đã ở nhánh main và không còn nhánh rác nào!');
  }
  console.log('========================================================\n');
}

if (require.main === module) {
  cleanupLocalBranches();
}

module.exports = { cleanupLocalBranches };
