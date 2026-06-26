import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FinanceService } from '../../services/finance.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
  Budget, BudgetStatus, Income, Expense,
  BUDGET_STATUS_LABELS, BUDGET_STATUS_COLORS
} from '../../../../core/models/finance.model';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './budget.html',
  styleUrl: './budget.css',
})
export class BudgetPage implements OnInit {
  private fb = inject(FormBuilder);
  private financeService = inject(FinanceService);
  private auth = inject(AuthService);

  budgets = signal<Budget[]>([]);
  incomes = signal<Income[]>([]);
  approvedExpenses = signal<Expense[]>([]);
  loading = signal(false);
  showForm = signal(false);
  saving = signal(false);
  error = signal('');
  success = signal('');
  approvingId = signal<number | null>(null);

  readonly statusLabels: Record<string, string> = BUDGET_STATUS_LABELS;
  readonly statusColors: Record<string, string> = BUDGET_STATUS_COLORS;

  get currentUser(): string { return this.auth.getUser()?.username ?? ''; }
  get canApprove(): boolean { return this.auth.canApprove(); }
  get canEdit(): boolean { return this.auth.canEdit(); }

  totalIncome = computed(() => this.incomes().reduce((s, i) => s + (i.amount ?? 0), 0));
  totalBudgeted = computed(() => this.budgets().reduce((s, b) => s + (b.totalAmount ?? 0), 0));
  totalSpent = computed(() => this.approvedExpenses().reduce((s, e) => s + (e.amount ?? 0), 0));
  netCapital = computed(() => this.totalIncome() - this.totalSpent());

  form = this.fb.group({
    name: ['', Validators.required],
    fiscalYear: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
    totalAmount: [null as number | null, [Validators.required, Validators.min(1)]],
    department: [''],
    description: [''],
    notes: [''],
  });

  ngOnInit() {
    this.load();
    this.loadCapitalData();
  }

  loadCapitalData() {
    this.financeService.getIncomes().subscribe({ next: d => this.incomes.set(d), error: () => {} });
    this.financeService.getExpenses('APPROVED').subscribe({ next: d => this.approvedExpenses.set(d), error: () => {} });
  }

  load() {
    this.loading.set(true);
    this.financeService.getBudgets().subscribe({
      next: data => { this.budgets.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  submitBudget() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set('');
    const payload = { ...this.form.value, createdBy: this.currentUser };
    this.financeService.createBudget(payload as any).subscribe({
      next: () => {
        this.success.set('Budget created.');
        this.form.reset({ fiscalYear: new Date().getFullYear() });
        this.showForm.set(false);
        this.saving.set(false);
        this.load();
      },
      error: (err: any) => {
        this.error.set(err?.error?.message ?? 'Error creating budget.');
        this.saving.set(false);
      },
    });
  }

  startApprove(id: number) {
    this.approvingId.set(id);
  }

  submitActivate(id: number) {
    this.saving.set(true);
    this.financeService.activateBudget(id, this.currentUser).subscribe({
      next: () => {
        this.success.set('Budget activated.');
        this.approvingId.set(null);
        this.saving.set(false);
        this.load();
        this.loadCapitalData();
      },
      error: (err: any) => {
        this.error.set(err?.error?.message ?? 'Error activating budget.');
        this.saving.set(false);
      },
    });
  }

  closeBudget(id: number) {
    this.financeService.closeBudget(id, this.currentUser).subscribe({
      next: () => { this.success.set('Budget closed.'); this.load(); },
      error: (err: any) => this.error.set(err?.error?.message ?? 'Error closing budget.'),
    });
  }

  deleteBudget(id: number) {
    if (!confirm('Delete this draft budget? This cannot be undone.')) return;
    this.financeService.deleteBudget(id).subscribe({
      next: () => { this.success.set('Budget deleted.'); this.load(); },
      error: (err: any) => this.error.set(err?.error?.message ?? 'Error deleting budget.'),
    });
  }

  statusClass(status: BudgetStatus | undefined): string {
    return this.statusColors[status ?? 'DRAFT'];
  }

  usedPercent(budget: Budget): number {
    if (!budget.totalAmount || budget.totalAmount === 0) return 0;
    return Math.min(100, Math.round(((budget.allocatedAmount ?? 0) / budget.totalAmount) * 100));
  }

  remainingAmount(budget: Budget): number {
    return (budget.totalAmount ?? 0) - (budget.allocatedAmount ?? 0);
  }

  remainingClass(budget: Budget): string {
    const pct = this.usedPercent(budget);
    if (pct >= 100) return 'text-red-600';
    if (pct >= 75)  return 'text-amber-600';
    return 'text-green-600';
  }

  formatCurrency(val: number | undefined): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val ?? 0);
  }
}
