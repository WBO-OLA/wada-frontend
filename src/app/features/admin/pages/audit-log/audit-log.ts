import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLogService } from '../../services/audit-log.service';
import { CommandService } from '../../../personnel/services/command.service';
import { AuditLogEntry, PageResponse, AUDIT_TARGET_TABLES } from '../../../../core/models/audit-log.model';
import { Command } from '../../../../core/models/command.model';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-log.html',
})
export class AuditLogPage implements OnInit {
  private auditLogService = inject(AuditLogService);
  private commandService = inject(CommandService);

  entries = signal<AuditLogEntry[]>([]);
  commands = signal<Command[]>([]);
  commandFilter = signal<number | null>(null);
  loading = signal(false);
  error = signal('');
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);

  actionFilter = '';
  tableFilter = '';
  fromFilter = '';
  toFilter = '';

  readonly PAGE_SIZE = 20;
  readonly targetTables = AUDIT_TARGET_TABLES;

  ngOnInit(): void {
    this.commandService.getAll().subscribe({ next: c => this.commands.set(c), error: () => {} });
    this.load(0);
  }

  load(page: number): void {
    this.loading.set(true);
    this.error.set('');
    this.currentPage.set(page);
    this.auditLogService.search({
      action: this.actionFilter || undefined,
      targetTable: this.tableFilter || undefined,
      commandId: this.commandFilter(),
      from: this.fromFilter ? this.fromFilter + ':00' : undefined,
      to: this.toFilter ? this.toFilter + ':59' : undefined,
      page,
      size: this.PAGE_SIZE,
    }).subscribe({
      next: (res: PageResponse<AuditLogEntry>) => {
        this.entries.set(res.content);
        this.totalElements.set(res.totalElements);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load audit logs. Make sure you are logged in as ADMIN.');
        this.loading.set(false);
      },
    });
  }

  applyFilters(): void {
    this.load(0);
  }

  setCommandFilter(id: number | null): void {
    this.commandFilter.set(id);
    this.load(0);
  }

  commandName(id: number | null | undefined): string {
    if (!id) return '';
    const c = this.commands().find(x => x.id === id);
    return c ? (c.name + (c.description ? ` (${c.description})` : '')) : '';
  }

  prev(): void {
    if (this.currentPage() > 0) this.load(this.currentPage() - 1);
  }

  next(): void {
    if (this.currentPage() < this.totalPages() - 1) this.load(this.currentPage() + 1);
  }

  formatDate(dt: string): string {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  }
}
