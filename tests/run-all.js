#!/usr/bin/env node

/**
 * Test Runner
 * Executes all test suites and reports results
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { logger } from '../src/lib/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runTest(testFile) {
  return new Promise((resolve) => {
    const testPath = path.join(__dirname, testFile);
    const proc = spawn('node', [testPath], { 
      stdio: 'inherit',
      cwd: __dirname
    });
    
    proc.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

async function main() {
  logger.section('🧪 Running All Tests');
  
  const tests = [
    'logger.test.js',
    'auth.test.js',
    'client.test.js',
    'integration.test.js'
  ];
  
  const results = [];
  
  for (const test of tests) {
    logger.info(`\n📂 Running ${test}...`);
    const success = await runTest(test);
    results.push({ test, success });
  }
  
  logger.section('📊 Test Results');
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  logger.table(results.map(r => ({
    'Test Suite': r.test,
    'Status': r.success ? '✓ PASS' : '✗ FAIL'
  })));
  
  logger.info(`\nTotal: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    logger.error('\n❌ Some tests failed!');
    process.exit(1);
  } else {
    logger.success('\n✅ All tests passed!');
    process.exit(0);
  }
}

main().catch(err => {
  logger.error(err.message);
  process.exit(1);
});
