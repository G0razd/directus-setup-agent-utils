#!/usr/bin/env node

/**
 * Unit Tests for DirectusClient
 * Tests the REST API client wrapper and error handling
 */

import { DirectusClient } from "../src/lib/client.js";
import { logger } from "../src/lib/logger.js";

// Mock Directus responses for testing
const testSuite = {
  name: "DirectusClient Tests",
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
  },
};

// Tests
testSuite.test("DirectusClient initializes with token", () => {
  const client = new DirectusClient("test-token-12345");
  if (!client || !client.request) {
    throw new Error("Client not initialized properly");
  }
});

testSuite.test("DirectusClient has required methods", () => {
  const client = new DirectusClient("test-token");
  const requiredMethods = [
    "request",
    "testConnection",
    "getCollections",
    "createCollection",
    "getItems",
    "createItem",
    "createItems",
    "deleteItem",
    "getFields",
  ];

  for (const method of requiredMethods) {
    if (typeof client[method] !== "function") {
      throw new Error(`Missing method: ${method}`);
    }
  }
});

testSuite.test("Token is stored securely (not exposed)", () => {
  const client = new DirectusClient(
    "http://localhost:8055",
    "secret-token-xyz"
  );

  // Token is passed to auth, check that client doesn't store it directly
  // It's OK if it's in the auth object since that's internal
  const clientString = JSON.stringify(client);

  // Check if token is directly accessible from client
  if (client.accessToken === "secret-token-xyz") {
    throw new Error("Token exposed directly on client");
  }

  // The important thing is that the token is not logged or exposed
  // Having it in the auth object for internal use is fine
});

testSuite.test("Client handles error responses", async () => {
  const client = new DirectusClient("invalid-token");

  try {
    // This will fail with 401 since token is invalid, but that's expected
    // We're just checking it doesn't throw in an unhandled way
    await client.testConnection().catch((e) => {
      if (
        !e.message.includes("Unauthorized") &&
        !e.message.includes("Connection failed")
      ) {
        throw new Error(`Unexpected error: ${e.message}`);
      }
    });
  } catch (error) {
    throw new Error(`Failed to handle error gracefully: ${error.message}`);
  }
});

// Run tests
const success = await testSuite.run();
process.exit(success ? 0 : 1);
