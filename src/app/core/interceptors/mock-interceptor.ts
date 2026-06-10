import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MockDataService } from '../services/mock-data.service';

export const mockInterceptor: HttpInterceptorFn = (req, next) => {
  const mockDataService = inject(MockDataService);

  if (!req.url.includes('api')) {
    return next(req);
  }

  console.log(`[MOCK] ${req.method} ${req.url}`);

  const mockResponse = mockDataService.getResponseByUrl(req.url, req.method, req.body);

  const response = new HttpResponse({
    body: mockResponse,
    headers: req.headers,
    status: 200,
    statusText: 'OK',
    url: req.url,
  });

  return of(response).pipe(delay(300));
};



