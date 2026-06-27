export type OrderStatus = 'PENDING' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseOrder {
  id?: number;
  orderNumber?: string;
  supplier: string;
  itemName: string;
  itemSku?: string;
  quantity: number;
  unitPrice: number;
  totalAmount?: number;
  status: OrderStatus;
  orderedBy?: string;
  expectedDeliveryDate?: string;
  notes?: string;
  commandId?: number | null;
  createdAt?: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  RECEIVED: 'Received',
  CANCELLED: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  RECEIVED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};
