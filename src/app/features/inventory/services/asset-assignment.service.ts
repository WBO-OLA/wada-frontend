import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AssetAssignment } from '../../../core/models/asset-assignment.model';

@Injectable({ providedIn: 'root' })
export class AssetAssignmentService {
  private readonly path = 'inventory/assignments';

  constructor(private api: ApiService) {}

  getAll(itemId?: number): Observable<AssetAssignment[]> {
    const url = itemId ? `${this.path}?itemId=${itemId}` : this.path;
    return this.api.get<ApiResponse<AssetAssignment[]>>(url).pipe(map(r => r.data));
  }

  getActiveByMember(memberId: number): Observable<AssetAssignment[]> {
    return this.api.get<ApiResponse<AssetAssignment[]>>(`${this.path}/member/${memberId}`).pipe(map(r => r.data));
  }

  assign(request: Partial<AssetAssignment> & { itemId: number }): Observable<AssetAssignment> {
    return this.api.post<ApiResponse<AssetAssignment>>(this.path, request).pipe(map(r => r.data));
  }

  returnItem(id: number): Observable<AssetAssignment> {
    return this.api.patch<ApiResponse<AssetAssignment>>(`${this.path}/${id}/return`, {}).pipe(map(r => r.data));
  }
}
