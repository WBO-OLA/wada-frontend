import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Warehouse } from '../../../core/models/warehouse.model';

@Injectable({ providedIn: 'root' })
export class WarehouseService {
  private readonly path = 'inventory/warehouses';

  constructor(private api: ApiService) {}

  getAll(): Observable<Warehouse[]> {
    return this.api.get<ApiResponse<Warehouse[]>>(this.path).pipe(map(r => r.data));
  }

  getActive(): Observable<Warehouse[]> {
    return this.api.get<ApiResponse<Warehouse[]>>(`${this.path}?active=true`).pipe(map(r => r.data));
  }

  getById(id: number): Observable<Warehouse> {
    return this.api.get<ApiResponse<Warehouse>>(`${this.path}/${id}`).pipe(map(r => r.data));
  }

  create(request: Partial<Warehouse>): Observable<Warehouse> {
    return this.api.post<ApiResponse<Warehouse>>(this.path, request).pipe(map(r => r.data));
  }

  update(id: number, request: Partial<Warehouse>): Observable<Warehouse> {
    return this.api.put<ApiResponse<Warehouse>>(`${this.path}/${id}`, request).pipe(map(r => r.data));
  }
}
