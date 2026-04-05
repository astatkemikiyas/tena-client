import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, switchMap, map, catchError, finalize, shareReplay } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

interface TokenResponse {
  access_token:  string;
  refresh_token?: string;
  expires_in:    number;
}

export interface RegisterRequest {
  firstName:   string;
  lastName:    string;
  username:    string;
  phoneNumber: string;
  email:       string;
  password:    string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY   = 'tena_access_token';
  private readonly REFRESH_KEY = 'tena_refresh_token';

  private http   = inject(HttpClient);
  private router = inject(Router);

  /** Shared in-flight refresh observable — prevents parallel refresh calls. */
  private refreshInProgress$: Observable<string> | null = null;

  readonly isAuthenticated = signal(this.tokenValid());

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  /** Decode JWT and check expiry. */
  tokenValid(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  login(username: string, password: string): Observable<TokenResponse> {
    const body = new URLSearchParams({
      grant_type: 'password',
      client_id:  environment.keycloakClientId,
      username,
      password,
    });
    return this.http.post<TokenResponse>(
      `${environment.keycloakUrl}/realms/${environment.keycloakRealm}/protocol/openid-connect/token`,
      body.toString(),
      { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }) },
    ).pipe(tap(res => this.storeTokens(res)));
  }

  /** Use the refresh token to silently obtain a new access token.
   *  Multiple concurrent callers share one in-flight request via shareReplay. */
  refresh(): Observable<string> {
    if (this.refreshInProgress$) return this.refreshInProgress$;

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return throwError(() => new Error('No refresh token available'));

    const body = new URLSearchParams({
      grant_type:    'refresh_token',
      client_id:     environment.keycloakClientId,
      refresh_token: refreshToken,
    });

    this.refreshInProgress$ = this.http.post<TokenResponse>(
      `${environment.keycloakUrl}/realms/${environment.keycloakRealm}/protocol/openid-connect/token`,
      body.toString(),
      { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }) },
    ).pipe(
      tap(res  => this.storeTokens(res)),
      map(res  => res.access_token),
      catchError(err => { this.logout(); return throwError(() => err); }),
      finalize(() => { this.refreshInProgress$ = null; }),
      shareReplay(1),
    );

    return this.refreshInProgress$;
  }

  /** If input looks like an email, resolve it to a Keycloak username first, then login. */
  loginWithEmailOrUsername(emailOrUsername: string, password: string): Observable<TokenResponse> {
    if (!emailOrUsername.includes('@')) {
      return this.login(emailOrUsername, password);
    }
    return this.http
      .get<{ username: string }>(`${environment.apiUrl}/api/public/resolve-username?email=${encodeURIComponent(emailOrUsername)}`)
      .pipe(switchMap(res => this.login(res.username, password)));
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/public/register`, data);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    this.isAuthenticated.set(false);
    this.router.navigate(['/']);
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private storeTokens(res: TokenResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.access_token);
    if (res.refresh_token) {
      localStorage.setItem(this.REFRESH_KEY, res.refresh_token);
    }
    this.isAuthenticated.set(true);
  }
}
