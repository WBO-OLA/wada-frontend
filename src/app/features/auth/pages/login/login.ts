import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { LocalCredentialService } from '../../../../core/services/local-credential.service';
import { OtpService } from '../../../../core/services/otp.service';
import { environment } from '../../../../../environments/environment';

type Step = 'credentials' | 'otp';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginPage implements OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private localCredentialService = inject(LocalCredentialService);
  private otpService = inject(OtpService);
  private router = inject(Router);

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  otpForm = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  step     = signal<Step>('credentials');
  loading  = signal(false);
  error    = signal('');
  showPassword = signal(false);
  otpHint  = signal('');
  countdown = signal(60);

  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  // Mock mode state
  private mockPendingUsername = '';
  private mockPendingPassword = '';

  // Real backend state
  private mfaSessionId = '';

  features = [
    { icon: '👤', label: 'Personnel Management', desc: 'Track members, ranks, and transfers' },
    { icon: '💰', label: 'Finance Control', desc: 'Budgets, expenses, and income tracking' },
    { icon: '📦', label: 'Inventory System', desc: 'Items, warehouses, and stock levels' },
    { icon: '📊', label: 'Reporting & Analytics', desc: 'Zone-scoped reports and dashboards' },
  ];

  ngOnDestroy(): void {
    this.clearCountdown();
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const { username, password } = this.form.value;

    if (environment.mockMode) {
      const credential = this.localCredentialService.validateCredentials(username!, password!);
      if (credential) {
        this.mockPendingUsername = credential.username;
        this.mockPendingPassword = password!;
        const code = this.otpService.generate(credential.username);
        this.otpHint.set(code);
        this.loading.set(false);
        this.enterOtpStep();
      } else {
        this.error.set('Invalid credentials');
        this.loading.set(false);
      }
      return;
    }

    this.authService.login({ username: username!, password: password! }).subscribe({
      next: (res) => {
        if (res.data) {
          this.mfaSessionId = res.data.mfaSessionId;
          this.otpHint.set(res.data.otpHint ?? '');
          this.loading.set(false);
          this.enterOtpStep();
        }
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Invalid credentials');
        this.loading.set(false);
      },
    });
  }

  submitOtp(): void {
    if (this.otpForm.invalid || this.countdown() <= 0) return;
    this.loading.set(true);
    this.error.set('');

    const code = this.otpForm.value.code ?? '';

    if (environment.mockMode) {
      const valid = this.otpService.verify(this.mockPendingUsername, code);
      if (!valid) {
        this.error.set(
          this.otpService.isExpired()
            ? 'Code expired. Go back and sign in again.'
            : 'Incorrect code. Try again.'
        );
        this.loading.set(false);
        return;
      }
      const credential = this.localCredentialService.validateCredentials(
        this.mockPendingUsername, this.mockPendingPassword
      );
      if (credential) {
        const mockToken = btoa(JSON.stringify({
          username: credential.username,
          role: credential.role,
          exp: Math.floor(Date.now() / 1000) + 3600,
        }));
        localStorage.setItem('moms_token', mockToken);
        localStorage.setItem('moms_user', JSON.stringify({ username: credential.username, role: credential.role }));
        this.loading.set(false);
        this.router.navigate(['/']);
      }
      return;
    }

    this.authService.verifyOtp({ mfaSessionId: this.mfaSessionId, otp: code }).subscribe({
      next: (res) => {
        if (res.data) {
          this.authService.completeLogin(res.data);
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Invalid or expired code. Try again.');
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.clearCountdown();
    this.step.set('credentials');
    this.otpForm.reset();
    this.otpService.clear();
    this.error.set('');
    this.otpHint.set('');
    this.mfaSessionId = '';
    this.mockPendingUsername = '';
    this.mockPendingPassword = '';
  }

  private enterOtpStep(): void {
    this.countdown.set(60);
    this.step.set('otp');
    this.countdownTimer = setInterval(() => {
      const next = this.countdown() - 1;
      this.countdown.set(next);
      if (next <= 0) {
        this.clearCountdown();
        this.error.set('Code expired. Go back and sign in again.');
        this.otpService.clear();
      }
    }, 1000);
  }

  private clearCountdown(): void {
    if (this.countdownTimer !== null) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }
}
