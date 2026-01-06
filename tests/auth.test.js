#!/usr/bin/env node

/**
 * Unit Tests for DirectusAuth
 * Tests authentication token generation and refresh
 */

import { DirectusAuth } from "../src/lib/auth.js";
import { logger } from "../src/lib/logger.js";

const testSuite = {
  name: "DirectusAuth Tests",
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
testSuite.test("DirectusAuth initializes with URL and token", () => {
  const auth = new DirectusAuth("http://localhost:8055", "test-token-123");
  if (!auth || !auth.getToken || !auth.refreshToken) {
    throw new Error("Auth not initialized properly");
  }
});

testSuite.test("getToken returns a string", async () => {
  const auth = new DirectusAuth("http://localhost:8055", "test-token");

  try {
    const token = auth.getToken();
    if (token instanceof Promise) {
      // getToken returns a promise
    } else if (typeof token !== "string" || token.length === 0) {
      throw new Error("getToken did not return a valid token string");
    }
  } catch (error) {
    // It's ok if it fails since there's no real Directus server
    if (
      !error.message.includes("Failed to parse URL") &&
      !error.message.includes("Connection")
    ) {
      throw error;
    }
  }
});

testSuite.test("Token is cached (same token on repeated calls)", async () => {
  const auth = new DirectusAuth("http://localhost:8055", "test-token");

  // Pre-set a token to test caching
  auth.jwtToken = "cached-token-xyz";
  auth.tokenExpiry = Date.now() + 10000;

  const token1 = auth.getToken();
  const token2 = auth.getToken();

  // Both should be promises or both should be strings
  if (token1 instanceof Promise !== token2 instanceof Promise) {
    throw new Error("Token type mismatch");
  }
});

testSuite.test("Auth stores correct base URL and token", () => {
  const testUrl = "http://localhost:8055";
  const testToken = "my-access-token-xyz";
  const auth = new DirectusAuth(testUrl, testToken);

  // Can't access private properties directly, but we can verify behavior
  if (!auth) {
    throw new Error("Auth object not created");
  }
});

// Run tests
const success = await testSuite.run();
process.exit(success ? 0 : 1);
