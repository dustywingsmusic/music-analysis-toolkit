/**
 * Comprehensive Modal Test Case Generator (Test Harness)
 *
 * Relocated to tests/scripts. Writes JSON to tests/generated so it can be
 * auto-regenerated on every test run and excluded from version control.
 */

const fs = require('fs');
const path = require('path');

// Import the existing generator implementation from the legacy location
// to avoid code duplication while we complete the migration.
const legacy = require('../../generate-comprehensive-test-cases.cjs');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function main() {
  const outDir = path.resolve(__dirname, '../generated');
  const outFile = path.join(outDir, 'comprehensive-modal-test-cases.json');
  ensureDir(outDir);

  // Use legacy to generate fresh cases and then serialize using its export method
  const generatorExport = legacy.exportComprehensiveTestCases || legacy.generateComprehensiveTestCases;

  if (!generatorExport) {
    throw new Error('Unable to load generator functions from legacy generator.');
  }

  // If we only have generateComprehensiveTestCases, we need to build the JSON
  if (legacy.exportComprehensiveTestCases) {
    const cases = legacy.exportComprehensiveTestCases(); // returns array of cases
    const json = JSON.stringify({
      metadata: {
        generated: new Date().toISOString(),
        totalCases: cases.length,
        categories: cases.reduce((acc, tc) => {
          acc[tc.category] = (acc[tc.category] || 0) + 1; return acc;
        }, {})
      },
      testCases: cases
    }, null, 2);
    fs.writeFileSync(outFile, json);
  } else {
    const cases = legacy.generateComprehensiveTestCases();
    const json = JSON.stringify({
      metadata: {
        generated: new Date().toISOString(),
        totalCases: cases.length,
        categories: cases.reduce((acc, tc) => {
          acc[tc.category] = (acc[tc.category] || 0) + 1; return acc;
        }, {})
      },
      testCases: cases
    }, null, 2);
    fs.writeFileSync(outFile, json);
  }

  console.log(`Generated test cases at ${outFile}`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
