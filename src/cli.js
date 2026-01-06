#!/usr/bin/env node

/**
 * Directus Setup CLI
 * Command-line interface with parameter support
 */

import { Command } from 'commander';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  await fs.readFile(path.join(__dirname, '../package.json'), 'utf8')
);

const program = new Command();

program
  .name('directus-setup')
  .description('Automated Directus collection setup and data population')
  .version(packageJson.version);

// Global options
program
  .option('--url <url>', 'Directus URL', process.env.DIRECTUS_URL || 'http://localhost:8055')
  .option('--token <token>', 'Directus access token', process.env.DIRECTUS_SETUP_TOKEN);

// Setup command (full setup)
program
  .command('setup')
  .description('Run complete setup: collections + data + verify')
  .action(async (options) => {
    const opts = program.opts();
    await runSetup(opts);
  });

// Collections command
program
  .command('collections')
  .description('Create collections from schema')
  .action(async () => {
    const opts = program.opts();
    await runCollections(opts);
  });

// Data command
program
  .command('data')
  .description('Populate collections with demo data')
  .action(async () => {
    const opts = program.opts();
    await runData(opts);
  });

// Verify command
program
  .command('verify')
  .description('Verify setup integrity')
  .action(async () => {
    const opts = program.opts();
    await runVerify(opts);
  });

// Backup command
program
  .command('backup')
  .description('Backup all collections to JSON')
  .option('--output <path>', 'Output directory', './backups')
  .action(async (cmdOptions) => {
    const opts = { ...program.opts(), ...cmdOptions };
    await runBackup(opts);
  });

// Clean command
program
  .command('clean')
  .description('Delete all collection data')
  .option('--confirm', 'Skip confirmation prompt')
  .action(async (cmdOptions) => {
    const opts = { ...program.opts(), ...cmdOptions };
    await runClean(opts);
  });

// Generate types command
program
  .command('generate-types')
  .description('Generate TypeScript types from Directus schema')
  .option('--output <path>', 'Output file path', './src/generated/directus-schema.ts')
  .action(async (cmdOptions) => {
    const opts = { ...program.opts(), ...cmdOptions };
    await runGenerateTypes(opts);
  });

/**
 * Run full setup
 */
async function runSetup(opts) {
  const { spawn } = await import('node:child_process');
  
  process.env.DIRECTUS_URL = opts.url;
  process.env.DIRECTUS_SETUP_TOKEN = opts.token;

  console.log('🚀 Starting complete Directus setup...\n');
  
  await runScript('main.js');
}

/**
 * Run collections creation
 */
async function runCollections(opts) {
  process.env.DIRECTUS_URL = opts.url;
  process.env.DIRECTUS_SETUP_TOKEN = opts.token;
  
  await runScript('create-collections.js');
}

/**
 * Run data population
 */
async function runData(opts) {
  process.env.DIRECTUS_URL = opts.url;
  process.env.DIRECTUS_SETUP_TOKEN = opts.token;
  
  await runScript('populate-data.js');
}

/**
 * Run verification
 */
async function runVerify(opts) {
  process.env.DIRECTUS_URL = opts.url;
  process.env.DIRECTUS_SETUP_TOKEN = opts.token;
  
  await runScript('verify-setup.js');
}

/**
 * Run backup
 */
async function runBackup(opts) {
  process.env.DIRECTUS_URL = opts.url;
  process.env.DIRECTUS_SETUP_TOKEN = opts.token;
  process.env.BACKUP_DIR = opts.output;
  
  await runScript('backup-collections.js');
}

/**
 * Run clean
 */
async function runClean(opts) {
  process.env.DIRECTUS_URL = opts.url;
  process.env.DIRECTUS_SETUP_TOKEN = opts.token;
  
  if (opts.confirm) {
    process.env.CONFIRM_CLEANUP = 'true';
  }
  
  await runScript('clean-collections.js');
}

/**
 * Run type generation
 */
async function runGenerateTypes(opts) {
  const { createDirectusClient } = await import('@abakus/directus-nextjs');
  
  if (!opts.token) {
    console.error('❌ Error: --token is required for type generation');
    process.exit(1);
  }
  
  console.log('🔄 Generating TypeScript types from Directus schema...');
  console.log(`   URL: ${opts.url}`);
  console.log(`   Output: ${opts.output}\n`);
  
  const client = createDirectusClient({
    url: opts.url,
    token: opts.token
  });
  
  try {
    // Fetch collections and fields
    const collections = await client.request('GET', '/collections');
    const fields = await client.request('GET', '/fields');
    
    const userCollections = collections.data.filter(c => !c.collection.startsWith('directus_'));
    
    console.log(`✓ Found ${userCollections.length} collections`);
    
    // Generate TypeScript code
    const code = generateTypeScriptCode(userCollections, fields.data);
    
    // Write to file
    const outputPath = path.resolve(opts.output);
    const outputDir = path.dirname(outputPath);
    
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(outputPath, code, 'utf8');
    
    console.log(`\n✅ Types generated successfully!`);
    console.log(`   Output: ${outputPath}`);
    console.log(`   Collections: ${userCollections.map(c => c.collection).join(', ')}`);
    
  } catch (error) {
    console.error('❌ Failed to generate types:', error.message);
    process.exit(1);
  }
}

/**
 * Run a script file
 */
async function runScript(scriptName) {
  const { spawn } = await import('node:child_process');
  
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, scriptName);
    const proc = spawn('node', [scriptPath], {
      stdio: 'inherit',
      env: process.env
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script exited with code ${code}`));
      }
    });
  });
}

/**
 * Generate TypeScript code from schema
 */
function generateTypeScriptCode(collections, fields) {
  const TYPE_MAP = {
    string: 'string',
    text: 'string',
    integer: 'number',
    bigInteger: 'number',
    float: 'number',
    decimal: 'number',
    boolean: 'boolean',
    date: 'string',
    time: 'string',
    datetime: 'string',
    timestamp: 'string',
    json: 'Record<string, any>',
    csv: 'string[]',
    uuid: 'string',
    hash: 'string'
  };
  
  const toPascalCase = (str) => str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  
  const lines = [
    '/**',
    ' * Auto-generated TypeScript interfaces for Directus schema',
    ` * Generated: ${new Date().toISOString()}`,
    ' */',
    '',
    '/* eslint-disable */',
    '',
  ];
  
  // Generate interfaces
  for (const collection of collections) {
    const collectionFields = fields.filter(f => f.collection === collection.collection);
    const interfaceName = toPascalCase(collection.collection);
    
    lines.push(`export interface ${interfaceName} {`);
    
    for (const field of collectionFields) {
      const fieldType = TYPE_MAP[field.type] || 'any';
      const optional = field.schema?.is_nullable ? '?' : '';
      
      if (field.meta?.note) {
        lines.push(`  /** ${field.meta.note} */`);
      }
      
      lines.push(`  ${field.field}${optional}: ${fieldType};`);
    }
    
    lines.push('}');
    lines.push('');
  }
  
  // Generate Schema type
  lines.push('export interface Schema {');
  for (const collection of collections) {
    lines.push(`  ${collection.collection}: ${toPascalCase(collection.collection)};`);
  }
  lines.push('}');
  lines.push('');
  lines.push('export type CollectionName = keyof Schema;');
  lines.push('');
  
  return lines.join('\n');
}

// Parse and execute
program.parse();
