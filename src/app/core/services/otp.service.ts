import { Injectable } from '@angular/core';

interface OtpRecord {
  code: string;
  expiresAt: number;
  username: string;
}

@Injectable({ providedIn: 'root' })
export class OtpService {
  private pending: OtpRecord | null = null;
  private readonly TTL_MS = 5 * 60 * 1000; // 5 minutes

  generate(username: string): string {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    this.pending = { code, username, expiresAt: Date.now() + this.TTL_MS };
    return code;
  }

  verify(username: string, code: string): boolean {
    if (!this.pending) return false;
    if (this.pending.username !== username) return false;
    if (Date.now() > this.pending.expiresAt) { this.clear(); return false; }
    const valid = this.pending.code === code.trim();
    if (valid) this.clear();
    return valid;
  }

  clear(): void {
    this.pending = null;
  }

  isExpired(): boolean {
    return this.pending ? Date.now() > this.pending.expiresAt : true;
  }
}
