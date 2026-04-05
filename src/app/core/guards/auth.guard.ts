import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.tokenValid()) return true;

  // Token expired — try refreshing before sending to login
  return auth.refresh().pipe(
    map(() => true),
    catchError(() => {
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return of(false);
    }),
  );
};
