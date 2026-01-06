/**
 * Create Collections Script
 * Creates Directus collections based on schema definition
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DirectusClient } from "./lib/client.js";
import { logger } from "./lib/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadCollectionsSchema() {
  const schemaPath = path.join(__dirname, "config", "collections.json");
  const content = await fs.readFile(schemaPath, "utf-8");
  return JSON.parse(content);
}

async function collectionExists(client, collectionName) {
  const collections = await client.getCollections();
  return collections.some((c) => c.collection === collectionName);
}

async function createCollection(client, collectionDef) {
  const collectionName = collectionDef.collection;

  // Check if already exists
  if (await collectionExists(client, collectionName)) {
    logger.warn(`Collection "${collectionName}" already exists. Skipping.`);
    return false;
  }

  try {
    await client.createCollection(collectionDef);
    logger.success(`✅ Created collection: ${collectionName}`);
    return true;
  } catch (error) {
    logger.error(
      `Failed to create collection "${collectionName}": ${error.message}`
    );
    throw error;
  }
}

async function main() {
  const directusUrl = process.env.DIRECTUS_URL || "http://localhost:8055";
  const accessToken = process.env.DIRECTUS_SETUP_TOKEN;

  if (!accessToken) {
    logger.error("DIRECTUS_SETUP_TOKEN not set in environment");
    process.exit(1);
  }

  logger.section("Creating Directus Collections");

  const client = new DirectusClient(directusUrl, accessToken);

  // Test connection first
  const connected = await client.testConnection();
  if (!connected) {
    process.exit(1);
  }

  try {
    const schema = await loadCollectionsSchema();
    logger.info(
      `📋 Loaded schema with ${schema.collections.length} collections`
    );

    let created = 0;
    let skipped = 0;

    for (const collectionDef of schema.collections) {
      const wasCreated = await createCollection(client, collectionDef);
      if (wasCreated) {
        created++;
      } else {
        skipped++;
      }
    }

    logger.section("Collection Creation Summary");
    logger.success(`✅ Created: ${created}`);
    logger.info(`⏭️  Skipped: ${skipped}`);
    logger.success("\n🎉 Collections setup complete!");
  } catch (error) {
    logger.error(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
