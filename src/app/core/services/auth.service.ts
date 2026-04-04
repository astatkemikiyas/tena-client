import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

export interface RegisterRequest {
  firstName:   string;
  lastName:    string;
  phoneNumber: string;
  password:    string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'tena_access_token';
  private http   = inject(HttpClient);
  private router = inject(Router);

  readonly isAuthenticated = signal(this.tokenValid());

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
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
    ).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.access_token);
        this.isAuthenticated.set(true);
      }),
    );
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/public/register`, data);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isAuthenticated.set(false);
    this.router.navigate(['/']);
  }
}
