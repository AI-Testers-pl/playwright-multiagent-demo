import { expect, type APIRequestContext, type Page } from '@playwright/test';
import { APP_BASE_URL } from '../config/constants';
import type { RegisterDto } from '../types/auth';

const SIGNUP_ENDPOINT = '/api/v1/users/signup';
const USERNAME_ALREADY_USED_MESSAGE = 'Username is already in use';
const EMAIL_ALREADY_USED_MESSAGE = 'Email is already in use';

export class RegisterClient {
  readonly request: APIRequestContext;
  readonly signupEndpoint: string;

  constructor(request: APIRequestContext) {
    this.request = request;
    this.signupEndpoint = `${APP_BASE_URL}${SIGNUP_ENDPOINT}`;
  }

  static isSignupRequest(url: string) {
    return url.endsWith(SIGNUP_ENDPOINT);
  }

  static waitForSignupResponse(page: Page) {
    return page.waitForResponse(response =>
      RegisterClient.isSignupRequest(response.url()) &&
      response.request().method() === 'POST'
    );
  }

  static async verifyUsernameAlreadyUsedResponse(response: { json(): Promise<{ message?: string }> }) {
    const responseBody = await response.json();

    expect(responseBody.message).toBe(USERNAME_ALREADY_USED_MESSAGE);
  }

  static async verifyEmailAlreadyUsedResponse(response: { json(): Promise<{ message?: string }> }) {
    const responseBody = await response.json();

    expect(responseBody.message).toBe(EMAIL_ALREADY_USED_MESSAGE);
  }

  async register(user: RegisterDto) {
    return this.request.post(this.signupEndpoint, {
      data: user,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async createUser(user: RegisterDto) {
    const response = await this.register(user);

    expect(response.status()).toBe(201);
    return response;
  }
}
