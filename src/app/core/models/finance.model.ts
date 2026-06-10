export type BudgetStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';
export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type LedgerEntryType =
  | 'BUDGET_CREATED' | 'BUDGET_ACTIVATED' | 'BUDGET_CLOSED'
  | 'EXPENSE_SUBMITTED' | 'EXPENSE_APPROVED' | 'EXPENSE_REJECTED'
  | 'INCOME_RECEIVED';

export const BUDGET_STATUS_LABELS: Record<BudgetStatus, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  CLOSED: 'Closed',
};

export const BUDGET_STATUS_COLORS: Record<BudgetStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  ACTIVE: 'bg-green-100 text-green-700',
  CLOSED: 'bg-slate-100 text-slate-500',
};

export const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

export const EXPENSE_STATUS_COLORS: Record<ExpenseStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

export const LEDGER_TYPE_LABELS: Record<LedgerEntryType, string> = {
  BUDGET_CREATED: 'Budget Created',
  BUDGET_ACTIVATED: 'Budget Activated',
  BUDGET_CLOSED: 'Budget Closed',
  EXPENSE_SUBMITTED: 'Expense Submitted',
  EXPENSE_APPROVED: 'Expense Approved',
  EXPENSE_REJECTED: 'Expense Rejected',
  INCOME_RECEIVED: 'Income Received',
};

export const LEDGER_TYPE_COLORS: Record<LedgerEntryType, string> = {
  BUDGET_CREATED: 'bg-blue-100 text-blue-700',
  BUDGET_ACTIVATED: 'bg-indigo-100 text-indigo-700',
  BUDGET_CLOSED: 'bg-slate-100 text-slate-600',
  EXPENSE_SUBMITTED: 'bg-amber-100 text-amber-700',
  EXPENSE_APPROVED: 'bg-green-100 text-green-700',
  EXPENSE_REJECTED: 'bg-red-100 text-red-700',
  INCOME_RECEIVED: 'bg-emerald-100 text-emerald-700',
};

export interface Budget {
  id?: number;
  name: string;
  fiscalYear: number;
  totalAmount: number;
  allocatedAmount?: number;
  remainingAmount?: number;
  department?: string;
  description?: string;
  status?: BudgetStatus;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  id?: number;
  title: string;
  description?: string;
  amount: number;
  category?: string;
  budget?: { id: number; name: string };
  status?: ExpenseStatus;
  submittedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  reference?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseApprovalRequest {
  approvedBy: string;
  rejectionReason?: string;
  notes?: string;
}

export interface Income {
  id?: number;
  title: string;
  amount: number;
  currency?: string;
  communityGroup?: string;
  country?: string;
  source?: string;
  category?: string;
  receivedDate?: string;
  reference?: string;
  recordedBy?: string;
  notes?: string;
  createdAt?: string;
}

export interface LedgerEntry {
  id: number;
  type: LedgerEntryType;
  amount: number;
  description: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  createdBy?: string;
  createdAt: string;
}

export interface IncomeAggregate {
  byGroup: Record<string, number>;
  byCountry: Record<string, number>;
  globalTotal: number;
}
