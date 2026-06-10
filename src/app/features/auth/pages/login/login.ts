import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { LocalCredentialService } from '../../../../core/services/local-credential.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private localCredentialService = inject(LocalCredentialService);
  private router = inject(Router);

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  loading = signal(false);
  error = signal('');

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const { username, password } = this.form.value;

    if (environment.mockMode) {
      const localCredential = this.localCredentialService.validateCredentials(username!, password!);
      if (localCredential) {
        const mockToken = btoa(JSON.stringify({
          username: localCredential.username,
          role: localCredential.role,
          exp: Math.floor(Date.now() / 1000) + 3600,
        }));
        localStorage.setItem('moms_token', mockToken);
        localStorage.setItem('moms_user', JSON.stringify({
          username: localCredential.username,
          role: localCredential.role,
        }));
        this.loading.set(false);
        this.router.navigate(['/']);
        return;
      }
    }

    this.authService.login({ username: username!, password: password! }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.error.set(err.error?.message ?? 'Invalid credentials');
        this.loading.set(false);
      },
    });
  }
}
