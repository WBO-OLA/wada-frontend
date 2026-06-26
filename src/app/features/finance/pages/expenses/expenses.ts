import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FinanceService } from '../../services/finance.service';
import {
  Expense, Budget, ExpenseStatus,
  EXPENSE_STATUS_LABELS, EXPENSE_STATUS_COLORS
} from '../../../../core/models/finance.model';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './expenses.html',
  styleUrl: './expenses.css',
})
export class Expenses implements OnInit {
  private fb = inject(FormBuilder);
  private financeService = inject(FinanceService);

  expenses = signal<Expense[]>([]);
  budgets = signal<Budget[]>([]);
  loading = signal(false);
  showForm = signal(false);
  saving = signal(false);
  error = signal('');
  success = signal('');
  filterStatus = signal('');
  actionId = signal<number | null>(null);
  actionType = signal<'approve' | 'reject'>('approve');

  readonly statuses: ExpenseStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
  readonly statusLabels: Record<string, string> = EXPENSE_STATUS_LABELS;
  readonly statusColors: Record<string, string> = EXPENSE_STATUS_COLORS;

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    category: [''],
    budgetId: [null as number | null],
    submittedBy: ['', Validators.required],
    reference: [''],
    notes: [''],
  });

  approvalForm = this.fb.group({
    approvedBy: ['', Validators.required],
    rejectionReason: [''],
  });

  ngOnInit() {
    this.load();
    this.loadBudgets();
  }

  loadBudgets() {
    this.financeService.getBudgets().subscribe({
      next: data => this.budgets.set(data),
      error: () => {},
    });
  }

  load() {
    this.loading.set(true);
    const status = this.filterStatus() || undefined;
    this.financeService.getExpenses(status).subscribe({
      next: data => { this.expenses.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  applyFilter(status: string) {
    this.filterStatus.set(status);
    this.load();
  }

  submitExpense() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set('');
    this.financeService.createExpense(this.form.value as any).subscribe({
      next: () => {
        this.success.set('Expense submitted.');
        this.form.reset();
        this.showForm.set(false);
        this.saving.set(false);
        this.load();
      },
      error: (err: any) => {
        this.error.set(err?.error?.message ?? 'Error submitting expense.');
        this.saving.set(false);
      },
    });
  }

  startAction(id: number, type: 'approve' | 'reject') {
    this.actionId.set(id);
    this.actionType.set(type);
    this.approvalForm.reset();
  }

  submitAction() {
    if (this.approvalForm.invalid) return;
    this.saving.set(true);
    const id = this.actionId()!;
    const request = {
      approvedBy: this.approvalForm.value.approvedBy!,
      rejectionReason: this.approvalForm.value.rejectionReason ?? undefined,
    };
    const obs = this.actionType() === 'approve'
      ? this.financeService.approveExpense(id, request)
      : this.financeService.rejectExpense(id, request);
    obs.subscribe({
      next: () => {
        this.success.set(`Expense ${this.actionType() === 'approve' ? 'approved' : 'rejected'}.`);
        this.actionId.set(null);
        this.saving.set(false);
        this.load();
        this.loadBudgets();
      },
      error: (err: any) => {
        this.error.set(err?.error?.message ?? 'Error processing expense.');
        this.saving.set(false);
      },
    });
  }

  statusClass(status: ExpenseStatus | undefined): string {
    return this.statusColors[status ?? 'PENDING'];
  }

  budgetForExpense(budgetId: number | undefined): Budget | undefined {
    if (budgetId == null) return undefined;
    return this.budgets().find(b => b.id === budgetId);
  }

  budgetRemaining(budgetId: number | undefined): number {
    const bgt = this.budgetForExpense(budgetId);
    if (!bgt) return 0;
    return (bgt.totalAmount ?? 0) - (bgt.allocatedAmount ?? 0);
  }
}
