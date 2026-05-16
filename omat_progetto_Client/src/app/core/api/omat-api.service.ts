import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export type CreateOrderPayload = {
  title: string;
  material: string;
  description: string;
  priority: string;
  quantity: number;
  notes?: string;
  attachments?: Array<{
    fileName: string;
    contentType: string;
    size: number;
  }>;
};

export type CreatePctoPayload = {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  postalCode: string;
  school: string;
  classYear: string;
  studyProgram: string;
  startDate: string;
  endDate: string;
  motivation: string;
};

export type LoginResponse = {
  token: string;
  user: {
    id: number;
    email: string;
    role: 'azienda' | 'admin';
    name: string;
  };
};

@Injectable({ providedIn: 'root' })
export class OmatApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://127.0.0.1:3001/api';

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.baseUrl}/auth/login`,
      { email, password },
      { withCredentials: true },
    );
  }

  createOrder(payload: CreateOrderPayload): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/orders`, payload, { withCredentials: true });
  }

  createPctoRequest(payload: CreatePctoPayload): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/pcto`, payload, { withCredentials: true });
  }
}
