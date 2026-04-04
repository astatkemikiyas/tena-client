import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule, InputTextModule, PasswordModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div class="w-full max-w-md">

        <!-- Logo -->
        <div class="text-center mb-8">
          <a routerLink="/" class="inline-flex flex-col items-center gap-3 mb-2">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg">
              <i class="pi pi-heart text-white text-2xl"></i>
            </div>
            <span class="font-bold text-slate-800 text-xl tracking-tight">Tena</span>
          </a>
          <h1 class="text-2xl font-bold text-slate-800 mt-2">Create your account</h1>
          <p class="text-slate-500 text-sm mt-1">Join thousands of patients booking care online</p>
        </div>

        <!-- Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <form class="space-y-4" (ngSubmit)="submit()">

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-slate-700">First Name</label>
                <input pInputText [(ngModel)]="form.firstName" name="firstName"
                       placeholder="Abebe" class="w-full" [disabled]="loading()" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-slate-700">Last Name</label>
                <input pInputText [(ngModel)]="form.lastName" name="lastName"
                       placeholder="Kebede" class="w-full" [disabled]="loading()" />
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700">Phone Number</label>
              <input pInputText [(ngModel)]="form.phoneNumber" name="phoneNumber"
                     placeholder="+251 9XX XXX XXX" class="w-full" [disabled]="loading()" />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700">Password</label>
              <p-password [(ngModel)]="form.password" name="password"
                          placeholder="Create a strong password"
                          styleClass="w-full" inputStyleClass="w-full"
                          [toggleMask]="true" [disabled]="loading()" />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700">Confirm Password</label>
              <p-password [(ngModel)]="confirmPassword" name="confirmPassword"
                          placeholder="Repeat your password"
                          styleClass="w-full" inputStyleClass="w-full"
                          [feedback]="false" [toggleMask]="true" [disabled]="loading()" />
            </div>

            @if (error()) {
              <div class="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                <i class="pi pi-exclamation-circle text-rose-500 text-sm mt-0.5 flex-shrink-0"></i>
                <p class="text-sm text-rose-700">{{ error() }}</p>
              </div>
            }

            @if (success()) {
              <div class="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <i class="pi pi-check-circle text-emerald-500 text-sm mt-0.5 flex-shrink-0"></i>
                <p class="text-sm text-emerald-700">Account created! Redirecting to login…</p>
              </div>
            }

            <p-button label="Create Account" styleClass="w-full" type="submit"
                      icon="pi pi-user-plus" [loading]="loading()" />

          </form>
        </div>

        <p class="text-center text-sm text-slate-500 mt-6">
          Already have an account?
          <a routerLink="/login" class="text-indigo-600 font-semibold hover:text-indigo-700 ml-1">
            Sign in
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
export class RegisterComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  form = { firstName: '', lastName: '', phoneNumber: '', password: '' };
  confirmPassword = '';
  loading = signal(false);
  error   = signal('');
  success = signal(false);

  submit() {
    const { firstName, lastName, phoneNumber, password } = this.form;
    if (!firstName || !lastName || !phoneNumber || !password) {
      this.error.set('All fields are required.'); return;
    }
    if (password !== this.confirmPassword) {
      this.error.set('Passwords do not match.'); return;
    }
    if (password.length < 8) {
      this.error.set('Password must be at least 8 characters.'); return;
    }
    this.loading.set(true);
    this.error.set('');
    this.auth.register(this.form).subscribe({
      next: () => {
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        const msg = err?.error?.message ?? err?.error?.error;
        this.error.set(msg || 'Registration failed. Please try again.');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
