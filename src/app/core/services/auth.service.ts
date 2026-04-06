import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { OAuthService } from 'angular-oauth2-oidc';
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
  private http = inject(HttpClient);
  private router = inject(Router);
  private oauthService = inject(OAuthService);

  readonly isAuthenticated = signal(this.oauthService.hasValidAccessToken());

  constructor() {
    // Only react to token lifecycle events — ignore discovery/JWKS/session events
    // that fire mid-flight and could temporarily return false from hasValidAccessToken().
    this.oauthService.events
      .pipe(filter(e => ['token_received', 'token_refreshed', 'token_error', 'logout', 'session_terminated', 'session_error'].includes(e.type)))
      .subscribe(() => {
        this.isAuthenticated.set(this.oauthService.hasValidAccessToken());
      });
  }

  getToken(): string | null {
    return this.oauthService.getAccessToken();
  }

  login(): void {
    this.oauthService.initCodeFlow();
  }

  logout(): void {
    this.oauthService.logOut();
    this.isAuthenticated.set(false);
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/public/register`, data);
  }
}
