import { Injectable } from '@angular/core';

export interface LocalCredential {
  username: string;
  password: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class LocalCredentialService {
  private readonly LOCAL_CREDENTIALS_KEY = 'moms_local_credentials';
  private defaultCredentials: LocalCredential[] = [
    { username: 'admin', password: 'admin123', role: 'ADMIN' },
    { username: 'user', password: 'user123', role: 'USER' },
  ];

  constructor() {
    this.initializeDefaultCredentials();
  }

  private initializeDefaultCredentials(): void {
    const stored = this.getStoredCredentials();
    if (stored.length === 0) {
      this.saveCredentials(this.defaultCredentials);
    }
  }

  /**
   * Validate credentials locally
   */
  validateCredentials(username: string, password: string): LocalCredential | null {
    const credentials = this.getStoredCredentials();
    const found = credentials.find(
      cred => cred.username === username && cred.password === password
    );
    return found || null;
  }

  /**
   * Add a new local credential
   */
  addCredential(username: string, password: string, role: string): void {
    const credentials = this.getStoredCredentials();
    // Check if credential already exists
    if (credentials.some(cred => cred.username === username)) {
      console.warn(`Credential for username "${username}" already exists`);
      return;
    }
    credentials.push({ username, password, role });
    this.saveCredentials(credentials);
  }

  /**
   * Update an existing credential
   */
  updateCredential(username: string, password: string, role: string): void {
    const credentials = this.getStoredCredentials();
    const index = credentials.findIndex(cred => cred.username === username);
    if (index !== -1) {
      credentials[index] = { username, password, role };
      this.saveCredentials(credentials);
    }
  }

  /**
   * Remove a credential
   */
  removeCredential(username: string): void {
    const credentials = this.getStoredCredentials();
    const filtered = credentials.filter(cred => cred.username !== username);
    this.saveCredentials(filtered);
  }

  /**
   * Get all stored credentials
   */
  getStoredCredentials(): LocalCredential[] {
    const stored = localStorage.getItem(this.LOCAL_CREDENTIALS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Save credentials to localStorage
   */
  private saveCredentials(credentials: LocalCredential[]): void {
    localStorage.setItem(
      this.LOCAL_CREDENTIALS_KEY,
      JSON.stringify(credentials)
    );
  }

  /**
   * Reset to default credentials
   */
  resetToDefaults(): void {
    this.saveCredentials(this.defaultCredentials);
  }

  /**
   * Clear all credentials
   */
  clearAllCredentials(): void {
    localStorage.removeItem(this.LOCAL_CREDENTIALS_KEY);
  }
}

