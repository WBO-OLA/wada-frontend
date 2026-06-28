export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
  commandId?: number | null;
}

export interface UserInfo {
  username: string;
  role: string;
  commandId?: number | null;
}
