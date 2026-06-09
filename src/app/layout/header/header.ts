import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected auth = inject(AuthService);

  get username(): string { return this.auth.getUser()?.username ?? 'User'; }
  get role(): string { return this.auth.getRole(); }
  get initial(): string { return this.username.charAt(0).toUpperCase(); }

  logout(): void { this.auth.logout(); }
}
