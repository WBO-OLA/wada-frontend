import { TestBed } from '@angular/core/testing';
import { LocalCredentialService } from './local-credential.service';

describe('LocalCredentialService', () => {
  let service: LocalCredentialService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
    service = TestBed.inject(LocalCredentialService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default credentials', () => {
    const credentials = service.getStoredCredentials();
    expect(credentials.length).toBeGreaterThan(0);
  });

  it('should validate correct credentials', () => {
    const result = service.validateCredentials('admin', 'admin123');
    expect(result).toBeTruthy();
    expect(result?.role).toBe('ADMIN');
  });

  it('should return null for invalid credentials', () => {
    const result = service.validateCredentials('admin', 'wrongpassword');
    expect(result).toBeNull();
  });

  it('should add new credential', () => {
    service.addCredential('newuser', 'newpass', 'USER');
    const result = service.validateCredentials('newuser', 'newpass');
    expect(result).toBeTruthy();
    expect(result?.role).toBe('USER');
  });

  it('should not add duplicate credential', () => {
    const before = service.getStoredCredentials().length;
    service.addCredential('admin', 'newpass', 'USER');
    const after = service.getStoredCredentials().length;
    expect(before).toBe(after);
  });

  it('should update existing credential', () => {
    service.updateCredential('admin', 'newpassword', 'ADMIN');
    const result = service.validateCredentials('admin', 'newpassword');
    expect(result).toBeTruthy();
  });

  it('should remove credential', () => {
    service.removeCredential('admin');
    const result = service.validateCredentials('admin', 'admin123');
    expect(result).toBeNull();
  });

  it('should reset to default credentials', () => {
    service.addCredential('testuser', 'testpass', 'USER');
    service.resetToDefaults();
    const credentials = service.getStoredCredentials();
    expect(credentials.some(c => c.username === 'testuser')).toBeFalsy();
  });

  it('should clear all credentials', () => {
    service.clearAllCredentials();
    const credentials = service.getStoredCredentials();
    expect(credentials.length).toBe(0);
  });
});

