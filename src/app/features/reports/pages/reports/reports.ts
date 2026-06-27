import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../services/report.service';
import { CommandService } from '../../../personnel/services/command.service';
import { DashboardReport } from '../../../../core/models/report.model';
import { Command } from '../../../../core/models/command.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class ReportsPage implements OnInit {
  report = signal<DashboardReport | null>(null);
  loading = signal(true);
  error = signal('');
  lastRefreshed = signal<Date | null>(null);
  commands = signal<Command[]>([]);
  commandFilter = signal<number | null>(null);

  private reportService = inject(ReportService);
  private commandService = inject(CommandService);

  ngOnInit() {
    this.commandService.getAll().subscribe({ next: c => this.commands.set(c), error: () => {} });
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.reportService.getDashboard(this.commandFilter()).subscribe({
      next: (data) => {
        this.report.set(data);
        this.lastRefreshed.set(new Date());
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load report data. Ensure all services are running.');
        this.loading.set(false);
      },
    });
  }

  setCommandFilter(id: number | null) {
    this.commandFilter.set(id);
    this.load();
  }

  commandName(id: number | null | undefined): string {
    if (!id) return '';
    const c = this.commands().find(x => x.id === id);
    return c ? c.name : '';
  }

  topEntries(map: Record<string, number> | undefined, limit = 5): [string, number][] {
    if (!map) return [];
    return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, limit);
  }

  allEntries(map: Record<string, number> | undefined): [string, number][] {
    if (!map) return [];
    return Object.entries(map).sort(([, a], [, b]) => b - a);
  }

  barWidth(value: number, max: number): number {
    if (!max) return 0;
    return Math.min(100, Math.round((value / max) * 100));
  }

  netCapital(r: DashboardReport): number {
    return (r.finance?.totalIncomeAmount ?? 0) - (r.finance?.totalApprovedExpenseAmount ?? 0);
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val ?? 0);
  }

  exportCsv() {
    const r = this.report();
    if (!r) return;
    const rows: string[][] = [];
    const sep = (label: string) => rows.push([label], []);

    rows.push(['WADA Management System — Dashboard Report']);
    rows.push(['Generated At', r.generatedAt ?? '']);
    rows.push(['Exported At', new Date().toISOString()]);
    if (this.commandFilter() != null) rows.push(['Command Filter', this.commandName(this.commandFilter())]);
    rows.push([]);

    sep('=== PERSONNEL ===');
    rows.push(['Total Members', String(r.personnel?.totalMembers ?? 0)]);
    rows.push(['Active', String(r.personnel?.active ?? 0)]);
    rows.push(['Injured', String(r.personnel?.injured ?? 0)]);
    rows.push(['Retired', String(r.personnel?.retired ?? 0)]);
    rows.push(['Passed Away', String(r.personnel?.passedAway ?? 0)]);
    rows.push([]);
    if (r.personnel?.byCommand) {
      rows.push(['By Command', 'Count']);
      this.allEntries(r.personnel.byCommand).forEach(([k, v]) => rows.push([k, String(v)]));
      rows.push([]);
    }
    if (r.personnel?.byRank) {
      rows.push(['By Rank', 'Count']);
      this.allEntries(r.personnel.byRank).forEach(([k, v]) => rows.push([k, String(v)]));
      rows.push([]);
    }

    sep('=== INVENTORY ===');
    rows.push(['Total Items', String(r.inventory?.totalItems ?? 0)]);
    rows.push(['Total Warehouses', String(r.inventory?.totalWarehouses ?? 0)]);
    rows.push(['Active Warehouses', String(r.inventory?.activeWarehouses ?? 0)]);
    rows.push(['Low Stock Count', String(r.inventory?.lowStockCount ?? 0)]);
    rows.push(['Out of Stock Count', String(r.inventory?.outOfStockCount ?? 0)]);
    rows.push(['Total Stock Value', String(r.inventory?.totalStockValue ?? 0)]);
    rows.push([]);
    if (r.inventory?.byCategory) {
      rows.push(['By Category', 'Count']);
      this.allEntries(r.inventory.byCategory).forEach(([k, v]) => rows.push([k, String(v)]));
      rows.push([]);
    }

    sep('=== FINANCE ===');
    rows.push(['Total Income Amount', String(r.finance?.totalIncomeAmount ?? 0)]);
    rows.push(['Total Income Entries', String(r.finance?.totalIncomes ?? 0)]);
    rows.push(['Total Budgets', String(r.finance?.totalBudgets ?? 0)]);
    rows.push(['Active Budgets', String(r.finance?.activeBudgets ?? 0)]);
    rows.push(['Total Budget Amount', String(r.finance?.totalBudgetAmount ?? 0)]);
    rows.push(['Total Allocated Amount', String(r.finance?.totalAllocatedAmount ?? 0)]);
    rows.push(['Total Expenses', String(r.finance?.totalExpenses ?? 0)]);
    rows.push(['Pending Expenses', String(r.finance?.pendingExpenses ?? 0)]);
    rows.push(['Approved Expenses', String(r.finance?.approvedExpenses ?? 0)]);
    rows.push(['Total Approved Expense Amount', String(r.finance?.totalApprovedExpenseAmount ?? 0)]);
    rows.push(['Net Capital', String(this.netCapital(r))]);

    const csv = rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wada-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
