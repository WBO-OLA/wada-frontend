export interface PersonnelSummary {
  totalMembers: number;
  active: number;
  injured: number;
  retired: number;
  passedAway: number;
  byRank: Record<string, number>;
  byCommand: Record<string, number>;
}

export interface InventorySummary {
  totalItems: number;
  totalWarehouses: number;
  activeWarehouses: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalStockValue: number;
  byCategory: Record<string, number>;
}

export interface FinanceSummary {
  totalIncomes: number;
  totalIncomeAmount: number;
  totalBudgets: number;
  activeBudgets: number;
  totalBudgetAmount: number;
  totalAllocatedAmount: number;
  totalExpenses: number;
  pendingExpenses: number;
  approvedExpenses: number;
  totalApprovedExpenseAmount: number;
}

export interface DashboardReport {
  personnel: PersonnelSummary;
  inventory: InventorySummary;
  finance: FinanceSummary;
  generatedAt: string;
}
