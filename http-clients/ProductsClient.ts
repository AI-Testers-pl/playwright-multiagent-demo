import { expect, type APIRequestContext } from '@playwright/test';
import { APP_BASE_URL } from '../config/constants';
import type { Product, ProductInput } from '../types/product';

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

  async createProduct(product: ProductInput): Promise<Product> {
    const response = await this.request.post(`${APP_BASE_URL}${PRODUCTS_ENDPOINT}`, {
      data: product,
      headers: {
        ...this.authorizationHeaders(),
        'Content-Type': 'application/json'
      }
    });

    expect(response.status()).toBe(201);
    return response.json();
  }

  async deleteProduct(productId: number) {
    const status = await this.tryDeleteProduct(productId);

    expect(status).toBe(204);
  }

  async tryDeleteProduct(productId: number): Promise<number> {
    const response = await this.request.delete(`${APP_BASE_URL}${PRODUCTS_ENDPOINT}/${productId}`, {
      headers: this.authorizationHeaders()
    });

    return response.status();
  }

  private authorizationHeaders() {
    return {
      Authorization: `Bearer ${this.token}`
    };
  }
}
