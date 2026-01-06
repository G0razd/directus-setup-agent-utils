#!/usr/bin/env node

/**
 * Unit Tests for Logger
 * Tests color output and logging functionality
 */

import { logger } from '../src/lib/logger.js';

const testSuite = {
  name: 'Logger Tests',
  tests: [],
  
  test(description, fn) {
    this.tests.push({ description, fn });
  },
  
  async run() {
    logger.info(`\n📋 Running ${this.name}...\n`);
    let passed = 0;
    let failed = 0;
    
    for (const test of this.tests) {
      try {
        await test.fn();
        logger.success(`✓ ${test.description}`);
        passed++;
      } catch (error) {
        logger.error(`✗ ${test.description}`);
        logger.error(`  ${error.message}`);
        failed++;
      }
    }
    
    logger.info(`\n${passed} passed, ${failed} failed\n`);
    return failed === 0;
  }
};

// Tests
testSuite.test('Logger has all required methods', () => {
  const methods = ['debug', 'info', 'success', 'warn', 'error', 'section', 'table'];
  
  for (const method of methods) {
    if (typeof logger[method] !== 'function') {
      throw new Error(`Missing logger method: ${method}`);
    }
  }
});

testSuite.test('Logger.info prints without error', () => {
  try {
    logger.info('Test info message');
  } catch (error) {
    throw new Error(`logger.info failed: ${error.message}`);
  }
});

testSuite.test('Logger.success prints without error', () => {
  try {
    logger.success('Test success message');
  } catch (error) {
    throw new Error(`logger.success failed: ${error.message}`);
  }
});

testSuite.test('Logger.error prints without error', () => {
  try {
    logger.error('Test error message');
  } catch (error) {
    throw new Error(`logger.error failed: ${error.message}`);
  }
});

testSuite.test('Logger.warn prints without error', () => {
  try {
    logger.warn('Test warning message');
  } catch (error) {
    throw new Error(`logger.warn failed: ${error.message}`);
  }
});

testSuite.test('Logger.section prints without error', () => {
  try {
    logger.section('Test section');
  } catch (error) {
    throw new Error(`logger.section failed: ${error.message}`);
  }
});

testSuite.test('Logger.table handles array of objects', () => {
  try {
    const data = [
      { name: 'Item 1', status: 'active' },
      { name: 'Item 2', status: 'inactive' }
    ];
    logger.table(data);
  } catch (error) {
    throw new Error(`logger.table failed: ${error.message}`);
  }
});

// Run tests
const success = await testSuite.run();
process.exit(success ? 0 : 1);
