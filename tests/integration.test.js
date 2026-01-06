#!/usr/bin/env node

/**
 * Integration Test Suite
 * Tests the complete setup workflow
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DirectusClient } from '../src/lib/client.js';
import { logger } from '../src/lib/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const testSuite = {
  name: 'Integration Tests',
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
testSuite.test('Collections schema file exists and is valid JSON', async () => {
  const schemaPath = path.resolve(__dirname, '../src/config/collections.json');
  
  try {
    const content = await fs.readFile(schemaPath, 'utf8');
    const schema = JSON.parse(content);
    
    if (!schema.collections || !Array.isArray(schema.collections)) {
      throw new Error('Schema does not contain collections array');
    }
    
    if (schema.collections.length === 0) {
      throw new Error('Collections array is empty');
    }
  } catch (error) {
    throw new Error(`Failed to load schema: ${error.message}`);
  }
});

testSuite.test('Collections schema has required collections', async () => {
  const schemaPath = path.resolve(__dirname, '../src/config/collections.json');
  const content = await fs.readFile(schemaPath, 'utf8');
  const schema = JSON.parse(content);
  
  const requiredCollections = ['courses', 'lessons', 'problems', 'ai_prompts'];
  const collectionNames = schema.collections.map(c => c.collection);
  
  for (const required of requiredCollections) {
    if (!collectionNames.includes(required)) {
      throw new Error(`Missing required collection: ${required}`);
    }
  }
});

testSuite.test('Each collection has required metadata', async () => {
  const schemaPath = path.resolve(__dirname, '../src/config/collections.json');
  const content = await fs.readFile(schemaPath, 'utf8');
  const schema = JSON.parse(content);
  
  for (const collection of schema.collections) {
    if (!collection.collection) throw new Error('Collection missing "collection" property');
    if (!collection.meta) throw new Error(`Collection ${collection.collection} missing meta`);
    if (!collection.fields || !Array.isArray(collection.fields)) {
      throw new Error(`Collection ${collection.collection} has invalid fields`);
    }
  }
});

testSuite.test('All required source directories exist', async () => {
  const requiredDirs = ['../src/lib', '../src/config', '../src/data'];
  
  for (const dir of requiredDirs) {
    try {
      const dirPath = path.resolve(__dirname, dir);
      const stat = await fs.stat(dirPath);
      if (!stat.isDirectory()) {
        throw new Error(`${dir} is not a directory`);
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Missing directory: ${dir}`);
      }
      throw error;
    }
  }
});

testSuite.test('Verify script file exists and is readable', async () => {
  // Don't actually import, just check the file exists
  // because importing will execute the main() function
  const verifyPath = path.resolve(__dirname, '../src/verify-setup.js');
  try {
    const content = await fs.readFile(verifyPath, 'utf8');
    if (!content.includes('DirectusClient') || !content.includes('main')) {
      throw new Error('verify-setup.js has unexpected content');
    }
  } catch (error) {
    throw new Error(`Cannot read verify-setup.js: ${error.message}`);
  }
});

testSuite.test('Config directory exists', async () => {
  const configPath = path.resolve(__dirname, '../src/config');
  
  try {
    const stat = await fs.stat(configPath);
    if (!stat.isDirectory()) {
      throw new Error('Config path is not a directory');
    }
  } catch (error) {
    throw new Error(`Config directory check failed: ${error.message}`);
  }
});

testSuite.test('Lib directory exists with required files', async () => {
  const libPath = path.resolve(__dirname, '../src/lib');
  const requiredFiles = ['auth.js', 'client.js', 'logger.js'];
  
  try {
    for (const file of requiredFiles) {
      const filePath = path.join(libPath, file);
      await fs.access(filePath);
    }
  } catch (error) {
    throw new Error(`Missing required lib file: ${error.message}`);
  }
});

// Run tests
const success = await testSuite.run();
process.exit(success ? 0 : 1);
