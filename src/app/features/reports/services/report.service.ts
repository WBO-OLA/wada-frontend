import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api';
import { ApiResponse } from '../../../core/models/api-response.model';
import { DashboardReport } from '../../../core/models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private api = inject(ApiService);

  getDashboard(commandId?: number | null): Observable<DashboardReport> {
    const url = commandId != null
      ? `reports/dashboard?commandId=${commandId}`
      : 'reports/dashboard';
    return this.api.get<ApiResponse<DashboardReport>>(url).pipe(map(r => r.data));
  }
}
