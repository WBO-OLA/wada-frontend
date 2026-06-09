import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../../../../core/models/api-response.model';

interface UserRecord {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

const ROLES = ['USER', 'MANAGER', 'ADMIN'];
const API = 'http://localhost:8080/api/auth/admin';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class AdminUsersPage implements OnInit {
  private http = inject(HttpClient);

  users = signal<UserRecord[]>([]);
  loading = signal(true);
  error = signal('');

  readonly roles = ROLES;

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.http.get<ApiResponse<UserRecord[]>>(`${API}/users`).pipe(
      map(r => r.data)
    ).subscribe({
      next: users => { this.users.set(users); this.loading.set(false); },
      error: () => { this.error.set('Failed to load users.'); this.loading.set(false); },
    });
  }

  changeRole(user: UserRecord, event: Event) {
    const role = (event.target as HTMLSelectElement).value;
    if (role === user.role) return;
    this.http.patch<ApiResponse<UserRecord>>(`${API}/users/${user.id}/role`, { role }).pipe(
      map(r => r.data)
    ).subscribe({
      next: updated => this.users.update(list => list.map(u => u.id === updated.id ? updated : u)),
      error: () => this.error.set('Failed to update role.'),
    });
  }

  deleteUser(id: number, username: string) {
    if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    this.http.delete<ApiResponse<void>>(`${API}/users/${id}`).subscribe({
      next: () => this.users.update(list => list.filter(u => u.id !== id)),
      error: () => this.error.set('Failed to delete user.'),
    });
  }

  formatDate(dt: string): string {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
