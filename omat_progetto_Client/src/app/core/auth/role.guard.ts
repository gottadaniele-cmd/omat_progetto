import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService, UserRole } from './auth-state.service';

export function requireRole(roles: UserRole[]): CanActivateFn {
  return () => {
    const auth = inject(AuthStateService);
    const router = inject(Router);
    const role = auth.role();

    if (role && roles.includes(role)) {
      return true;
    }

    return router.createUrlTree(['/login']);
  };
}
