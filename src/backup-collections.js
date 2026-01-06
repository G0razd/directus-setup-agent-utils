/**
 * Backup Collections Script
 * Exports all data from collections to JSON files
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DirectusClient } from "./lib/client.js";
import { logger } from "./lib/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function ensureBackupDir() {
  const backupDir = path.join(__dirname, "..", "backups");
  await fs.mkdir(backupDir, { recursive: true });
  return backupDir;
}

async function backupCollection(client, collectionName, backupDir) {
  logger.info(`💾 Backing up ${collectionName}...`);

  try {
    const items = await client.getItems(collectionName);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${collectionName}_${timestamp}.json`;
    const filepath = path.join(backupDir, filename);

    const backup = {
      collection: collectionName,
      exported_at: new Date().toISOString(),
      total_records: items.length,
      data: items,
    };

    await fs.writeFile(filepath, JSON.stringify(backup, null, 2));
    logger.success(`✅ Backed up ${items.length} items to ${filename}`);

    return {
      collection: collectionName,
      items: items.length,
      file: filename,
    };
  } catch (error) {
    logger.error(`Failed to backup ${collectionName}: ${error.message}`);
    return {
      collection: collectionName,
      items: 0,
      file: "❌ Error",
    };
  }
}

async function main() {
  const directusUrl = process.env.DIRECTUS_URL || "http://localhost:8055";
  const accessToken = process.env.DIRECTUS_SETUP_TOKEN;

  if (!accessToken) {
    logger.error("DIRECTUS_SETUP_TOKEN not set in environment");
    process.exit(1);
  }

  logger.section("Backing Up Collections");

  const client = new DirectusClient(directusUrl, accessToken);

  // Test connection
  const connected = await client.testConnection();
  if (!connected) {
    process.exit(1);
  }

  try {
    const backupDir = await ensureBackupDir();
    logger.info(`📁 Backup directory: ${backupDir}`);

    const collections = await client.getCollections();
    const results = [];

    for (const collection of collections) {
      // Skip system collections
      if (collection.collection.startsWith("directus_")) {
        continue;
      }

      const result = await backupCollection(
        client,
        collection.collection,
        backupDir
      );
      results.push(result);
    }

    logger.table(results);

    logger.section("Backup Complete");
    logger.success("✅ All collections backed up successfully!");
    logger.info(`📁 Files saved to: ${backupDir}`);
  } catch (error) {
    logger.error(`Backup failed: ${error.message}`);
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
