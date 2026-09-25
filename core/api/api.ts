import { APIRequestContext, APIResponse } from '@playwright/test';
import { TOKEN_CYBERSOFT } from '../../constant/config-constant.js';

/**
 * Generic API utility wrapper for Playwright APIRequestContext.
 * Automatically injects TokenCybersoft header into every request.
 */
export class APIUtils {
  constructor(private readonly apiContext: APIRequestContext) {}

  /**
   * Build common headers including TokenCybersoft.
   * Optionally adds Authorization header when accessToken is provided.
   */
  private buildHeaders(accessToken?: string): Record<string, string> {
    const headers: Record<string, string> = {
      TokenCybersoft: TOKEN_CYBERSOFT,
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return headers;
  }

  /** HTTP GET */
  async get(
    url: string,
    options?: {
      params?: Record<string, string | number>;
      accessToken?: string;
    },
  ): Promise<APIResponse> {
    return this.apiContext.get(url, {
      params: options?.params,
      headers: this.buildHeaders(options?.accessToken),
    });
  }

  /** HTTP POST with JSON body */
  async post(
    url: string,
    options?: {
      data?: unknown;
      accessToken?: string;
    },
  ): Promise<APIResponse> {
    return this.apiContext.post(url, {
      data: options?.data,
      headers: this.buildHeaders(options?.accessToken),
    });
  }

  /** HTTP PUT with JSON body */
  async put(
    url: string,
    options?: {
      data?: unknown;
      accessToken?: string;
    },
  ): Promise<APIResponse> {
    return this.apiContext.put(url, {
      data: options?.data,
      headers: this.buildHeaders(options?.accessToken),
    });
  }

  /** HTTP DELETE */
  async delete(
    url: string,
    options?: {
      params?: Record<string, string | number>;
      accessToken?: string;
    },
  ): Promise<APIResponse> {
    return this.apiContext.delete(url, {
      params: options?.params,
      headers: this.buildHeaders(options?.accessToken),
    });
  }

  /** HTTP POST with multipart/form-data */
  async postForm(
    url: string,
    options?: {
      multipart?: Record<string, string | { name: string; mimeType: string; buffer: Buffer }>;
      accessToken?: string;
    },
  ): Promise<APIResponse> {
    return this.apiContext.post(url, {
      multipart: options?.multipart,
      headers: this.buildHeaders(options?.accessToken),
    });
  }
}
