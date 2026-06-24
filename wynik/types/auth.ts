export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginResponseDto {
  token: string;
  refreshToken: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface AuthUser extends LoginResponseDto {
  displayName: string;
}

export interface ErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
} 
