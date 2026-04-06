import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from '../config/auth.config';
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

  readonly isAuthenticated = signal(false);

  constructor() {
    this.configureOauth();
  }

  private configureOauth() {
    this.oauthService.configure(authConfig);
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      this.isAuthenticated.set(this.oauthService.hasValidAccessToken());
      this.oauthService.setupAutomaticSilentRefresh();
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
