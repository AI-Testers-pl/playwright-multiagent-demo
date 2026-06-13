import { expect, type APIRequestContext } from '@playwright/test';
import { APP_BASE_URL } from '../config/constants';
import type { Cart } from '../types/cart';

const CART_ENDPOINT = '/api/v1/cart';

export class CartClient {
  readonly request: APIRequestContext;
  readonly token: string;

  constructor(request: APIRequestContext, token: string) {
    this.request = request;
    this.token = token;
  }

  async getCart(): Promise<Cart> {
    const response = await this.request.get(`${APP_BASE_URL}${CART_ENDPOINT}`, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    });

    expect(response.status()).toBe(200);
    return response.json();
  }
}
