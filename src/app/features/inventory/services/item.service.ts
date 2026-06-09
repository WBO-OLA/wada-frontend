import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Item, StockTransactionRequest } from '../../../core/models/item.model';

@Injectable({ providedIn: 'root' })
export class ItemService {
  private readonly path = 'inventory/items';
  private readonly stockPath = 'inventory/stock';

  constructor(private api: ApiService) {}

  getAll(params?: Record<string, string>): Observable<Item[]> {
    let url = this.path;
    if (params) {
      const qs = new URLSearchParams(params).toString();
      if (qs) url += '?' + qs;
    }
    return this.api.get<ApiResponse<Item[]>>(url).pipe(map(r => r.data));
  }

  getLowStock(threshold = 10): Observable<Item[]> {
    return this.api
      .get<ApiResponse<Item[]>>(`${this.path}/low-stock?threshold=${threshold}`)
      .pipe(map(r => r.data));
  }

  getById(id: number): Observable<Item> {
    return this.api.get<ApiResponse<Item>>(`${this.path}/${id}`).pipe(map(r => r.data));
  }

  create(request: Partial<Item> & { warehouseId?: number }): Observable<Item> {
    return this.api.post<ApiResponse<Item>>(this.path, request).pipe(map(r => r.data));
  }

  update(id: number, request: Partial<Item> & { warehouseId?: number }): Observable<Item> {
    return this.api.put<ApiResponse<Item>>(`${this.path}/${id}`, request).pipe(map(r => r.data));
  }

  remove(id: number): Observable<void> {
    return this.api.delete<ApiResponse<void>>(`${this.path}/${id}`).pipe(map(() => undefined));
  }

  stockIn(request: StockTransactionRequest): Observable<unknown> {
    return this.api.post<ApiResponse<unknown>>(`${this.stockPath}/in`, request).pipe(map(r => r.data));
  }

  stockOut(request: StockTransactionRequest): Observable<unknown> {
    return this.api.post<ApiResponse<unknown>>(`${this.stockPath}/out`, request).pipe(map(r => r.data));
  }

  getItemHistory(itemId: number): Observable<unknown[]> {
    return this.api
      .get<ApiResponse<unknown[]>>(`${this.stockPath}/item/${itemId}/history`)
      .pipe(map(r => r.data));
  }
}
