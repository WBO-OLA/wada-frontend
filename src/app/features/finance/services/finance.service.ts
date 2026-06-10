import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  Budget, Expense, Income, LedgerEntry, IncomeAggregate,
  ExpenseApprovalRequest
} from '../../../core/models/finance.model';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private api = inject(ApiService);

  private readonly incomes = 'finance/incomes';
  private readonly budgets = 'finance/budgets';
  private readonly expenses = 'finance/expenses';

  // --- Income ---
  getIncomes(): Observable<Income[]> {
    return this.api.get<ApiResponse<Income[]>>(this.incomes).pipe(map(r => r.data));
  }

  createIncome(request: Partial<Income>): Observable<Income> {
    return this.api.post<ApiResponse<Income>>(this.incomes, request).pipe(map(r => r.data));
  }

  deleteIncome(id: number): Observable<void> {
    return this.api.delete<ApiResponse<void>>(`${this.incomes}/${id}`).pipe(map(() => undefined));
  }

  getIncomeAggregate(): Observable<IncomeAggregate> {
    return this.api.get<IncomeAggregate>(`${this.incomes}/aggregate`);
  }

  // --- Budget ---
  getBudgets(fiscalYear?: number): Observable<Budget[]> {
    const path = fiscalYear ? `${this.budgets}?fiscalYear=${fiscalYear}` : this.budgets;
    return this.api.get<Budget[]>(path);
  }

  getBudget(id: number): Observable<Budget> {
    return this.api.get<Budget>(`${this.budgets}/${id}`);
  }

  createBudget(request: Partial<Budget>): Observable<Budget> {
    return this.api.post<Budget>(this.budgets, request);
  }

  updateBudget(id: number, request: Partial<Budget>): Observable<Budget> {
    return this.api.put<Budget>(`${this.budgets}/${id}`, request);
  }

  activateBudget(id: number, approvedBy: string, notes?: string): Observable<Budget> {
    return this.api.patch<Budget>(`${this.budgets}/${id}/activate`, { approvedBy, notes });
  }

  closeBudget(id: number, closedBy: string): Observable<Budget> {
    return this.api.patch<Budget>(`${this.budgets}/${id}/close`, { closedBy });
  }

  deleteBudget(id: number): Observable<void> {
    return this.api.delete<void>(`${this.budgets}/${id}`);
  }

  // --- Expenses ---
  getExpenses(status?: string): Observable<Expense[]> {
    const path = status ? `${this.expenses}?status=${status}` : this.expenses;
    return this.api.get<Expense[]>(path);
  }

  createExpense(request: Partial<Expense> & { budgetId?: number }): Observable<Expense> {
    return this.api.post<Expense>(this.expenses, request);
  }

  approveExpense(id: number, request: ExpenseApprovalRequest): Observable<Expense> {
    return this.api.patch<Expense>(`${this.expenses}/${id}/approve`, request);
  }

  rejectExpense(id: number, request: ExpenseApprovalRequest): Observable<Expense> {
    return this.api.patch<Expense>(`${this.expenses}/${id}/reject`, request);
  }

  cancelExpense(id: number): Observable<Expense> {
    return this.api.patch<Expense>(`${this.expenses}/${id}/cancel`, {});
  }

  // --- Ledger ---
  getLedger(): Observable<LedgerEntry[]> {
    return this.api.get<ApiResponse<LedgerEntry[]>>('finance/ledger').pipe(map(r => r.data));
  }
}
