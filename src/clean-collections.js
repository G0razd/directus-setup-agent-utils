/**
 * Clean Collections Script
 * Deletes all items from collections (not the collections themselves)
 */

import { DirectusClient } from "./lib/client.js";
import { logger } from "./lib/logger.js";

async function cleanCollection(client, collectionName) {
  logger.info(`🧹 Cleaning ${collectionName}...`);

  try {
    const items = await client.getItems(collectionName);

    if (items.length === 0) {
      logger.info(`⏭️  ${collectionName} is already empty`);
      return 0;
    }

    // Delete in batches (some APIs have limits)
    for (const item of items) {
      try {
        await client.deleteItem(collectionName, item.id);
      } catch (error) {
        logger.warn(`Failed to delete item ${item.id}: ${error.message}`);
      }
    }

    logger.success(`✅ Deleted ${items.length} items from ${collectionName}`);
    return items.length;
  } catch (error) {
    logger.error(`Failed to clean ${collectionName}: ${error.message}`);
    return 0;
  }
}

async function main() {
  const directusUrl = process.env.DIRECTUS_URL || "http://localhost:8055";
  const accessToken = process.env.DIRECTUS_SETUP_TOKEN;

  if (!accessToken) {
    logger.error("DIRECTUS_SETUP_TOKEN not set in environment");
    process.exit(1);
  }

  logger.section("Cleaning Collections");

  // Confirm action
  logger.warn("⚠️  This will DELETE ALL DATA from collections!");
  logger.info("To proceed, set CONFIRM_CLEANUP=true environment variable");

  if (process.env.CONFIRM_CLEANUP !== "true") {
    logger.warn("Cleanup cancelled. Set CONFIRM_CLEANUP=true to proceed.");
    process.exit(0);
  }

  const client = new DirectusClient(directusUrl, accessToken);

  // Test connection
  const connected = await client.testConnection();
  if (!connected) {
    process.exit(1);
  }

  try {
    const collections = await client.getCollections();
    const results = [];

    // Clean in reverse order to respect foreign keys
    const order = ["problems", "lessons", "courses", "ai_prompts"];

    for (const collectionName of order) {
      if (collections.some((c) => c.collection === collectionName)) {
        const deleted = await cleanCollection(client, collectionName);
        results.push({
          collection: collectionName,
          deleted,
        });
      }
    }

    logger.table(results);

    logger.section("Cleanup Complete");
    logger.success("✅ All collections cleaned!");
  } catch (error) {
    logger.error(`Cleanup failed: ${error.message}`);
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
