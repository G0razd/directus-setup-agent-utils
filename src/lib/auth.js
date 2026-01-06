/**
 * Directus Authentication
 * Generates JWT tokens dynamically from access token
 */

import { logger } from './logger.js';

export class DirectusAuth {
  constructor(directusUrl, accessToken) {
    this.directusUrl = directusUrl;
    this.accessToken = accessToken;
    this.jwtToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get valid JWT token (generates new if expired)
   */
  async getToken() {
    // Check if token is still valid
    if (this.jwtToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.jwtToken;
    }

    logger.debug('🔄 Generating new JWT token from access token...');
    return await this.refreshToken();
  }

  /**
   * Refresh JWT token using access token
   */
  async refreshToken() {
    try {
      const response = await fetch(`${this.directusUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: this.accessToken,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        logger.error(`Failed to authenticate: ${response.status} ${error}`);
        throw new Error(
          `Authentication failed: ${response.status}. Check your access token and Directus URL.`
        );
      }

      const data = await response.json();
      this.jwtToken = data.data.access_token;
      
      // Token typically expires in 15 minutes, refresh after 10 minutes
      this.tokenExpiry = Date.now() + 10 * 60 * 1000;

      logger.success('✅ JWT token generated successfully');
      return this.jwtToken;
    } catch (error) {
      logger.error(`Authentication error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get authorization header
   */
  async getAuthHeader() {
    const token = await this.getToken();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }
}
