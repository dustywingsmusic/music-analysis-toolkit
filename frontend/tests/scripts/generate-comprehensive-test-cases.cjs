/**
 * Comprehensive Modal Test Case Generator (relocated for tests)
 *
 * This script generates the JSON dataset used by the modal test suite.
 * Location: frontend/tests/scripts/generate-comprehensive-test-cases.cjs
 * Output:   frontend/tests/generated/comprehensive-modal-test-cases.json
 */

const fs = require('fs');
const path = require('path');

// Load the original generator implementation and adapt output path
// We import the class/functions by requiring the legacy file to avoid code duplication if necessary.
// However, to keep this file standalone, we embed the generator here by requiring the old module
// and delegating to its exported functions if available.

let implementation;
try {
  // If the legacy file still exists, require it so we can reuse its logic.
  implementation = require('../../generate-comprehensive-test-cases.cjs');
} catch (e) {
  implementation = null;
}

// If implementation exists and exposes exportComprehensiveTestCases, use it but override write path.
function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function exportToTargetPath(jsonString) {
  const outDir = path.resolve(__dirname, '../generated');
  ensureDirSync(outDir);
  const outPath = path.join(outDir, 'comprehensive-modal-test-cases.json');
  fs.writeFileSync(outPath, jsonString);
  return outPath;
}

function run() {
  // Case 1: reuse generator from legacy module if present
  if (implementation && typeof implementation.exportComprehensiveTestCases === 'function') {
    // Monkey-patch fs.writeFileSync temporarily to redirect the file path inside the legacy module
    const originalWrite = fs.writeFileSync;
    fs.writeFileSync = function (targetPath, data, options) {
      // Ignore the provided targetPath and write to our generated folder
      const outDir = path.resolve(__dirname, '../generated');
      ensureDirSync(outDir);
      const outPath = path.join(outDir, 'comprehensive-modal-test-cases.json');
      return originalWrite.call(fs, outPath, data, options);
    };
    try {
      implementation.exportComprehensiveTestCases();
    } finally {
      fs.writeFileSync = originalWrite;
    }
    return;
  }

  // Case 2: fallback — if legacy module not available, provide a minimal shim that fails clearly
  const message = [
    'Cannot find legacy generator implementation at frontend/generate-comprehensive-test-cases.cjs.',
    'Please keep the legacy file (as a thin wrapper) or port its generator class into this script.'
  ].join('\n');
  throw new Error(message);
}

if (require.main === module) {
  run();
}

module.exports = {
  run,
};
