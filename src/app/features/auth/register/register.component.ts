import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

const FIELD = 'w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 font-medium bg-white outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex">

      <!-- ── Left brand panel ─────────────────────────────────── -->
      <div class="hidden lg:flex lg:w-[420px] xl:w-[460px] bg-primary-600 flex-col justify-between p-12 flex-shrink-0 relative overflow-hidden">
        <!-- Subtle decoration -->
        <div class="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-white/5 pointer-events-none"></div>
        <div class="absolute top-20 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none"></div>

        <!-- Logo -->
        <a routerLink="/" class="flex items-center gap-3 relative z-10">
          <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <i class="pi pi-shield text-white text-lg"></i>
          </div>
          <span class="font-bold text-white text-lg tracking-tight">TenaDigital</span>
        </a>

        <!-- Tagline + features -->
        <div class="relative z-10">
          <h2 class="text-3xl font-extrabold text-white leading-tight mb-3">
            Better care,<br/>just a few clicks away.
          </h2>
          <p class="text-primary-200 text-sm leading-relaxed mb-10">
            Find and book verified healthcare specialists across Ethiopia — from the comfort of your home.
          </p>
          <div class="space-y-5">
            @for (f of features; track f.text) {
              <div class="flex items-center gap-4">
                <div class="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                  <i [class]="'pi text-white text-sm ' + f.icon"></i>
                </div>
                <p class="text-primary-100 text-sm font-medium">{{ f.text }}</p>
              </div>
            }
          </div>
        </div>

        <p class="text-primary-300/70 text-xs relative z-10">© 2025 TenaDigital. All rights reserved.</p>
      </div>

      <!-- ── Right form panel ─────────────────────────────────── -->
      <div class="flex-1 flex items-center justify-center bg-slate-50 px-6 py-12 overflow-y-auto">
        <div class="w-full max-w-md">

          <!-- Mobile logo -->
          <div class="lg:hidden text-center mb-8">
            <a routerLink="/" class="inline-flex flex-col items-center gap-2">
              <div class="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg">
                <i class="pi pi-shield text-white text-xl"></i>
              </div>
              <span class="font-bold text-slate-800 text-lg tracking-tight">TenaDigital</span>
            </a>
          </div>

          <!-- Heading -->
          <div class="mb-7">
            <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Create your account</h1>
            <p class="text-slate-400 text-sm mt-1 font-medium">Fill in your details to get started</p>
          </div>

          <!-- Form card -->
          <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <form (ngSubmit)="submit()" class="space-y-5">

              <!-- ── Personal info ── -->
              <div>
                <p class="text-[11px] font-black text-primary-500 uppercase tracking-widest mb-3">Personal info</p>
                <div class="grid grid-cols-2 gap-3">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-slate-600">First name</label>
                    <input type="text" [(ngModel)]="form.firstName" name="firstName"
                           placeholder="Abebe" [class]="FIELD" [disabled]="loading()" />
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-slate-600">Last name</label>
                    <input type="text" [(ngModel)]="form.lastName" name="lastName"
                           placeholder="Kebede" [class]="FIELD" [disabled]="loading()" />
                  </div>
                </div>
              </div>

              <!-- ── Account info ── -->
              <div class="pt-1">
                <p class="text-[11px] font-black text-primary-500 uppercase tracking-widest mb-3">Account info</p>
                <div class="space-y-3">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-slate-600">Username</label>
                    <input type="text" [(ngModel)]="form.username" name="username"
                           placeholder="abebe_kebede" [class]="FIELD" [disabled]="loading()" />
                    <p class="text-[11px] text-slate-400">Min 3 characters, no spaces</p>
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-slate-600">Email</label>
                    <input type="email" [(ngModel)]="form.email" name="email"
                           placeholder="abebe@example.com" [class]="FIELD" [disabled]="loading()" />
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-slate-600">Phone number</label>
                    <input type="tel" [(ngModel)]="form.phoneNumber" name="phoneNumber"
                           placeholder="+251 9XX XXX XXX" [class]="FIELD" [disabled]="loading()" />
                  </div>
                </div>
              </div>

              <!-- ── Security ── -->
              <div class="pt-1">
                <p class="text-[11px] font-black text-primary-500 uppercase tracking-widest mb-3">Security</p>
                <div class="space-y-3">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-slate-600">Password</label>
                    <div class="relative">
                      <input [type]="showPass() ? 'text' : 'password'"
                             [(ngModel)]="form.password" name="password"
                             placeholder="Minimum 8 characters" [class]="FIELD + ' pr-11'" [disabled]="loading()" />
                      <button type="button" (click)="showPass.set(!showPass())"
                              class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                        <i [class]="showPass() ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                      </button>
                    </div>
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-slate-600">Confirm password</label>
                    <div class="relative">
                      <input [type]="showConfPass() ? 'text' : 'password'"
                             [(ngModel)]="confirmPassword" name="confirmPassword"
                             placeholder="Repeat your password" [class]="FIELD + ' pr-11'" [disabled]="loading()" />
                      <button type="button" (click)="showConfPass.set(!showConfPass())"
                              class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                        <i [class]="showConfPass() ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Error / success banner -->
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

              <!-- Submit -->
              <button type="submit" [disabled]="loading()"
                      class="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white font-bold text-sm transition-all shadow-lg shadow-primary-600/25 disabled:opacity-60 disabled:cursor-not-allowed mt-1">
                @if (loading()) {
                  <svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creating account…
                } @else {
                  <i class="pi pi-user-plus"></i> Create Account
                }
              </button>

            </form>
          </div>

          <!-- Sign-in link -->
          <p class="text-center text-sm text-slate-500 mt-6">
            Already have an account?
            <a routerLink="/login" class="text-primary-600 font-bold hover:text-primary-700 ml-1">Sign in</a>
          </p>
          <p class="text-center mt-3">
            <a routerLink="/" class="text-xs text-slate-400 hover:text-slate-600 transition-colors">
              <i class="pi pi-arrow-left text-xs mr-1"></i>Back to home
            </a>
          </p>

        </div>
      </div><!-- / right panel -->

    </div>
  `,
})
export class RegisterComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  readonly FIELD = FIELD;

  form            = { firstName: '', lastName: '', username: '', email: '', phoneNumber: '', password: '' };
  confirmPassword = '';
  loading         = signal(false);
  error           = signal('');
  success         = signal(false);
  showPass        = signal(false);
  showConfPass    = signal(false);

  features = [
    { icon: 'pi-verified',    text: 'Verified, licensed specialists' },
    { icon: 'pi-calendar',    text: 'Real-time slot availability'    },
    { icon: 'pi-lock',        text: 'Secure & private records'       },
  ];

  submit() {
    const { firstName, lastName, username, email, phoneNumber, password } = this.form;
    if (!firstName || !lastName || !username || !email || !phoneNumber || !password) {
      this.error.set('All fields are required.'); return;
    }
    if (username.length < 3 || /\s/.test(username)) {
      this.error.set('Username must be at least 3 characters with no spaces.'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.error.set('Please enter a valid email address.'); return;
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
