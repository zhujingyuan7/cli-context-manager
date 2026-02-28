#!/usr/bin/env node

/**
 * CLI Context Manager - Session Health Checker
 *
 * Checks the health of AI CLI tool sessions and provides recommendations.
 *
 * Usage:
 *   node scripts/check-session-health.js
 *   node scripts/check-session-health.js --session ~/.cursor/sessions/session.jsonl
 *   node scripts/check-session-health.js --tool cursor
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  session: null,
  tool: null,
  verbose: false
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--session' || args[i] === '-s') {
    options.session = args[++i];
  } else if (args[i] === '--tool' || args[i] === '-t') {
    options.tool = args[++i];
  } else if (args[i] === '--verbose' || args[i] === '-v') {
    options.verbose = true;
  }
}

// Load config
let config = null;
try {
  const configPath = path.join(__dirname, '..', 'CONFIG.json');
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (err) {
  console.warn('Could not load CONFIG.json:', err.message);
}

// Apply defaults
const thresholds = {
  maxSizeKB: config?.thresholds?.maxSizeKB || 500,
  maxLines: config?.thresholds?.maxLines || 300
};

// Tool session directories
const toolDirs = {
  'claude-code': path.join(os.homedir(), '.claude', 'sessions'),
  aider: path.join(os.homedir(), '.aider', 'sessions'),
  codex: path.join(os.homedir(), '.codex', 'sessions'),
  'gemini-cli': path.join(os.homedir(), '.gemini-cli', 'sessions'),
  opencode: path.join(os.homedir(), '.opencode', 'sessions')
};

/**
 * Expand ~ to home directory
 */
function expandPath(p) {
  return p.replace(/^~/, os.homedir());
}

/**
 * Get session info
 */
function getSessionInfo(sessionPath) {
  try {
    const stats = fs.statSync(sessionPath);
    const lines = fs.readFileSync(sessionPath, 'utf8').split('\n').filter(l => l.trim());
    const fileSizeKB = stats.size / 1024;

    return {
      path: sessionPath,
      size: stats.size,
      sizeKB: fileSizeKB,
      lines: lines.length,
      lastModified: stats.mtime,
      needsCompression: fileSizeKB > thresholds.maxSizeKB || lines.length > thresholds.maxLines,
      reason: fileSizeKB > thresholds.maxSizeKB ? 'size' :
              lines.length > thresholds.maxLines ? 'lines' : null
    };
  } catch (err) {
    console.error(`Error reading ${sessionPath}:`, err.message);
    return null;
  }
}

/**
 * Find session files for a tool
 */
function findToolSessions(tool) {
  const dir = toolDirs[tool];
  if (!dir) {
    console.error(`Unknown tool: ${tool}`);
    return [];
  }

  const expandedDir = expandPath(dir);
  if (!fs.existsSync(expandedDir)) {
    console.log(`Session directory not found: ${expandedDir}`);
    return [];
  }

  const sessions = fs.readdirSync(expandedDir)
    .filter(f => f.endsWith('.jsonl'))
    .map(f => path.join(expandedDir, f));

  return sessions;
}

/**
 * Find all session files
 */
function findAllSessions() {
  const allSessions = [];

  for (const [tool, dir] of Object.entries(toolDirs)) {
    const expandedDir = expandPath(dir);
    if (fs.existsSync(expandedDir)) {
      const sessions = fs.readdirSync(expandedDir)
        .filter(f => f.endsWith('.jsonl'))
        .map(f => ({
          path: path.join(expandedDir, f),
          tool: tool
        }));

      allSessions.push(...sessions);
    }
  }

  return allSessions;
}

/**
 * Print session info
 */
function printSessionInfo(session, tool = 'unknown') {
  const name = path.basename(session.path);
  const sizeStr = session.sizeKB.toFixed(2).padStart(10) + ' KB';
  const linesStr = session.lines.toString().padStart(6) + ' lines';

  if (session.needsCompression) {
    const reason = session.reason === 'size' ? '⚠️  Too large' : '⚠️  Too many lines';
    console.log(`\n${name} [${tool}]`);
    console.log(`  ${sizeStr} | ${linesStr}`);
    console.log(`  Status: ${reason}`);
    console.log(`  Last modified: ${session.lastModified.toLocaleString()}`);
  } else if (options.verbose) {
    console.log(`\n${name} [${tool}]`);
    console.log(`  ${sizeStr} | ${linesStr}`);
    console.log(`  Status: ✅ OK`);
  }
}

/**
 * Print summary
 */
function printSummary(sessions) {
  const totalSize = sessions.reduce((sum, s) => sum + s.size, 0);
  const totalLines = sessions.reduce((sum, s) => sum + s.lines, 0);
  const needCompression = sessions.filter(s => s.needsCompression).length;

  console.log('\n=== Summary ===');
  console.log(`Total sessions: ${sessions.length}`);
  console.log(`Total size: ${(totalSize / 1024).toFixed(2)} KB`);
  console.log(`Total lines: ${totalLines}`);
  console.log(`Need compression: ${needCompression}`);

  if (needCompression > 0) {
    console.log('\nRecommendation:');
    console.log('  Run compression to optimize sessions:');
    console.log(`  node scripts/compress-session.js --compress-all`);
  } else {
    console.log('\n✅ All sessions are healthy!');
  }
}

// Main
async function main() {
  console.log('=== CLI Context Manager - Session Health Check ===\n');

  let sessions = [];

  if (options.session) {
    // Check specific session
    const sessionPath = expandPath(options.session);
    const info = getSessionInfo(sessionPath);
    if (info) {
      sessions.push({ info, tool: 'custom' });
    }
  } else if (options.tool) {
    // Check specific tool
    const sessionPaths = findToolSessions(options.tool);
    for (const p of sessionPaths) {
      const info = getSessionInfo(p);
      if (info) {
        sessions.push({ info, tool: options.tool });
      }
    }
  } else {
    // Check all tools
    const allSessions = findAllSessions();
    for (const s of allSessions) {
      const info = getSessionInfo(s.path);
      if (info) {
        sessions.push({ info, tool: s.tool });
      }
    }
  }

  if (sessions.length === 0) {
    console.log('No sessions found.');
    return;
  }

  console.log(`Checking ${sessions.length} session(s)...`);

  // Print session info
  sessions.forEach(s => printSessionInfo(s.info, s.tool));

  // Print summary
  printSummary(sessions.map(s => s.info));
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
