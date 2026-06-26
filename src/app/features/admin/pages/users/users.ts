import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

interface UserRecord {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

const ROLE_LEVELS: Record<string, number> = {
  USER: 1, MANAGER: 2, CHIEF: 3, ADMIN: 4,
};

const ALL_ROLES = ['USER', 'MANAGER', 'CHIEF', 'ADMIN'];

const ROLE_COLORS: Record<string, string> = {
  ADMIN:   'bg-red-100 text-red-700 border-red-200',
  CHIEF:   'bg-purple-100 text-purple-700 border-purple-200',
  MANAGER: 'bg-blue-100 text-blue-700 border-blue-200',
  USER:    'bg-gray-100 text-gray-600 border-gray-200',
};

const API = `${environment.apiUrl}/auth/admin`;

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class AdminUsersPage implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  users = signal<UserRecord[]>([]);
  loading = signal(true);
  saving = signal(false);
  showForm = signal(false);
  error = signal('');
  success = signal('');
  editingUserId = signal<number | null>(null);
  editingRole = signal('');

  readonly roleColors = ROLE_COLORS;

  get currentRole(): string { return this.auth.getRole(); }
  get currentUser(): string { return this.auth.getUser()?.username ?? ''; }

  /** Admin and Chief can change roles and delete users */
  get canManageAll(): boolean { return this.auth.canApprove(); }

  /** Roles this user is allowed to assign (same level or below) */
  get allowedRoles(): string[] {
    const myLevel = ROLE_LEVELS[this.currentRole] ?? 0;
    return ALL_ROLES.filter(r => ROLE_LEVELS[r] <= myLevel);
  }

  /** Roles shown in the edit dropdown — same rule */
  get editableRoles(): string[] { return this.allowedRoles; }

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['USER', Validators.required],
  });

  ngOnInit() {
    this.load();
    // Pre-select highest allowed role in form
    const top = this.allowedRoles[this.allowedRoles.length - 1] ?? 'USER';
    this.form.patchValue({ role: top === this.currentRole ? top : 'USER' });
  }

  load() {
    this.loading.set(true);
    this.http.get<ApiResponse<UserRecord[]>>(`${API}/users`).pipe(
      map(r => r.data)
    ).subscribe({
      next: users => { this.users.set(users); this.loading.set(false); },
      error: () => { this.error.set('Failed to load users.'); this.loading.set(false); },
    });
  }

  createUser() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set('');
    this.http.post<ApiResponse<UserRecord>>(`${API}/users`, this.form.value).pipe(
      map(r => r.data)
    ).subscribe({
      next: user => {
        this.users.update(list => [user, ...list]);
        this.success.set(`User "${user.username}" created successfully.`);
        this.form.reset({ role: 'USER' });
        this.showForm.set(false);
        this.saving.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to create user.');
        this.saving.set(false);
      },
    });
  }

  startEdit(user: UserRecord) {
    this.editingUserId.set(user.id);
    this.editingRole.set(user.role);
  }

  cancelEdit() {
    this.editingUserId.set(null);
    this.editingRole.set('');
  }

  saveEdit(user: UserRecord) {
    const role = this.editingRole();
    if (!role || role === user.role) { this.cancelEdit(); return; }
    this.http.patch<ApiResponse<UserRecord>>(`${API}/users/${user.id}/role`, { role }).pipe(
      map(r => r.data)
    ).subscribe({
      next: updated => {
        this.users.update(list => list.map(u => u.id === updated.id ? updated : u));
        this.success.set(`Role updated for "${updated.username}".`);
        this.cancelEdit();
      },
      error: (err) => { this.error.set(err?.error?.message ?? 'Failed to update role.'); this.cancelEdit(); },
    });
  }

  changeRole(user: UserRecord, event: Event) {
    const role = (event.target as HTMLSelectElement).value;
    if (role === user.role) return;
    this.http.patch<ApiResponse<UserRecord>>(`${API}/users/${user.id}/role`, { role }).pipe(
      map(r => r.data)
    ).subscribe({
      next: updated => {
        this.users.update(list => list.map(u => u.id === updated.id ? updated : u));
        this.success.set(`Role updated for "${updated.username}".`);
      },
      error: (err) => this.error.set(err?.error?.message ?? 'Failed to update role.'),
    });
  }

  deleteUser(id: number, username: string) {
    if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    this.http.delete<ApiResponse<void>>(`${API}/users/${id}`).subscribe({
      next: () => {
        this.users.update(list => list.filter(u => u.id !== id));
        this.success.set(`User "${username}" deleted.`);
      },
      error: (err) => this.error.set(err?.error?.message ?? 'Failed to delete user.'),
    });
  }

  roleColor(role: string): string { return ROLE_COLORS[role] ?? ROLE_COLORS['USER']; }

  formatDate(dt: string): string {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
