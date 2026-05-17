import { Injectable, computed, signal } from '@angular/core';

export type UserRole = 'azienda' | 'admin' | 'studente';

export type AuthUser = {
  id: number;
  email: string;
  role: UserRole;
  name: string;
};

const STORAGE_KEY = 'omat-user';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly userSignal = signal<AuthUser | null>(this.readStoredUser());

  readonly user = this.userSignal.asReadonly();
  readonly isLoggedIn = computed(() => Boolean(this.userSignal()));
  readonly role = computed(() => this.userSignal()?.role ?? null);
  readonly displayRole = computed(() => {
    const role = this.userSignal()?.role;

    if (role === 'admin') {
      return 'Admin';
    }

    if (role === 'azienda') {
      return 'Azienda';
    }

    if (role === 'studente') {
      return 'Studente';
    }

    return '';
  });

  setUser(user: AuthUser): void {
    this.userSignal.set(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  clearUser(): void {
    this.userSignal.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  private readStoredUser(): AuthUser | null {
    try {
      const rawUser = localStorage.getItem(STORAGE_KEY);
      return rawUser ? (JSON.parse(rawUser) as AuthUser) : null;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }
}
