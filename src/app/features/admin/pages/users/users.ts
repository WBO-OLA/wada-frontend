import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';
import { CommandWithDepth } from '../../../../core/models/command.model';

interface UserRecord {
  id: number;
  username: string;
  email: string;
  role: string;
  commandId?: number | null;
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
  commands = signal<CommandWithDepth[]>([]);
  loading = signal(true);
  saving = signal(false);
  showForm = signal(false);
  error = signal('');
  success = signal('');
  editingUserId = signal<number | null>(null);
  editingRole = signal('');
  editingCommandId = signal<number | null>(null);

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
    commandId: [null as number | null],
  });

  ngOnInit() {
    this.load();
    this.loadCommands();
    const top = this.allowedRoles[this.allowedRoles.length - 1] ?? 'USER';
    this.form.patchValue({ role: top === this.currentRole ? top : 'USER' });
  }

  loadCommands() {
    this.http.get<any>(`${environment.apiUrl}/personnel/commands`).subscribe({
      next: (res: any) => {
        const raw: any[] = Array.isArray(res) ? res : (res?.data ?? []);
        const withDepth = this.assignDepths(raw);
        this.commands.set(withDepth);
      },
    });
  }

  private assignDepths(list: any[]): CommandWithDepth[] {
    const map = new Map<number, CommandWithDepth>();
    list.forEach(c => map.set(c.id, { ...c, depth: 0 }));
    map.forEach(c => {
      if (c.parent?.id) {
        const parent = map.get(c.parent.id);
        if (parent) c.depth = parent.depth + 1;
      }
    });
    return Array.from(map.values());
  }

  commandName(id: number | null | undefined): string {
    if (!id) return '—';
    return this.commands().find(c => c.id === id)?.name ?? '—';
  }

  load() {
    this.loading.set(true);
    this.http.get<any>(`${API}/users`).subscribe({
      next: (res: any) => {
        const users: UserRecord[] = Array.isArray(res) ? res : (res?.data ?? []);
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => { this.error.set('Failed to load users.'); this.loading.set(false); },
    });
  }

  createUser() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set('');
    const payload = {
      ...this.form.value,
      commandId: this.form.value.commandId ? Number(this.form.value.commandId) : null,
    };
    this.http.post<any>(`${API}/users`, payload).subscribe({
      next: (res: any) => {
        const user: UserRecord = res?.data ?? res;
        this.users.update(list => [user, ...list]);
        this.success.set(`User "${user.username}" created successfully.`);
        this.form.reset({ role: 'USER', commandId: null });
        this.showForm.set(false);
        this.saving.set(false);
      },
      error: (err: any) => {
        this.error.set(err?.error?.message ?? 'Failed to create user.');
        this.saving.set(false);
      },
    });
  }

  startEdit(user: UserRecord) {
    this.editingUserId.set(user.id);
    this.editingRole.set(user.role);
    this.editingCommandId.set(user.commandId ?? null);
  }

  cancelEdit() {
    this.editingUserId.set(null);
    this.editingRole.set('');
    this.editingCommandId.set(null);
  }

  saveEdit(user: UserRecord) {
    const role = this.editingRole();
    const commandId = this.editingCommandId() ? Number(this.editingCommandId()) : null;
    const roleChanged = role && role !== user.role;
    const commandChanged = commandId !== (user.commandId ?? null);
    if (!roleChanged && !commandChanged) { this.cancelEdit(); return; }

    const patch: any = {};
    if (roleChanged) patch.role = role;
    if (commandChanged) patch.commandId = commandId;

    this.http.patch<any>(`${API}/users/${user.id}/role`, patch).subscribe({
      next: (res: any) => {
        const updated: UserRecord = res?.data ?? res;
        this.users.update(list => list.map(u => u.id === updated.id ? updated : u));
        this.success.set(`Updated "${updated.username}".`);
        this.cancelEdit();
      },
      error: (err: any) => { this.error.set(err?.error?.message ?? 'Failed to update user.'); this.cancelEdit(); },
    });
  }

  changeRole(user: UserRecord, event: Event) {
    const role = (event.target as HTMLSelectElement).value;
    if (role === user.role) return;
    this.http.patch<any>(`${API}/users/${user.id}/role`, { role }).subscribe({
      next: (res: any) => {
        const updated: UserRecord = res?.data ?? res;
        this.users.update(list => list.map(u => u.id === updated.id ? updated : u));
        this.success.set(`Role updated for "${updated.username}".`);
      },
      error: (err: any) => this.error.set(err?.error?.message ?? 'Failed to update role.'),
    });
  }

  deleteUser(id: number, username: string) {
    if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    this.http.delete<any>(`${API}/users/${id}`).subscribe({
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
