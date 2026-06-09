import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api';
import { ApiResponse } from '../../../core/models/api-response.model';
import { PurchaseOrder, OrderStatus } from '../../../core/models/purchase-order.model';

@Injectable({ providedIn: 'root' })
export class PurchaseOrderService {
  private readonly path = 'inventory/purchase-orders';

  constructor(private api: ApiService) {}

  getAll(status?: OrderStatus): Observable<PurchaseOrder[]> {
    const url = status ? `${this.path}?status=${status}` : this.path;
    return this.api.get<ApiResponse<PurchaseOrder[]>>(url).pipe(map(r => r.data));
  }

  create(request: Partial<PurchaseOrder>): Observable<PurchaseOrder> {
    return this.api.post<ApiResponse<PurchaseOrder>>(this.path, request).pipe(map(r => r.data));
  }

  updateStatus(id: number, status: OrderStatus): Observable<PurchaseOrder> {
    return this.api.patch<ApiResponse<PurchaseOrder>>(`${this.path}/${id}/status`, { status }).pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.api.delete<ApiResponse<void>>(`${this.path}/${id}`).pipe(map(() => undefined));
  }
}
