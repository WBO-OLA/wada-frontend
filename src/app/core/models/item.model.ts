export interface Item {
  id?: number;
  name: string;
  description?: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  category?: string;
  commandId?: number | null;
  warehouse?: { id: number; name: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface StockTransactionRequest {
  itemId: number;
  warehouseId: number;
  quantity: number;
  referenceNumber?: string;
  performedBy?: string;
  notes?: string;
}
