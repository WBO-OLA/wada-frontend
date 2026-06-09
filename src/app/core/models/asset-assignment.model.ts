export type AssignmentStatus = 'ASSIGNED' | 'RETURNED';

export interface AssetAssignment {
  id?: number;
  item?: { id: number; name: string; sku: string };
  itemId?: number;
  memberId: number;
  memberName: string;
  assignedBy?: string;
  returnedAt?: string;
  notes?: string;
  status: AssignmentStatus;
  createdAt?: string;
}
