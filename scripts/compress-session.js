#!/usr/bin/env node

/**
 * CLI Context Manager - Session Compressor
 *
 * Compresses AI CLI tool session files to prevent no-reply issues.
 *
 * Usage:
 *   node scripts/compress-session.js <session-file>
 *   node scripts/compress-session.js --compress-all
 *   node scripts/compress-session.js --tool cursor
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  session: null,
  compressAll: false,
  tool: null,
  keepMessages: 100,
  keepSystemLines: 5,
  noBackup: false,
  maxSizeKB: 500,
  maxLines: 300,
  force: false
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--session' || args[i] === '-s') {
    options.session = args[++i];
  } else if (args[i] === '--compress-all') {
    options.compressAll = true;
  } else if (args[i] === '--tool' || args[i] === '-t') {
    options.tool = args[++i];
  } else if (args[i] === '--keep-messages' || args[i] === '-m') {
    options.keepMessages = parseInt(args[++i]);
  } else if (args[i] === '--keep-system') {
    options.keepSystemLines = parseInt(args[++i]);
  } else if (args[i] === '--no-backup') {
    options.noBackup = true;
  } else if (args[i] === '--max-size') {
    options.maxSizeKB = parseInt(args[++i]);
  } else if (args[i] === '--max-lines') {
    options.maxLines = parseInt(args[++i]);
  } else if (args[i] === '--force' || args[i] === '-f') {
    options.force = true;
  } else if (!args[i].startsWith('-')) {
    // Positional argument: session file
    options.session = args[i];
  }
}

// Load config
let config = null;
try {
  const configPath = path.join(__dirname, '..', 'CONFIG.json');
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (err) {
  // Config is optional
}

// Apply config defaults if not overridden
if (config && !options.maxSizeKB) {
  options.maxSizeKB = config.thresholds?.maxSizeKB || 500;
}
if (config && !options.maxLines) {
  options.maxLines = config.thresholds?.maxLines || 300;
}
if (config && !options.keepMessages) {
  options.keepMessages = config.compression?.keepMessages || 100;
}
if (config && !options.keepSystemLines) {
  options.keepSystemLines = config.compression?.keepSystemLines || 5;
}

// Statistics
const stats = {
  checked: 0,
  compressed: 0,
  skipped: 0,
  totalSavedKB: 0,
  errors: []
};

/**
 * Expand ~ to home directory
 */
function expandPath(p) {
  return p.replace(/^~/, os.homedir());
}

/**
 * Compress a single session file
 */
function compressSession(sessionPath, tool = 'unknown') {
  stats.checked++;

  const fileName = path.basename(sessionPath);

  // Check if file exists
  if (!fs.existsSync(sessionPath)) {
    console.error(`❌ File not found: ${sessionPath}`);
    stats.errors.push(`File not found: ${sessionPath}`);
    return;
  }

  // Get file info
  const stats_info = fs.statSync(sessionPath);
  const fileSizeKB = stats_info.size / 1024;
  const content = fs.readFileSync(sessionPath, 'utf8');
  const lines = content.split('\n').filter(l => l.trim());

  // Calculate required lines
  const requiredLines = options.keepSystemLines + options.keepMessages;

  // Check if compression is needed
  let needsCompression = false;

  if (options.force) {
    needsCompression = true;
  } else if (fileSizeKB > options.maxSizeKB || lines.length > options.maxLines) {
    needsCompression = true;
  } else if (lines.length > requiredLines) {
    needsCompression = true;
  }

  if (!needsCompression) {
    console.log(`  ✓ ${fileName} (${lines.length} lines, ${fileSizeKB.toFixed(2)} KB)`);
    stats.skipped++;
    return;
  }

  console.log(`\n${fileName} [${tool}]`);
  console.log(`  Current: ${lines.length} lines, ${fileSizeKB.toFixed(2)} KB`);

  // Create backup
  const backupPath = `${sessionPath}.backup`;
  if (!options.noBackup) {
    try {
      fs.copyFileSync(sessionPath, backupPath);
      console.log('  ✓ Backup created');
    } catch (err) {
      console.error(`  ❌ Failed to create backup: ${err.message}`);
      stats.errors.push(`Backup failed: ${sessionPath}`);
      return;
    }
  }

  // Compress
  try {
    let keepLines = lines.slice(0, options.keepSystemLines);
    let lastMessages = lines.slice(-options.keepMessages);

    // Handle edge cases
    if (lines.length < options.keepSystemLines) {
      keepLines = lines;
      lastMessages = [];
    }

    const availableMessages = lines.length - options.keepSystemLines;
    if (availableMessages < options.keepMessages) {
      lastMessages = lines.slice(options.keepSystemLines);
    }

    const compressed = [...keepLines];
    if (lastMessages.length > 0) {
      compressed.push(...lastMessages);
    }

    // Remove duplicates when overlapping
    const uniqueCompressed = [...new Set(compressed)];

    // Write compressed content
    const newContent = uniqueCompressed.join('\n') + '\n';
    fs.writeFileSync(sessionPath, newContent, 'utf8');

    // Calculate savings
    const newStats = fs.statSync(sessionPath);
    const newSizeKB = newStats.size / 1024;
    const savedKB = fileSizeKB - newSizeKB;
    stats.totalSavedKB += savedKB;

    console.log(`  Compressed: ${lines.length} → ${uniqueCompressed.length} lines`);
    console.log(`  Size: ${fileSizeKB.toFixed(2)} KB → ${newSizeKB.toFixed(2)} KB`);
    if (savedKB > 0) {
      console.log(`  Saved: ${savedKB.toFixed(2)} KB`);
    }

    stats.compressed++;

    // Clean up backup after short delay
    if (!options.noBackup) {
      setTimeout(() => {
        if (fs.existsSync(backupPath)) {
          fs.unlinkSync(backupPath);
        }
      }, 500);
    }

  } catch (err) {
    console.error(`  ❌ Compression failed: ${err.message}`);
    stats.errors.push(`Compression failed: ${sessionPath}`);

    // Restore from backup if available
    if (fs.existsSync(backupPath)) {
      console.log('  ↩️  Restoring from backup...');
      fs.copyFileSync(backupPath, sessionPath);
    }
  }
}

/**
 * Find session files for a tool
 */
function findToolSessions(tool) {
  const toolDirs = {
    cursor: path.join(os.homedir(), '.cursor', 'sessions'),
    aider: path.join(os.homedir(), '.aider', 'sessions'),
    'claude-code': path.join(os.homedir(), '.claude', 'sessions'),
    openclaw: path.join(os.homedir(), '.openclaw', 'agents', 'main', 'sessions')
  };

  const dir = toolDirs[tool];
  if (!dir) {
    console.error(`Unknown tool: ${tool}`);
    return [];
  }

  const expandedDir = expandPath(dir);
  if (!fs.existsSync(expandedDir)) {
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
  const toolDirs = {
    cursor: path.join(os.homedir(), '.cursor', 'sessions'),
    aider: path.join(os.homedir(), '.aider', 'sessions'),
    'claude-code': path.join(os.homedir(), '.claude', 'sessions'),
    openclaw: path.join(os.homedir(), '.openclaw', 'agents', 'main', 'sessions')
  };

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

// Main
async function main() {
  console.log('=== CLI Context Manager - Session Compressor ===');
  console.log('');

  console.log('Configuration:');
  console.log(`  Max size: ${options.maxSizeKB} KB`);
  console.log(`  Max lines: ${options.maxLines}`);
  console.log(`  Keep messages: ${options.keepMessages}`);
  console.log(`  Keep system: ${options.keepSystemLines}`);
  console.log(`  Backup: ${options.noBackup ? 'No' : 'Yes'}`);
  console.log(`  Force: ${options.force}`);
  console.log('');

  if (options.session) {
    // Compress specific session
    const sessionPath = expandPath(options.session);
    compressSession(sessionPath, 'custom');
  } else if (options.compressAll) {
    // Compress all sessions
    const allSessions = findAllSessions();
    if (allSessions.length === 0) {
      console.log('No sessions found to compress.');
      return;
    }

    console.log(`Found ${allSessions.length} session(s) to check\n`);

    for (const s of allSessions) {
      compressSession(s.path, s.tool);
    }
  } else if (options.tool) {
    // Compress sessions for specific tool
    const sessions = findToolSessions(options.tool);
    if (sessions.length === 0) {
      console.log(`No sessions found for tool: ${options.tool}`);
      return;
    }

    console.log(`Found ${sessions.length} session(s) for ${options.tool}\n`);

    for (const s of sessions) {
      compressSession(s, options.tool);
    }
  } else {
    // No action specified
    console.log('No action specified. Use one of:');
    console.log('  node scripts/compress-session.js <session-file>');
    console.log('  node scripts/compress-session.js --compress-all');
    console.log('  node scripts/compress-session.js --tool <tool-name>');
    console.log('');
    console.log('Run with --help for more options.');
    return;
  }

  // Print summary
  console.log('\n=== Summary ===');
  console.log(`Checked: ${stats.checked}`);
  console.log(`Compressed: ${stats.compressed}`);
  console.log(`Skipped: ${stats.skipped}`);
  if (stats.totalSavedKB > 0) {
    console.log(`Total saved: ${stats.totalSavedKB.toFixed(2)} KB`);
  }
  if (stats.errors.length > 0) {
    console.log(`Errors: ${stats.errors.length}`);
    stats.errors.forEach(err => console.log(`  - ${err}`));
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
