import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

const FIELD = 'w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-400 font-medium bg-white outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex flex-col lg:flex-row bg-white">

      <!-- ── Left: Form panel ─────────────────────────────────── -->
      <div class="flex-1 flex flex-col min-h-screen lg:min-h-0">

        <!-- Top bar -->
        <div class="flex items-center justify-between px-8 pt-8 pb-4">
          <a routerLink="/"
             class="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
            <i class="pi pi-arrow-left text-xs"></i>
            Go back
          </a>
          <span class="text-sm text-slate-500">
            Already have an account?
            <a routerLink="/login" class="font-semibold text-primary-600 hover:text-primary-700 ml-1">Log in</a>
          </span>
        </div>

        <!-- Form area -->
        <div class="flex-1 flex items-center justify-center px-8 py-8">
          <div class="w-full max-w-md">

            <!-- Logo + wordmark -->
            <a routerLink="/" class="inline-flex items-center gap-3 mb-7">
              <img src="assets/images/logo.png" alt="TenaDigital" class="h-16 w-auto" />
              <span class="font-extrabold text-slate-900 text-2xl tracking-tight leading-none">TenaDigital</span>
            </a>

            <!-- Heading -->
            <h1 class="text-[2rem] font-extrabold text-slate-900 tracking-tight mb-7">Register</h1>

            <form (ngSubmit)="submit()" class="space-y-4">

              <!-- Name row -->
              <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">First name</label>
                  <input type="text" [(ngModel)]="form.firstName" name="firstName"
                         placeholder="Abebe" [class]="FIELD" [disabled]="loading()" />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last name</label>
                  <input type="text" [(ngModel)]="form.lastName" name="lastName"
                         placeholder="Kebede" [class]="FIELD" [disabled]="loading()" />
                </div>
              </div>

              <!-- Username -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Username</label>
                <input type="text" [(ngModel)]="form.username" name="username"
                       placeholder="abebe_kebede" [class]="FIELD" [disabled]="loading()" />
                <p class="text-[11px] text-slate-400 -mt-0.5">Min 3 characters, no spaces</p>
              </div>

              <!-- E-mail -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">E-mail</label>
                <input type="email" [(ngModel)]="form.email" name="email"
                       placeholder="abebe@example.com" [class]="FIELD" [disabled]="loading()" />
              </div>

              <!-- Phone -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone number</label>
                <input type="tel" [(ngModel)]="form.phoneNumber" name="phoneNumber"
                       placeholder="+251 9XX XXX XXX" [class]="FIELD" [disabled]="loading()" />
              </div>

              <!-- Password -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
                <div class="relative">
                  <input [type]="showPass() ? 'text' : 'password'"
                         [(ngModel)]="form.password" name="password"
                         placeholder="Minimum 8 characters" [class]="FIELD + ' pr-11'" [disabled]="loading()" />
                  <button type="button" (click)="showPass.set(!showPass())"
                          class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    <i [class]="showPass() ? 'pi pi-eye-slash text-sm' : 'pi pi-eye text-sm'"></i>
                  </button>
                </div>
              </div>

              <!-- Confirm password -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirm password</label>
                <div class="relative">
                  <input [type]="showConfPass() ? 'text' : 'password'"
                         [(ngModel)]="confirmPassword" name="confirmPassword"
                         placeholder="Repeat your password" [class]="FIELD + ' pr-11'" [disabled]="loading()" />
                  <button type="button" (click)="showConfPass.set(!showConfPass())"
                          class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    <i [class]="showConfPass() ? 'pi pi-eye-slash text-sm' : 'pi pi-eye text-sm'"></i>
                  </button>
                </div>
              </div>

              <!-- Terms checkbox -->
              <div class="pt-1">
                <label class="flex items-start gap-3 cursor-pointer">
                  <div class="relative flex-shrink-0 mt-0.5" (click)="acceptedTerms = !acceptedTerms">
                    <div [class]="acceptedTerms
                      ? 'w-5 h-5 rounded border-2 bg-primary-600 border-primary-600 transition-all flex items-center justify-center'
                      : 'w-5 h-5 rounded border-2 border-slate-300 transition-all flex items-center justify-center bg-white'">
                      @if (acceptedTerms) {
                        <i class="pi pi-check text-white text-[10px]"></i>
                      }
                    </div>
                  </div>
                  <span class="text-sm text-slate-600 leading-snug select-none" (click)="acceptedTerms = !acceptedTerms">
                    I accept the
                    <a href="#" class="font-semibold text-primary-600 hover:underline" (click)="$event.stopPropagation()">Terms of Service</a>
                    and
                    <a href="#" class="font-semibold text-primary-600 hover:underline" (click)="$event.stopPropagation()">Privacy Policy</a>
                  </span>
                </label>
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
                  <p class="text-sm text-emerald-700 font-medium">Account created! Redirecting to login...</p>
                </div>
              }

              <!-- Submit -->
              <button type="submit" [disabled]="loading() || !acceptedTerms"
                      class="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white font-bold text-sm transition-all shadow-lg shadow-primary-600/25 disabled:opacity-50 disabled:cursor-not-allowed mt-1">
                @if (loading()) {
                  <svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creating account...
                } @else {
                  Register
                }
              </button>

            </form>
          </div>
        </div>

        <!-- Bottom copyright -->
        <div class="px-8 py-6 text-xs text-slate-400">
          &copy; {{ year }} TenaDigital. All rights reserved.
        </div>
      </div>

      <!-- ── Right: Visual panel ──────────────────────────────── -->
      <div class="hidden lg:flex lg:w-[52%] xl:w-[54%] bg-slate-50 flex-col p-14 flex-shrink-0 border-l border-slate-100">

        <!-- Headline block -->
        <div class="mb-10">
          <p class="text-xs font-black tracking-[0.2em] uppercase text-primary-500 mb-4">Healthcare platform</p>
          <h2 class="text-5xl xl:text-[3.25rem] font-extrabold leading-[1.06] tracking-tight text-slate-900 mb-5">
            Find a Doctor.<br/>
            <span class="text-primary-600">Book in minutes.</span>
          </h2>
          <p class="text-slate-500 text-base leading-relaxed max-w-sm">
            Search verified specialists across Ethiopia, pick a time that works, and confirm your appointment all in one place.
          </p>
        </div>

        <!-- Stats row -->
        <div class="grid grid-cols-3 gap-4 mb-8">
          @for (stat of stats; track stat.label) {
            <div class="bg-white rounded-2xl border border-slate-100 px-5 py-4 shadow-sm">
              <div class="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center mb-3">
                <i [class]="'pi text-primary-600 text-sm ' + stat.icon"></i>
              </div>
              <p class="text-2xl font-black text-slate-900 leading-none mb-1">{{ stat.value }}</p>
              <p class="text-xs font-semibold text-slate-400">{{ stat.label }}</p>
            </div>
          }
        </div>

        <!-- App preview card -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-1">

          <!-- Card header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-primary-500"></div>
              <p class="text-sm font-bold text-slate-800">Available Doctors</p>
            </div>
            <span class="text-xs font-semibold text-primary-600 bg-primary-50 border border-primary-100 px-2.5 py-1 rounded-full">
              Live
            </span>
          </div>

          <!-- Doctor rows -->
          <div class="divide-y divide-slate-50">
            @for (doc of previewDoctors; track doc.name) {
              <div class="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                <!-- Avatar -->
                <div class="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <span class="text-xs font-extrabold text-primary-600">{{ doc.initials }}</span>
                </div>
                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-slate-800 truncate">{{ doc.name }}</p>
                  <p class="text-xs text-slate-400 font-medium truncate">{{ doc.spec }} · {{ doc.city }}</p>
                </div>
                <!-- Availability badge -->
                <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex-shrink-0">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Available
                </span>
              </div>
            }
          </div>

          <!-- Card footer -->
          <div class="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <p class="text-xs text-slate-400">Showing 3 of 500+ doctors</p>
            <span class="text-xs font-semibold text-primary-600">View all</span>
          </div>
        </div>

      </div>

    </div>
  `,
})
export class RegisterComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  readonly FIELD = FIELD;
  readonly year  = new Date().getFullYear();

  form            = { firstName: '', lastName: '', username: '', email: '', phoneNumber: '', password: '' };
  confirmPassword = '';
  acceptedTerms   = false;
  loading         = signal(false);
  error           = signal('');
  success         = signal(false);
  showPass        = signal(false);
  showConfPass    = signal(false);

  stats = [
    { icon: 'pi-users',    value: '500+', label: 'Doctors'    },
    { icon: 'pi-building', value: '120+', label: 'Hospitals'  },
    { icon: 'pi-heart',    value: '40+',  label: 'Specialties'},
  ];

  previewDoctors = [
    { initials: 'AK', name: 'Dr. Amara Kifle',    spec: 'Cardiologist',  city: 'Addis Ababa' },
    { initials: 'YT', name: 'Dr. Yonas Tesfaye',  spec: 'Pediatrician',  city: 'Bahir Dar'   },
    { initials: 'TB', name: 'Dr. Tigist Bekele',   spec: 'Dermatologist', city: 'Hawassa'     },
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
    if (!this.acceptedTerms) {
      this.error.set('Please accept the Terms of Service to continue.'); return;
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
