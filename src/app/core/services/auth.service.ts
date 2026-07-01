import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthResponse, LoginRequest, MfaRequiredResponse, OtpVerifyRequest, UserInfo } from '../models/auth.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'moms_token';
const USER_KEY  = 'moms_user';
const API = `${environment.apiUrl}/auth`;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  /** Step 1: validate credentials — returns mfaSessionId, no JWT yet. */
  login(req: LoginRequest): Observable<ApiResponse<MfaRequiredResponse>> {
    return this.http.post<ApiResponse<MfaRequiredResponse>>(`${API}/login`, req);
  }

  /** Step 2: validate OTP — returns JWT on success. */
  verifyOtp(req: OtpVerifyRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${API}/verify-otp`, req);
  }

  /** Persist token + user info after successful OTP verification. */
  completeLogin(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    const user: UserInfo = {
      username: res.username,
      role: res.role,
      commandId: res.commandId ?? null,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUser(): UserInfo | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getRole(): string {
    return this.getUser()?.role ?? '';
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  isChief(): boolean {
    return this.getRole() === 'CHIEF';
  }

  isGlobal(): boolean {
    const role = this.getRole();
    return role === 'ADMIN' || role === 'CHIEF';
  }

  getCommandId(): number | null {
    return this.getUser()?.commandId ?? null;
  }

  canApprove(): boolean {
    const role = this.getRole();
    return role === 'ADMIN' || role === 'CHIEF';
  }

  canEdit(): boolean {
    const role = this.getRole();
    return role === 'ADMIN' || role === 'CHIEF' || role === 'MANAGER';
  }

  canUploadPhoto(): boolean {
    const role = this.getRole();
    return role === 'ADMIN' || role === 'CHIEF';
  }
}
