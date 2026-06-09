import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FinanceService } from '../../services/finance.service';
import {
  Budget, Expense, ExpenseStatus,
  EXPENSE_STATUS_LABELS,
} from '../../../../core/models/finance.model';

@Component({
  selector: 'app-expenses',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './expenses.html',
  styleUrl: './expenses.css',
})
export class Expenses implements OnInit {
  private fb = inject(FormBuilder);
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

  expenses = signal<Expense[]>([]);
  budgets = signal<Budget[]>([]);
  filterStatus = signal<string>('');
  loading = signal(false);
  showForm = signal(false);
  saving = signal(false);
  actionId = signal<number | null>(null);
  actionType = signal<'approve' | 'reject' | null>(null);
  error = signal('');
  success = signal('');

  readonly statusLabels = EXPENSE_STATUS_LABELS;
  readonly statuses: ExpenseStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

  private financeService = inject(FinanceService);

  constructor() {}

  ngOnInit() {
    this.load();
    this.financeService.getBudgets().subscribe(b => this.budgets.set(b.filter(x => x.status === 'ACTIVE')));
  }

  load() {
    this.loading.set(true);
    const status = this.filterStatus() || undefined;
    this.financeService.getExpenses(status).subscribe({
      next: (data) => { this.expenses.set(data); this.loading.set(false); },
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
    const value = this.form.value as any;
    this.financeService.createExpense(value).subscribe({
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
    const id = this.actionId()!;
    const type = this.actionType()!;
    const request = this.approvalForm.value as any;
    this.saving.set(true);
    const action = type === 'approve'
      ? this.financeService.approveExpense(id, request)
      : this.financeService.rejectExpense(id, request);
    action.subscribe({
      next: () => {
        this.success.set(`Expense ${type}d.`);
        this.actionId.set(null);
        this.actionType.set(null);
        this.saving.set(false);
        this.load();
      },
      error: (err: any) => {
        this.error.set(err?.error?.message ?? 'Error processing action.');
        this.saving.set(false);
      },
    });
  }

  statusClass(status: ExpenseStatus): string {
    return ({
      PENDING:   'bg-yellow-100 text-yellow-700',
      APPROVED:  'bg-green-100 text-green-700',
      REJECTED:  'bg-red-100 text-red-700',
      CANCELLED: 'bg-gray-100 text-gray-500',
    } as Record<ExpenseStatus, string>)[status];
  }
}
