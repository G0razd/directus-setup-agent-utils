#!/usr/bin/env node

/**
 * Main Setup Script - Orchestrator
 * Runs all setup steps in order: collections → data → verify
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { DirectusClient } from "./lib/client.js";
import { logger } from "./lib/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function runScript(scriptName, description) {
  return new Promise((resolve, reject) => {
    logger.section(description);

    const scriptPath = path.join(__dirname, `${scriptName}.js`);
    const process = spawn("node", [scriptPath], {
      env: {
        ...globalThis.process.env,
        DIRECTUS_URL:
          globalThis.process.env.DIRECTUS_URL || "http://localhost:8055",
        DIRECTUS_SETUP_TOKEN: globalThis.process.env.DIRECTUS_SETUP_TOKEN,
      },
      stdio: "inherit",
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${scriptName} failed with code ${code}`));
      }
    });

    process.on("error", reject);
  });
}

async function main() {
  const directusUrl =
    globalThis.process.env.DIRECTUS_URL || "http://localhost:8055";
  const accessToken = globalThis.process.env.DIRECTUS_SETUP_TOKEN;

  if (!accessToken) {
    logger.section("⚠️  Configuration Required");
    logger.error("DIRECTUS_SETUP_TOKEN not set in environment");
    logger.info("\nSteps to fix:");
    logger.info("1. Generate an access token in Directus:");
    logger.info("   - Go to Settings → Access Tokens");
    logger.info('   - Click "Create Token"');
    logger.info("   - Set role with collection access");
    logger.info("   - Copy the token");
    logger.info("\n2. Set the environment variable:");
    logger.info("   export DIRECTUS_SETUP_TOKEN=<your-token>");
    logger.info("\n3. Or update your .env file:");
    logger.info("   DIRECTUS_SETUP_TOKEN=<your-token>");
    process.exit(1);
  }

  logger.info(`🔗 Directus URL: ${directusUrl}`);
  logger.info(`🔑 Access token configured: ${accessToken.slice(0, 10)}...`);

  try {
    // Test connection first
    const client = new DirectusClient(directusUrl, accessToken);
    const connected = await client.testConnection();
    if (!connected) {
      logger.error("Cannot proceed without valid connection");
      process.exit(1);
    }

    // Step 1: Create collections
    try {
      await runScript(
        "create-collections",
        "📋 Step 1/3: Creating Collections"
      );
    } catch (error) {
      logger.error(`Collection creation failed: ${error.message}`);
      logger.warn("Proceeding anyway - collections might already exist");
    }

    // Step 2: Populate data
    try {
      await runScript("populate-data", "📊 Step 2/3: Populating Data");
    } catch (error) {
      logger.error(`Data population failed: ${error.message}`);
      throw error;
    }

    // Step 3: Verify
    try {
      await runScript("verify-setup", "✅ Step 3/3: Verifying Setup");
    } catch (error) {
      logger.warn(`Verification failed: ${error.message}`);
    }

    logger.section("🎉 Setup Complete!");
    logger.success("Your Directus instance is ready to use!");
    logger.info("\nNext steps:");
    logger.info("- Test the frontend with: pnpm --filter @abakus/web dev");
    logger.info("- Admin panel: " + directusUrl);
    logger.info("- Backup data: pnpm --filter @abakus/directus-setup backup");
    logger.info("- View logs: pnpm --filter @abakus/directus-setup verify");
  } catch (error) {
    logger.section("❌ Setup Failed");
    logger.error(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
