import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, UserInfo } from '../models/auth.model';
import { ApiResponse } from '../models/api-response.model';

const TOKEN_KEY = 'moms_token';
const USER_KEY = 'moms_user';
const API = 'http://localhost:8080/api/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  login(req: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${API}/login`, req).pipe(
      tap(res => {
        if (res.data) {
          localStorage.setItem(TOKEN_KEY, res.data.token);
          const user: UserInfo = { username: res.data.username, role: res.data.role };
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        }
      })
    );
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
}
