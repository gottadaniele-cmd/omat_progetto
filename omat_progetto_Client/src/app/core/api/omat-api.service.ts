import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderRequest, OrderStatus } from '../models/order.model';
import { PctoRequest, PctoRequestStatus } from '../models/pcto-request.model';

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
    role: 'azienda' | 'admin' | 'studente';
    name: string;
  };
};

export type RegisterAdminPayload = {
  nome: string;
  cognome: string;
  ruolo: string;
  dataNascita?: string;
  numeroTelefono?: string;
  email: string;
  password: string;
};

export type RegisterCompanyPayload = {
  nomeAzienda: string;
  emailAzienda: string;
  password: string;
  luogo: string;
  contattoTelefonico: string;
};

export type RegisterStudentPayload = {
  nome: string;
  cognome?: string;
  numeroTelefono: string;
  email: string;
  citta?: string;
  cap: number;
  password: string;
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

  logout(): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(
      `${this.baseUrl}/auth/logout`,
      {},
      { withCredentials: true },
    );
  }

  createOrder(payload: CreateOrderPayload): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/orders`, payload, { withCredentials: true });
  }

  getOrders(): Observable<OrderRequest[]> {
    return this.http.get<OrderRequest[]>(`${this.baseUrl}/orders`, { withCredentials: true });
  }

  getOrder(id: string): Observable<OrderRequest> {
    return this.http.get<OrderRequest>(`${this.baseUrl}/orders/${id}`, { withCredentials: true });
  }

  updateOrderStatus(id: string, status: OrderStatus): Observable<OrderRequest> {
    return this.http.patch<OrderRequest>(
      `${this.baseUrl}/orders/${id}/status`,
      { status },
      { withCredentials: true },
    );
  }

  registerAdmin(payload: RegisterAdminPayload): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/auth/register-admin`, payload, {
      withCredentials: true,
    });
  }

  registerCompany(payload: RegisterCompanyPayload): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/auth/register-company`, payload, {
      withCredentials: true,
    });
  }

  registerStudent(payload: RegisterStudentPayload): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/auth/register-student`, payload, {
      withCredentials: true,
    });
  }

  createPctoRequest(payload: CreatePctoPayload): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/pcto`, payload, { withCredentials: true });
  }

  getPctoRequests(): Observable<PctoRequest[]> {
    return this.http.get<PctoRequest[]>(`${this.baseUrl}/pcto`, { withCredentials: true });
  }

  getPctoRequest(id: string): Observable<PctoRequest> {
    return this.http.get<PctoRequest>(`${this.baseUrl}/pcto/${id}`, { withCredentials: true });
  }

  updatePctoStatus(id: string, status: PctoRequestStatus): Observable<PctoRequest> {
    return this.http.patch<PctoRequest>(
      `${this.baseUrl}/pcto/${id}/status`,
      { status },
      { withCredentials: true },
    );
  }
}
