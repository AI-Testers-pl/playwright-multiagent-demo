import { expect, type APIRequestContext } from '@playwright/test';
import { APP_BASE_URL } from '../config/constants';
import type { LoginDto, LoginResponseDto } from '../types/auth';

const SIGNIN_ENDPOINT = '/api/v1/users/signin';

export class LoginClient {
  readonly request: APIRequestContext;
  readonly signinEndpoint: string;

  constructor(request: APIRequestContext) {
    this.request = request;
    this.signinEndpoint = `${APP_BASE_URL}${SIGNIN_ENDPOINT}`;
  }

  async login(credentials: LoginDto) {
    return this.request.post(this.signinEndpoint, {
      data: credentials,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async loginSuccessfully(credentials: LoginDto): Promise<LoginResponseDto> {
    const response = await this.login(credentials);

    expect(response.status()).toBe(200);
    return response.json();
  }
}
