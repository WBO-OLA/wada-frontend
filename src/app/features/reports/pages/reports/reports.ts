import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../services/report.service';
import { DashboardReport } from '../../../../core/models/report.model';

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

  private reportService = inject(ReportService);

  constructor() {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.reportService.getDashboard().subscribe({
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

  topEntries(map: Record<string, number> | undefined, limit = 5): [string, number][] {
    if (!map) return [];
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);
  }

  barWidth(value: number, max: number): number {
    if (!max) return 0;
    return Math.min(100, Math.round((value / max) * 100));
  }

  budgetUtilPct(finance: DashboardReport['finance']): number {
    if (!finance?.totalBudgetAmount) return 0;
    return Math.min(100, Math.round((finance.totalAllocatedAmount / finance.totalBudgetAmount) * 100));
  }
}
