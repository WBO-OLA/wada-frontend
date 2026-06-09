import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FinanceService } from '../../services/finance.service';
import { Budget, BudgetStatus, BUDGET_STATUS_LABELS } from '../../../../core/models/finance.model';

@Component({
  selector: 'app-budget',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './budget.html',
  styleUrl: './budget.css',
})
export class BudgetPage implements OnInit {
  private fb = inject(FormBuilder);
  form = this.fb.group({
    name: ['', Validators.required],
    fiscalYear: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
    totalAmount: [null as number | null, [Validators.required, Validators.min(1)]],
    department: [''],
    description: [''],
    createdBy: [''],
    notes: [''],
  });

  approveForm = this.fb.group({ approvedBy: ['', Validators.required] });

  budgets = signal<Budget[]>([]);
  loading = signal(false);
  showForm = signal(false);
  saving = signal(false);
  approvingId = signal<number | null>(null);
  error = signal('');
  success = signal('');

  readonly statusLabels = BUDGET_STATUS_LABELS;

  private financeService = inject(FinanceService);

  constructor() {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.financeService.getBudgets().subscribe({
      next: (data) => { this.budgets.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  submitBudget() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set('');
    this.financeService.createBudget(this.form.value as any).subscribe({
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
    this.approveForm.reset();
  }

  submitActivate(id: number) {
    if (this.approveForm.invalid) return;
    this.saving.set(true);
    const approvedBy = this.approveForm.value.approvedBy!;
    this.financeService.activateBudget(id, approvedBy).subscribe({
      next: () => {
        this.success.set('Budget activated.');
        this.approvingId.set(null);
        this.saving.set(false);
        this.load();
      },
      error: (err: any) => {
        this.error.set(err?.error?.message ?? 'Error activating budget.');
        this.saving.set(false);
      },
    });
  }

  closeBudget(id: number) {
    this.financeService.closeBudget(id).subscribe({
      next: () => { this.success.set('Budget closed.'); this.load(); },
      error: (err: any) => this.error.set(err?.error?.message ?? 'Error closing budget.'),
    });
  }

  statusClass(status: BudgetStatus): string {
    return {
      DRAFT: 'bg-gray-100 text-gray-600',
      ACTIVE: 'bg-green-100 text-green-700',
      CLOSED: 'bg-slate-100 text-slate-500',
    }[status];
  }

  usedPercent(budget: Budget): number {
    if (!budget.totalAmount) return 0;
    return Math.min(100, Math.round((budget.allocatedAmount / budget.totalAmount) * 100));
  }
}
