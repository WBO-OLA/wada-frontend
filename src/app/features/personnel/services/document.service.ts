import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { MemberDocument } from '../../../core/models/document.model';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private http = inject(HttpClient);

  private base(memberId: number) {
    return `${environment.apiUrl}/personnel/members/${memberId}/documents`;
  }

  getDocuments(memberId: number): Observable<MemberDocument[]> {
    return this.http.get<ApiResponse<MemberDocument[]>>(this.base(memberId))
      .pipe(map(r => r.data));
  }

  upload(memberId: number, file: File, description: string, uploadedBy: string): Observable<MemberDocument> {
    const form = new FormData();
    form.append('file', file);
    if (description) form.append('description', description);
    if (uploadedBy) form.append('uploadedBy', uploadedBy);
    return this.http.post<ApiResponse<MemberDocument>>(this.base(memberId), form)
      .pipe(map(r => r.data));
  }

  getDownloadUrl(docId: number): string {
    return `${environment.apiUrl}/personnel/documents/${docId}/download`;
  }

  delete(docId: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(
      `${environment.apiUrl}/personnel/documents/${docId}`
    ).pipe(map(() => undefined));
  }
}
