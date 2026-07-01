export interface LoginRequest {
  username: string;
  password: string;
}

export interface MfaRequiredResponse {
  mfaRequired: boolean;
  mfaSessionId: string;
  otpHint?: string | null;
}

export interface OtpVerifyRequest {
  mfaSessionId: string;
  otp: string;
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
