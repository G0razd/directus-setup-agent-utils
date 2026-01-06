/**
 * Directus API Client
 * Wraps fetch requests with authentication and error handling
 */

import { DirectusAuth } from './auth.js';
import { logger } from './logger.js';

export class DirectusClient {
  constructor(directusUrl, accessToken) {
    this.directusUrl = directusUrl;
    this.auth = new DirectusAuth(directusUrl, accessToken);
  }

  /**
   * Perform authenticated request
   */
  async request(method, path, data = null) {
    const headers = await this.auth.getAuthHeader();
    const url = `${this.directusUrl}${path}`;

    const options = {
      method,
      headers,
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);

      // Handle 403 Forbidden
      if (response.status === 403) {
        logger.error(
          '❌ 403 Forbidden: Check token permissions. Ensure token has access to collections/items.'
        );
        throw new Error('Insufficient permissions');
      }

      // Handle 401 Unauthorized
      if (response.status === 401) {
        logger.error('❌ 401 Unauthorized: Token is invalid or expired. Generate new token.');
        throw new Error('Invalid token');
      }

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      logger.error(`Request failed (${method} ${path}): ${error.message}`);
      throw error;
    }
  }

  /**
   * GET /api/collections
   */
  async getCollections() {
    logger.debug('Fetching collections...');
    const result = await this.request('GET', '/api/collections');
    return result.data || [];
  }

  /**
   * POST /api/collections
   */
  async createCollection(collectionConfig) {
    logger.debug(`Creating collection: ${collectionConfig.collection}`);
    const result = await this.request('POST', '/api/collections', collectionConfig);
    return result.data;
  }

  /**
   * PATCH /api/collections/:id
   */
  async updateCollection(collectionId, updates) {
    logger.debug(`Updating collection: ${collectionId}`);
    const result = await this.request('PATCH', `/api/collections/${collectionId}`, updates);
    return result.data;
  }

  /**
   * GET /api/items/:collection
   */
  async getItems(collection, options = {}) {
    logger.debug(`Fetching items from ${collection}...`);
    let url = `/api/items/${collection}`;

    if (Object.keys(options).length > 0) {
      const params = new URLSearchParams(options);
      url += `?${params.toString()}`;
    }

    const result = await this.request('GET', url);
    return result.data || [];
  }

  /**
   * POST /api/items/:collection
   */
  async createItem(collection, data) {
    logger.debug(`Creating item in ${collection}`);
    const result = await this.request('POST', `/api/items/${collection}`, data);
    return result.data;
  }

  /**
   * POST /api/items/:collection?multiple=true
   */
  async createItems(collection, items) {
    logger.debug(`Creating ${items.length} items in ${collection}`);
    const result = await this.request('POST', `/api/items/${collection}`, items);
    return result.data || [];
  }

  /**
   * PATCH /api/items/:collection/:id
   */
  async updateItem(collection, id, data) {
    logger.debug(`Updating item ${id} in ${collection}`);
    const result = await this.request('PATCH', `/api/items/${collection}/${id}`, data);
    return result.data;
  }

  /**
   * DELETE /api/items/:collection/:id
   */
  async deleteItem(collection, id) {
    logger.debug(`Deleting item ${id} from ${collection}`);
    await this.request('DELETE', `/api/items/${collection}/${id}`);
  }

  /**
   * GET /api/fields/:collection
   */
  async getFields(collection) {
    logger.debug(`Fetching fields for ${collection}...`);
    const result = await this.request('GET', `/api/fields/${collection}`);
    return result.data || [];
  }

  /**
   * Test connection
   */
  async testConnection() {
    try {
      logger.info('🔗 Testing Directus connection...');
      const result = await this.request('GET', '/api/server/info');
      logger.success(`✅ Connected to Directus ${result.data.directus.version}`);
      return true;
    } catch (error) {
      logger.error(`❌ Connection failed: ${error.message}`);
      return false;
    }
  }
}
