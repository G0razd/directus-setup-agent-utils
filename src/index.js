/**
 * @abakus/directus-setup
 * Programmatic API for setting up Directus collections and data
 */

import { DirectusClient } from './lib/client.js';
import { DirectusAuth } from './lib/auth.js';
import { logger } from './lib/logger.js';

/**
 * Setup Directus collections and data
 * @param {Object} options
 * @param {string} options.directusUrl - Directus instance URL
 * @param {string} options.accessToken - Directus access token
 * @param {boolean} options.verify - Run verification after setup
 */
export async function setupDirectus(options) {
  const { directusUrl, accessToken, verify = true } = options;

  const client = new DirectusClient(directusUrl, accessToken);

  // Test connection
  const connected = await client.testConnection();
  if (!connected) {
    throw new Error('Cannot connect to Directus');
  }

  return {
    client,
    ready: true,
  };
}

export { DirectusClient, DirectusAuth, logger };
