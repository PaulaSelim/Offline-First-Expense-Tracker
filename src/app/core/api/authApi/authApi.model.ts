export interface AuthenticationData {
  user: User;
  token: string;
  refresh_token: string;
}
export type AuthenticationTokens = Omit<AuthenticationData, 'user'>;

export interface User {
  id: string;
  email: string;
  username: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}

export interface AuthenticationResponse {
  data: AuthenticationData;
}
