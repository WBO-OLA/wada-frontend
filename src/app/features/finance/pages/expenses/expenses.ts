import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FinanceService } from '../../services/finance.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CommandService } from '../../../personnel/services/command.service';
import {
  Expense, Budget, ExpenseStatus,
  EXPENSE_STATUS_LABELS, EXPENSE_STATUS_COLORS
} from '../../../../core/models/finance.model';
import { Command } from '../../../../core/models/command.model';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './expenses.html',
  styleUrl: './expenses.css',
})
export class Expenses implements OnInit {
  private fb = inject(FormBuilder);
  private financeService = inject(FinanceService);
  private commandService = inject(CommandService);
  private auth = inject(AuthService);

  expenses = signal<Expense[]>([]);
  budgets = signal<Budget[]>([]);
  commands = signal<Command[]>([]);
  commandFilter = signal<number | null>(null);
  loading = signal(false);
  showForm = signal(false);
  saving = signal(false);
  error = signal('');
  success = signal('');
  filterStatus = signal('');
  searchTerm = signal('');
  actionId = signal<number | null>(null);
  actionType = signal<'approve' | 'reject'>('approve');

  filteredExpenses = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.expenses();
    return this.expenses().filter(e =>
      e.title.toLowerCase().includes(term) ||
      (e.category ?? '').toLowerCase().includes(term) ||
      (e.submittedBy ?? '').toLowerCase().includes(term)
    );
  });

  get currentUser(): string { return this.auth.getUser()?.username ?? ''; }
  get canApprove(): boolean { return this.auth.canApprove(); }

  readonly statuses: ExpenseStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
  readonly statusLabels: Record<string, string> = EXPENSE_STATUS_LABELS;
  readonly statusColors: Record<string, string> = EXPENSE_STATUS_COLORS;

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    category: [''],
    budgetId: [null as number | null],
    commandId: [null as number | null],
    reference: [''],
    notes: [''],
  });

  commandName(id: number | null | undefined): string {
    if (!id) return '';
    const c = this.commands().find(x => x.id === id);
    return c ? (c.name + (c.description ? ` (${c.description})` : '')) : '';
  }

  rejectionForm = this.fb.group({
    rejectionReason: [''],
  });

  ngOnInit() {
    this.commandService.getAll().subscribe({ next: c => this.commands.set(c), error: () => {} });
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
    const commandId = this.commandFilter() ?? undefined;
    this.financeService.getExpenses(status, commandId).subscribe({
      next: data => { this.expenses.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  applyFilter(status: string) {
    this.filterStatus.set(status);
    this.searchTerm.set('');
    this.load();
  }

  setCommandFilter(id: number | null) {
    this.commandFilter.set(id);
    this.load();
  }

  cancelExpense(id: number) {
    if (!confirm('Cancel this expense? This cannot be undone.')) return;
    this.financeService.cancelExpense(id).subscribe({
      next: updated => {
        this.expenses.update(list => list.map(e => e.id === updated.id ? updated : e));
        this.success.set('Expense cancelled.');
      },
      error: (err: any) => this.error.set(err?.error?.message ?? 'Error cancelling expense.'),
    });
  }

  submitExpense() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set('');
    const payload = { ...this.form.value, submittedBy: this.currentUser };
    this.financeService.createExpense(payload as any).subscribe({
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
    this.rejectionForm.reset();
  }

  submitAction() {
    this.saving.set(true);
    const id = this.actionId()!;
    const request = {
      approvedBy: this.currentUser,
      rejectionReason: this.rejectionForm.value.rejectionReason ?? undefined,
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
