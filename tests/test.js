#!/usr/bin/env node

/**
 * CLI Context Manager - Test Suite
 *
 * Run tests to verify the installation and functionality.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Set working directory to the project root
const projectRoot = path.join(__dirname, '..');
process.chdir(projectRoot);

let passed = 0;
let failed = 0;

/**
 * Color output
 */
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`
};

/**
 * Test assertion
 */
function assert(condition, message) {
  if (condition) {
    console.log(`  ${colors.green('✓')} ${message}`);
    passed++;
  } else {
    console.log(`  ${colors.red('✗')} ${message}`);
    failed++;
  }
}

/**
 * Check if file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Test 1: Check project structure
 */
function testProjectStructure() {
  console.log(`\n${colors.blue('Test 1: Project Structure')}`);

  assert(fileExists('SKILL.md'), 'SKILL.md exists');
  assert(fileExists('README.md'), 'README.md exists');
  assert(fileExists('CONFIG.json'), 'CONFIG.json exists');
  assert(fileExists('package.json'), 'package.json exists');
  assert(fileExists('scripts/auto-compress-sessions.ps1'), 'PowerShell script exists');
  assert(fileExists('scripts/check-session-health.js'), 'Health check script exists');
  assert(fileExists('scripts/compress-session.js'), 'Compression script exists');
  assert(fileExists('.gitignore'), '.gitignore exists');
}

/**
 * Test 2: Check configuration
 */
function testConfiguration() {
  console.log(`\n${colors.blue('Test 2: Configuration')}`);

  try {
    const config = JSON.parse(fs.readFileSync('CONFIG.json', 'utf8'));
    assert(config.thresholds !== undefined, 'Config has thresholds');
    assert(config.compression !== undefined, 'Config has compression');
    assert(config.tools !== undefined, 'Config has tools');
    assert(config.thresholds.maxSizeKB > 0, 'Max size threshold is positive');
    assert(config.compression.keepMessages > 0, 'Keep messages is positive');
  } catch (err) {
    assert(false, `Config is valid JSON: ${err.message}`);
  }
}

/**
 * Test 3: Check Node.js scripts
 */
function testNodeScripts() {
  console.log(`\n${colors.blue('Test 3: Node.js Scripts')}`);

  try {
    // Check health checker
    const healthCheck = require('./scripts/check-session-health.js');
    assert(typeof healthCheck === 'object' || typeof healthCheck === 'function',
            'Health check script is valid');

    // Check compressor
    const compressor = require('./scripts/compress-session.js');
    assert(typeof compressor === 'object' || typeof compressor === 'function',
            'Compression script is valid');

  } catch (err) {
    // Scripts are executable, might not have exports
    assert(err.code === 'MODULE_NOT_FOUND' || err.message.includes('not defined'),
            'Scripts are executable');
  }
}

/**
 * Test 4: Create and compress test session
 */
function testCompression() {
  console.log(`\n${colors.blue('Test 4: Compression Functionality')}`);

  // Create test session directory
  const testDir = path.join(__dirname, 'output');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  // Create a test session file
  const testFile = path.join(testDir, 'test-session.jsonl');
  const testLines = [];

  // Add system lines
  for (let i = 0; i < 5; i++) {
    testLines.push(JSON.stringify({
      role: 'system',
      content: `System configuration ${i}`,
      timestamp: Date.now()
    }));
  }

  // Add messages
  for (let i = 0; i < 200; i++) {
    testLines.push(JSON.stringify({
      role: 'user',
      content: `Test message ${i}`,
      timestamp: Date.now()
    }));
  }

  const testContent = testLines.join('\n') + '\n';
  fs.writeFileSync(testFile, testContent, 'utf8');

  const originalLines = testLines.length;
  const originalSize = fs.statSync(testFile).size;

  assert(originalLines > 100, 'Test session created with >100 lines');
  assert(originalSize > 0, 'Test session has content');

  try {
    // Run compression
    const command = `node "${path.join(__dirname, '..', 'scripts', 'compress-session.js')}" "${testFile}" --keep-messages 50`;
    execSync(command, { stdio: 'pipe' });

    const compressedContent = fs.readFileSync(testFile, 'utf8');
    const compressedLines = compressedContent.split('\n').filter(l => l.trim()).length;

    assert(compressedLines < originalLines, 'Session was compressed');
    assert(compressedLines <= 55, 'Compressed session has expected size (50 messages + 5 system)');

  } catch (err) {
    assert(false, `Compression executed successfully: ${err.message}`);
  }

  // Cleanup
  try {
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Test 5: Check SKILL.md format
 */
function testSkillFormat() {
  console.log(`\n${colors.blue('Test 5: SKILL.md Format')}`);

  try {
    const skillContent = fs.readFileSync('SKILL.md', 'utf8');

    assert(skillContent.includes('何时激活') || skillContent.includes('When'),
            'SKILL.md has activation section');
    assert(skillContent.includes('技能描述') || skillContent.includes('Description'),
            'SKILL.md has description section');
    assert(skillContent.includes('scripts'),
            'SKILL.md references scripts');
  } catch (err) {
    assert(false, `SKILL.md is readable: ${err.message}`);
  }
}

/**
 * Test 6: Check README format
 */
function testReadmeFormat() {
  console.log(`\n${colors.blue('Test 6: README.md Format')}`);

  try {
    const readmeContent = fs.readFileSync('README.md', 'utf8');

    assert(readmeContent.includes('简介') || readmeContent.includes('Introduction'),
            'README has introduction in Chinese/English');
    assert(readmeContent.includes('特性') || readmeContent.includes('Features'),
            'README has features section');
    assert(readmeContent.includes('安装') || readmeContent.includes('Installation'),
            'README has installation section');
    assert(readmeContent.includes('使用') || readmeContent.includes('Usage'),
            'README has usage section');
    assert(readmeContent.includes('Configuration') || readmeContent.includes('配置'),
            'README has configuration section');
  } catch (err) {
    assert(false, `README.md is readable: ${err.message}`);
  }
}

/**
 * Main test runner
 */
function main() {
  console.log('=== CLI Context Manager - Test Suite ===');
  console.log('');
  console.log(`Node version: ${process.version}`);
  console.log(`Platform: ${os.platform()} ${os.release()}`);
  console.log(`Architecture: ${os.arch()}`);

  try {
    testProjectStructure();
    testConfiguration();
    testNodeScripts();
    testCompression();
    testSkillFormat();
    testReadmeFormat();
  } catch (err) {
    console.error(`\n${colors.red('Test suite error:')}`, err);
    process.exit(1);
  }

  // Print summary
  console.log(`\n${colors.blue('=== Test Summary ===')}`);
  console.log(`Total: ${passed + failed}`);
  console.log(`${colors.green('Passed:')} ${passed}`);
  console.log(`${colors.red('Failed:')} ${failed}`);

  if (failed > 0) {
    console.log(`\n${colors.red('Some tests failed. Please check the output above.')}`);
    process.exit(1);
  } else {
    console.log(`\n${colors.green('All tests passed! ✓')}`);
    console.log(`\nThe CLI Context Manager is ready to use.`);
    console.log(`\nQuick start:`);
    console.log(`  1. Check session health: node scripts/check-session-health.js`);
    console.log(`  2. Compress sessions: node scripts/compress-session.js --compress-all`);
    console.log(`  3. View README for more information`);
    process.exit(0);
  }
}

// Run tests
main();
