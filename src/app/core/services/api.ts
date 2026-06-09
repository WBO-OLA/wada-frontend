import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(url: string): Observable<T> {
    return this.http.get<T>(`${environment.apiUrl}/${url}`);
  }

  post<T>(url: string, data: unknown): Observable<T> {
    return this.http.post<T>(`${environment.apiUrl}/${url}`, data);
  }

  put<T>(url: string, data: unknown): Observable<T> {
    return this.http.put<T>(`${environment.apiUrl}/${url}`, data);
  }

  patch<T>(url: string, data: unknown): Observable<T> {
    return this.http.patch<T>(`${environment.apiUrl}/${url}`, data);
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(`${environment.apiUrl}/${url}`);
  }
}
