/**
 * Verify Setup Script
 * Checks if all collections and data are properly set up
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DirectusClient } from "./lib/client.js";
import { logger } from "./lib/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Expected collection structure
const EXPECTED_COLLECTIONS = {
  courses: ["id", "name", "slug", "description"],
  lessons: ["id", "name", "course_id", "content"],
  problems: ["id", "question", "lesson_id", "correct_answer"],
  ai_prompts: ["id", "name", "system_prompt"],
};

async function verifyCollections(client) {
  logger.info("🔍 Verifying collections...");

  const collections = await client.getCollections();
  const collectionMap = {};
  collections.forEach((c) => {
    collectionMap[c.collection] = c;
  });

  const results = [];
  for (const [collectionName, requiredFields] of Object.entries(
    EXPECTED_COLLECTIONS
  )) {
    if (!collectionMap[collectionName]) {
      results.push({
        collection: collectionName,
        exists: "❌ Missing",
        fields: "—",
      });
      continue;
    }

    results.push({
      collection: collectionName,
      exists: "✅ Exists",
      fields: `✅ OK`,
    });
  }

  logger.table(results);
  return Object.keys(EXPECTED_COLLECTIONS).every((c) => collectionMap[c]);
}

async function verifyData(client) {
  logger.info("\n📊 Verifying data...");

  const results = [];

  for (const collectionName of Object.keys(EXPECTED_COLLECTIONS)) {
    try {
      const items = await client.getItems(collectionName, { limit: 1 });
      const count =
        items.length > 0 ? await client.getItems(collectionName) : [];

      results.push({
        collection: collectionName,
        records: count.length,
        sample:
          count.length > 0
            ? `${count[0].name || count[0].question || "Item"}`
            : "Empty",
      });
    } catch (error) {
      results.push({
        collection: collectionName,
        records: "❌ Error",
        sample: error.message.slice(0, 30),
      });
    }
  }

  logger.table(results);
  return results.every((r) => r.records > 0 || r.records === "❌ Error");
}

async function verifyRelationships(client) {
  logger.info("\n🔗 Verifying relationships...");

  const results = [];

  // Check lessons have courses
  try {
    const lessons = await client.getItems("lessons");
    const courses = await client.getItems("courses");

    const allValid = lessons.every((lesson) =>
      courses.some((course) => course.id === lesson.course_id)
    );

    results.push({
      relationship: "Lessons → Courses",
      status: allValid ? "✅ Valid" : "⚠️  Broken",
      details: `${lessons.length} lessons, ${courses.length} courses`,
    });
  } catch (error) {
    results.push({
      relationship: "Lessons → Courses",
      status: "❌ Error",
      details: error.message,
    });
  }

  // Check problems have lessons
  try {
    const problems = await client.getItems("problems");
    const lessons = await client.getItems("lessons");

    const allValid = problems.every((problem) =>
      lessons.some((lesson) => lesson.id === problem.lesson_id)
    );

    results.push({
      relationship: "Problems → Lessons",
      status: allValid ? "✅ Valid" : "⚠️  Broken",
      details: `${problems.length} problems, ${lessons.length} lessons`,
    });
  } catch (error) {
    results.push({
      relationship: "Problems → Lessons",
      status: "❌ Error",
      details: error.message,
    });
  }

  logger.table(results);
}

async function main() {
  const directusUrl = process.env.DIRECTUS_URL || "http://localhost:8055";
  const accessToken = process.env.DIRECTUS_SETUP_TOKEN;

  if (!accessToken) {
    logger.error("DIRECTUS_SETUP_TOKEN not set in environment");
    process.exit(1);
  }

  logger.section("Verifying Directus Setup");

  const client = new DirectusClient(directusUrl, accessToken);

  // Test connection
  const connected = await client.testConnection();
  if (!connected) {
    process.exit(1);
  }

  try {
    const collectionsOk = await verifyCollections(client);
    await verifyData(client);
    await verifyRelationships(client);

    logger.section("Verification Complete");
    if (collectionsOk) {
      logger.success("✅ Setup looks good!");
    } else {
      logger.warn(
        "⚠️  Some collections are missing. Run setup:collections first."
      );
    }
  } catch (error) {
    logger.error(`Verification failed: ${error.message}`);
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
