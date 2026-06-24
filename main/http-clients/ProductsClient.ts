import { expect, type APIRequestContext } from '@playwright/test';
import { APP_BASE_URL } from '../config/constants';
import type { Product } from '../types/product';

const PRODUCTS_ENDPOINT = '/api/v1/products';

export class ProductsClient {
  readonly request: APIRequestContext;
  readonly token: string;

  constructor(request: APIRequestContext, token: string) {
    this.request = request;
    this.token = token;
  }

  async getProducts(): Promise<Product[]> {
    const response = await this.request.get(`${APP_BASE_URL}${PRODUCTS_ENDPOINT}`, {
      headers: this.authorizationHeaders()
    });

    expect(response.status()).toBe(200);
    return response.json();
  }

  async getProduct(productId: number): Promise<Product> {
    const response = await this.request.get(`${APP_BASE_URL}${PRODUCTS_ENDPOINT}/${productId}`, {
      headers: this.authorizationHeaders()
    });

    expect(response.status()).toBe(200);
    return response.json();
  }

  private authorizationHeaders() {
    return {
      Authorization: `Bearer ${this.token}`
    };
  }
}
