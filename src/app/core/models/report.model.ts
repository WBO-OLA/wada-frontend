export interface PersonnelSummary {
  totalMembers: number;
  active: number;
  newJoiners: number;
  injured: number;
  retired: number;
  passedAway: number;
  byRank: Record<string, number>;
  byUnit: Record<string, number>;
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
  totalBudgets: number;
  activeBudgets: number;
  totalBudgetAmount: number;
  totalAllocatedAmount: number;
  pendingExpenses: number;
  approvedExpenses: number;
  approvedExpensesTotal: number;
  totalIncomes: number;
  totalIncomeAmount: number;
}

export interface DashboardReport {
  personnel: PersonnelSummary;
  inventory: InventorySummary;
  finance: FinanceSummary;
  generatedAt: string;
}
