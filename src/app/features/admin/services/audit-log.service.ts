import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuditLogEntry, PageResponse } from '../../../core/models/audit-log.model';

export interface AuditLogSearchParams {
  action?: string;
  targetTable?: string;
  commandId?: number | null;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly path = 'reports/audit-logs';

  constructor(private api: ApiService) {}

  search(params: AuditLogSearchParams): Observable<PageResponse<AuditLogEntry>> {
    const query: Record<string, string> = {};
    if (params.action) query['action'] = params.action;
    if (params.targetTable) query['targetTable'] = params.targetTable;
    if (params.commandId != null) query['commandId'] = String(params.commandId);
    if (params.from) query['from'] = params.from;
    if (params.to) query['to'] = params.to;
    query['page'] = String(params.page ?? 0);
    query['size'] = String(params.size ?? 20);

    const qs = new URLSearchParams(query).toString();
    return this.api
      .get<ApiResponse<PageResponse<AuditLogEntry>>>(`${this.path}?${qs}`)
      .pipe(map(r => r.data));
  }
}
