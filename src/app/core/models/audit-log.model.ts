export interface AuditLogEntry {
  id: number;
  username: string;
  action: string;
  targetTable: string;
  targetId?: number | null;
  commandId?: number | null;
  createdAt: string;
  sourceService: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const AUDIT_TARGET_TABLES = [
  'users', 'members', 'commands', 'member_documents', 'medical_records',
  'member_activities', 'items', 'warehouses', 'purchase_orders',
  'stock_transactions', 'asset_assignments', 'budgets', 'expenses', 'incomes',
];
