import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api';
import { ApiResponse } from '../../../core/models/api-response.model';
import { environment } from '../../../../environments/environment';
import {
  Member, MedicalRecord, MemberActivity,
  MemberRankUpdateRequest, MemberStatusUpdateRequest,
  MemberTransferRequest, TransferHistoryEntry,
  RankHistoryEntry, StatusHistoryEntry,
  MemberResponsibilityUpdateRequest, ResponsibilityHistoryEntry
} from '../../../core/models/member.model';

@Injectable({ providedIn: 'root' })
export class MemberService {
  private readonly path = 'personnel/members';
  private http = inject(HttpClient);

  constructor(private api: ApiService) {}

  getAll(params?: Record<string, string>): Observable<Member[]> {
    let url = this.path;
    if (params) {
      const qs = new URLSearchParams(params).toString();
      if (qs) url += '?' + qs;
    }
    return this.api.get<ApiResponse<Member[]>>(url).pipe(map(r => r.data));
  }

  getById(id: number): Observable<Member> {
    return this.api.get<ApiResponse<Member>>(`${this.path}/${id}`).pipe(map(r => r.data));
  }

  create(request: Partial<Member>): Observable<Member> {
    return this.api.post<ApiResponse<Member>>(this.path, request).pipe(map(r => r.data));
  }

  update(id: number, request: Partial<Member>): Observable<Member> {
    return this.api.put<ApiResponse<Member>>(`${this.path}/${id}`, request).pipe(map(r => r.data));
  }

  updateStatus(id: number, request: MemberStatusUpdateRequest): Observable<Member> {
    return this.api.patch<ApiResponse<Member>>(`${this.path}/${id}/status`, request).pipe(map(r => r.data));
  }

  promoteRank(id: number, request: MemberRankUpdateRequest): Observable<Member> {
    return this.api.patch<ApiResponse<Member>>(`${this.path}/${id}/rank`, request).pipe(map(r => r.data));
  }

  remove(id: number): Observable<void> {
    return this.api.delete<ApiResponse<void>>(`${this.path}/${id}`).pipe(map(() => undefined));
  }

  getStatusHistory(id: number): Observable<StatusHistoryEntry[]> {
    return this.api.get<ApiResponse<StatusHistoryEntry[]>>(`${this.path}/${id}/status-history`).pipe(map(r => r.data));
  }

  getRankHistory(id: number): Observable<RankHistoryEntry[]> {
    return this.api.get<ApiResponse<RankHistoryEntry[]>>(`${this.path}/${id}/rank-history`).pipe(map(r => r.data));
  }

  getMedicalRecords(id: number): Observable<MedicalRecord[]> {
    return this.api.get<ApiResponse<MedicalRecord[]>>(`${this.path}/${id}/medical-records`).pipe(map(r => r.data));
  }

  addMedicalRecord(id: number, request: Partial<MedicalRecord>): Observable<MedicalRecord> {
    return this.api.post<ApiResponse<MedicalRecord>>(`${this.path}/${id}/medical-records`, request).pipe(map(r => r.data));
  }

  deleteMedicalRecord(recordId: number): Observable<void> {
    return this.api.delete<ApiResponse<void>>(`personnel/medical-records/${recordId}`).pipe(map(() => undefined));
  }

  getActivities(id: number): Observable<MemberActivity[]> {
    return this.api.get<ApiResponse<MemberActivity[]>>(`${this.path}/${id}/activities`).pipe(map(r => r.data));
  }

  addActivity(id: number, request: Partial<MemberActivity>): Observable<MemberActivity> {
    return this.api.post<ApiResponse<MemberActivity>>(`${this.path}/${id}/activities`, request).pipe(map(r => r.data));
  }

  deleteActivity(activityId: number): Observable<void> {
    return this.api.delete<ApiResponse<void>>(`personnel/activities/${activityId}`).pipe(map(() => undefined));
  }

  transfer(id: number, request: MemberTransferRequest): Observable<Member> {
    return this.api.patch<ApiResponse<Member>>(`${this.path}/${id}/transfer`, request).pipe(map(r => r.data));
  }

  getTransferHistory(id: number): Observable<TransferHistoryEntry[]> {
    return this.api.get<ApiResponse<TransferHistoryEntry[]>>(`${this.path}/${id}/transfer-history`).pipe(map(r => r.data));
  }

  updateResponsibility(id: number, request: MemberResponsibilityUpdateRequest): Observable<Member> {
    return this.api.patch<ApiResponse<Member>>(`${this.path}/${id}/responsibility`, request).pipe(map(r => r.data));
  }

  getResponsibilityHistory(id: number): Observable<ResponsibilityHistoryEntry[]> {
    return this.api.get<ApiResponse<ResponsibilityHistoryEntry[]>>(`${this.path}/${id}/responsibility-history`).pipe(map(r => r.data));
  }

  uploadPhoto(id: number, file: File): Observable<Member> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<ApiResponse<Member>>(`${environment.apiUrl}/personnel/members/${id}/photo`, form)
      .pipe(map(r => r.data));
  }

  getPhotoUrl(id: number): string {
    return `${environment.apiUrl}/personnel/members/${id}/photo`;
  }
}
