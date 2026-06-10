# Local Credential Service Usage Guide

## Overview
The `LocalCredentialService` provides local credential management without calling the backend. It stores credentials in browser `localStorage` and allows you to validate, add, update, and remove credentials locally.

## Default Credentials
The service comes with two default credentials:
- **Username**: `admin` | **Password**: `admin123` | **Role**: `ADMIN`
- **Username**: `user` | **Password**: `user123` | **Role**: `USER`

## Usage Examples

### 1. Injecting the Service
```typescript
import { Component, inject } from '@angular/core';
import { LocalCredentialService } from '../core/services/local-credential.service';

@Component({
  selector: 'app-login',
  template: `...`
})
export class LoginComponent {
  private credentialService = inject(LocalCredentialService);
}
```

### 2. Validating Credentials
```typescript
const credential = this.credentialService.validateCredentials('admin', 'admin123');
if (credential) {
  console.log('Valid user:', credential.username, 'Role:', credential.role);
} else {
  console.log('Invalid credentials');
}
```

### 3. Adding a New Credential
```typescript
this.credentialService.addCredential('john', 'pass123', 'USER');
```

### 4. Updating a Credential
```typescript
this.credentialService.updateCredential('john', 'newpass456', 'ADMIN');
```

### 5. Removing a Credential
```typescript
this.credentialService.removeCredential('john');
```

### 6. Getting All Credentials
```typescript
const allCredentials = this.credentialService.getStoredCredentials();
console.log(allCredentials);
```

### 7. Resetting to Defaults
```typescript
this.credentialService.resetToDefaults();
```

### 8. Clearing All Credentials
```typescript
this.credentialService.clearAllCredentials();
```

## Integration with Login

You can optionally modify your login component to use local credentials for development/testing:

```typescript
// In your login component
const credential = this.credentialService.validateCredentials(
  this.username,
  this.password
);

if (credential) {
  // Create a mock token
  const mockToken = btoa(JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
  }));
  
  localStorage.setItem('moms_token', mockToken);
  localStorage.setItem('moms_user', JSON.stringify({
    username: credential.username,
    role: credential.role
  }));
  
  this.router.navigate(['/dashboard']);
}
```

## Key Methods

| Method | Parameters | Return | Description |
|--------|-----------|--------|-------------|
| `validateCredentials()` | username, password | `LocalCredential \| null` | Validate credentials locally |
| `addCredential()` | username, password, role | void | Add new local credential |
| `updateCredential()` | username, password, role | void | Update existing credential |
| `removeCredential()` | username | void | Remove a credential |
| `getStoredCredentials()` | none | `LocalCredential[]` | Get all stored credentials |
| `resetToDefaults()` | none | void | Reset to default credentials |
| `clearAllCredentials()` | none | void | Clear all credentials |

## Notes
- Credentials are stored in browser `localStorage` under the key `moms_local_credentials`
- No backend calls are made when using this service
- This is ideal for development, testing, and offline scenarios
- The service is provided at the root level (singleton)

