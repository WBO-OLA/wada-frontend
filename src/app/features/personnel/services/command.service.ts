import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Command, CommandRequest } from '../../../core/models/command.model';

@Injectable({ providedIn: 'root' })
export class CommandService {
  private readonly path = 'personnel/commands';

  constructor(private api: ApiService) {}

  getAll(): Observable<Command[]> {
    return this.api.get<ApiResponse<Command[]>>(this.path).pipe(map(r => r.data));
  }

  getById(id: number): Observable<Command> {
    return this.api.get<ApiResponse<Command>>(`${this.path}/${id}`).pipe(map(r => r.data));
  }

  getChildren(id: number): Observable<Command[]> {
    return this.api.get<ApiResponse<Command[]>>(`${this.path}/${id}/children`).pipe(map(r => r.data));
  }

  getDescendantIds(id: number): Observable<number[]> {
    return this.api.get<ApiResponse<number[]>>(`${this.path}/${id}/descendants`).pipe(map(r => r.data));
  }

  create(request: CommandRequest): Observable<Command> {
    return this.api.post<ApiResponse<Command>>(this.path, request).pipe(map(r => r.data));
  }

  update(id: number, request: CommandRequest): Observable<Command> {
    return this.api.put<ApiResponse<Command>>(`${this.path}/${id}`, request).pipe(map(r => r.data));
  }

  assignCommander(commandId: number, memberId: number | null): Observable<Command> {
    return this.api.patch<ApiResponse<Command>>(`${this.path}/${commandId}/commander`, { memberId })
      .pipe(map(r => r.data));
  }

  remove(id: number): Observable<void> {
    return this.api.delete<ApiResponse<void>>(`${this.path}/${id}`).pipe(map(() => undefined));
  }
}
