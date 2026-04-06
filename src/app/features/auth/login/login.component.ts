import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule, InputTextModule, PasswordModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div class="w-full max-w-md">

        <!-- Logo -->
        <div class="text-center mb-8">
          <a routerLink="/" class="inline-flex flex-col items-center gap-3 mb-2">
            <div class="w-14 h-14 rounded-2xl bg-primary-700 flex items-center justify-center shadow-lg">
              <i class="pi pi-shield text-white text-2xl"></i>
            </div>
            <span class="font-bold text-slate-800 text-xl tracking-tight">TenaDigital</span>
          </a>
          <h1 class="text-2xl font-bold text-slate-800 mt-2">Welcome back</h1>
          <p class="text-slate-500 text-sm mt-1">Sign in to your account to continue</p>
        </div>

        <!-- Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <p class="text-slate-600 mb-6">You will be redirected to the secure identity provider to sign in or create an account.</p>
          <p-button label="Sign In with Provider" styleClass="w-full"
                    icon="pi pi-lock" (onClick)="submit()" />
        </div>

        <p class="text-center text-sm text-slate-500 mt-6">
          Don't have an account?
          <a routerLink="/register" class="text-primary-600 font-semibold hover:text-primary-700 ml-1">
            Create one free
          </a>
        </p>

        <p class="text-center mt-3">
          <a routerLink="/" class="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            <i class="pi pi-arrow-left text-xs mr-1"></i>Back to home
          </a>
        </p>

      </div>
    </div>
  `,
})
export class LoginComponent {
  private auth  = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  submit() {
    this.auth.login();
  }
}
