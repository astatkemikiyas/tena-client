import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

function addBearer(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  // Only attach the Bearer token to requests going to our own backend API.
  // Keycloak's token endpoint and other external URLs must NOT receive it.
  const isOurApi = req.url.startsWith(environment.apiUrl);
  const isPublic = req.url.includes('/api/public/');

  const token = auth.getToken();
  // Public endpoints must never receive a Bearer token — Spring Security
  // validates any token it finds, rejecting expired ones even on permitAll() routes.
  const outgoing = (token && isOurApi && !isPublic) ? addBearer(req, token) : req;

  return next(outgoing).pipe(
    catchError(err => {
      // Only attempt refresh for 401s on protected backend endpoints
      if (err.status !== 401 || !isOurApi || isPublic) {
        return throwError(() => err);
      }

      // Try refreshing; on success retry the original request once
      return auth.refresh().pipe(
        switchMap(newToken => next(addBearer(req, newToken))),
        catchError(refreshErr => {
          // refresh() already calls logout() internally on failure
          return throwError(() => refreshErr);
        }),
      );
    }),
  );
};
