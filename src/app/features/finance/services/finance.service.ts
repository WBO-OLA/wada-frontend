import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  Budget, Expense, Income,
  ExpenseApprovalRequest, LedgerEntry, LedgerEntryType,
} from '../../../core/models/finance.model';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private api = inject(ApiService);

  private readonly budgets = 'finance/budgets';
  private readonly expenses = 'finance/expenses';
  private readonly incomes = 'finance/incomes';

  // ── Budget ──────────────────────────────────────────────────────────────────

  getBudgets(fiscalYear?: number): Observable<Budget[]> {
    const url = fiscalYear ? `${this.budgets}?fiscalYear=${fiscalYear}` : this.budgets;
    return this.api.get<ApiResponse<Budget[]>>(url).pipe(map(r => r.data));
  }

  getBudgetById(id: number): Observable<Budget> {
    return this.api.get<ApiResponse<Budget>>(`${this.budgets}/${id}`).pipe(map(r => r.data));
  }

  createBudget(request: Partial<Budget>): Observable<Budget> {
    return this.api.post<ApiResponse<Budget>>(this.budgets, request).pipe(map(r => r.data));
  }

  updateBudget(id: number, request: Partial<Budget>): Observable<Budget> {
    return this.api.put<ApiResponse<Budget>>(`${this.budgets}/${id}`, request).pipe(map(r => r.data));
  }

  activateBudget(id: number, approvedBy: string): Observable<Budget> {
    return this.api.patch<ApiResponse<Budget>>(`${this.budgets}/${id}/activate`, { approvedBy }).pipe(map(r => r.data));
  }

  closeBudget(id: number): Observable<Budget> {
    return this.api.patch<ApiResponse<Budget>>(`${this.budgets}/${id}/close`, {}).pipe(map(r => r.data));
  }

  deleteBudget(id: number): Observable<void> {
    return this.api.delete<ApiResponse<void>>(`${this.budgets}/${id}`).pipe(map(() => undefined));
  }

  // ── Expense ──────────────────────────────────────────────────────────────────

  getExpenses(status?: string): Observable<Expense[]> {
    const url = status ? `${this.expenses}?status=${status}` : this.expenses;
    return this.api.get<ApiResponse<Expense[]>>(url).pipe(map(r => r.data));
  }

  createExpense(request: Partial<Expense> & { budgetId?: number }): Observable<Expense> {
    return this.api.post<ApiResponse<Expense>>(this.expenses, request).pipe(map(r => r.data));
  }

  approveExpense(id: number, request: ExpenseApprovalRequest): Observable<Expense> {
    return this.api.patch<ApiResponse<Expense>>(`${this.expenses}/${id}/approve`, request).pipe(map(r => r.data));
  }

  rejectExpense(id: number, request: ExpenseApprovalRequest): Observable<Expense> {
    return this.api.patch<ApiResponse<Expense>>(`${this.expenses}/${id}/reject`, request).pipe(map(r => r.data));
  }

  cancelExpense(id: number): Observable<Expense> {
    return this.api.patch<ApiResponse<Expense>>(`${this.expenses}/${id}/cancel`, {}).pipe(map(r => r.data));
  }

  // ── Income ───────────────────────────────────────────────────────────────────

  getIncomes(): Observable<Income[]> {
    return this.api.get<ApiResponse<Income[]>>(this.incomes).pipe(map(r => r.data));
  }

  createIncome(request: Partial<Income>): Observable<Income> {
    return this.api.post<ApiResponse<Income>>(this.incomes, request).pipe(map(r => r.data));
  }

  deleteIncome(id: number): Observable<void> {
    return this.api.delete<ApiResponse<void>>(`${this.incomes}/${id}`).pipe(map(() => undefined));
  }

  // ── Ledger ───────────────────────────────────────────────────────────────────

  getLedger(type?: LedgerEntryType): Observable<LedgerEntry[]> {
    const url = type ? `finance/ledger?type=${type}` : 'finance/ledger';
    return this.api.get<ApiResponse<LedgerEntry[]>>(url).pipe(map(r => r.data));
  }
}
