import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

interface Step { num: string; title: string; desc: string; icon: string; }

const STEPS: Step[] = [
  { num: '01', title: 'Find a Doctor',   desc: 'Browse verified specialists by specialty, hospital, or availability.',  icon: 'pi-search'       },
  { num: '02', title: 'Pick a Slot',     desc: 'Choose a time that works for you from real-time available slots.',      icon: 'pi-calendar'     },
  { num: '03', title: 'Confirm Booking', desc: 'Create a free account and confirm your appointment in seconds.',        icon: 'pi-check-circle' },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="flex flex-col min-h-screen bg-white w-full overflow-hidden">

      <!-- ── HERO ────────────────────────────────────────────────────────── -->
      <section class="w-full relative flex justify-center bg-white">
        <div class="flex flex-col lg:flex-row items-center max-w-7xl w-full px-6 pt-16 pb-0 lg:pt-24 lg:pb-0 gap-8 lg:gap-0">

          <!-- Left: copy + search -->
          <div class="flex-1 w-full z-10 pb-12 lg:pb-20">
            <p class="text-xs font-black tracking-[0.25em] uppercase text-primary-500 mb-4">Healthcare, simplified</p>
            <h1 class="text-5xl lg:text-[4.5rem] font-extrabold text-slate-900 tracking-tight leading-[1.05]">
              The care <span class="text-primary-600">you need,</span><br/>when you need it.
            </h1>
            <p class="text-lg text-slate-400 font-medium mt-4 mb-10">
              Find verified doctors, pick a time that works, and book in seconds.
            </p>

            <!-- Search card -->
            <div class="bg-white rounded-3xl shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)] border border-slate-100 p-4 max-w-2xl w-full">
              <div class="flex flex-col sm:flex-row gap-3">

                <!-- Specialization -->
                <div class="flex-1 flex flex-col gap-1">
                  <label class="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-1">Specialization</label>
                  <div class="relative">
                    <i class="pi pi-stethoscope absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 text-sm pointer-events-none"></i>
                    <select [(ngModel)]="searchSpec"
                            class="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all">
                      <option value="">All specializations</option>
                      @for (s of specializations(); track s) {
                        <option [value]="s">{{ s }}</option>
                      }
                    </select>
                    <i class="pi pi-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                  </div>
                </div>

                <!-- Region -->
                <div class="flex-1 flex flex-col gap-1">
                  <label class="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-1">Region</label>
                  <div class="relative">
                    <i class="pi pi-map-marker absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 text-sm pointer-events-none"></i>
                    <select [(ngModel)]="searchRegion"
                            class="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all">
                      <option value="">All regions</option>
                      @for (r of regions(); track r) {
                        <option [value]="r">{{ r }}</option>
                      }
                    </select>
                    <i class="pi pi-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                  </div>
                </div>

                <!-- Search button -->
                <div class="flex flex-col justify-end">
                  <button (click)="onSearch()"
                          class="h-[46px] px-6 rounded-xl bg-primary-600 hover:bg-primary-700 active:scale-95 text-white font-bold text-sm shadow-lg shadow-primary-600/30 transition-all flex items-center gap-2 whitespace-nowrap mt-[22px]">
                    <i class="pi pi-search"></i> Find Doctors
                  </button>
                </div>
              </div>

              <!-- Quick pills -->
              @if (specializations().length) {
                <div class="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-100">
                  @for (pill of specializations().slice(0, 5); track pill) {
                    <button (click)="searchSpec = pill; onSearch()"
                            class="px-3 py-1 rounded-full bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-semibold transition-colors border border-primary-100">
                      {{ pill }}
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Trust badges -->
            <div class="flex flex-wrap gap-6 mt-8">
              <div class="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <span class="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
                  <i class="pi pi-verified text-primary-600 text-sm"></i>
                </span>
                Verified practitioners
              </div>
              <div class="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <span class="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
                  <i class="pi pi-clock text-primary-600 text-sm"></i>
                </span>
                Real-time slots
              </div>
              <div class="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <span class="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
                  <i class="pi pi-lock text-primary-600 text-sm"></i>
                </span>
                Secure & private
              </div>
            </div>
          </div>

          <!-- Right: hero image -->
          <div class="flex-1 relative w-full hidden lg:flex items-end justify-center min-h-[560px]">
            <!-- Background blob -->
            <div class="absolute bottom-0 right-0 w-[480px] h-[480px] rounded-full bg-primary-50 -z-0"></div>
            <div class="absolute top-12 right-24 w-20 h-20 rounded-full bg-primary-100/60 -z-0"></div>
            <div class="absolute top-4 right-8 w-10 h-10 rounded-full bg-primary-200/40 -z-0"></div>

            <img src="assets/images/hero.png" alt="Doctor"
                 class="relative z-10 h-[520px] object-contain object-bottom drop-shadow-2xl" />

            <!-- Stat chips -->
            <div class="absolute top-20 left-4 z-20 bg-white px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-2.5 border border-slate-100">
              <span class="text-primary-600 font-black text-xl">15+</span>
              <span class="text-slate-600 font-semibold text-sm">Specialties</span>
            </div>
            <div class="absolute top-[45%] left-0 z-20 bg-white px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-2.5 border border-slate-100">
              <span class="text-primary-600 font-black text-xl">50+</span>
              <span class="text-slate-600 font-semibold text-sm">Hospitals</span>
            </div>
            <div class="absolute top-32 right-2 z-20 bg-primary-600 px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-2.5">
              <span class="text-white font-black text-xl">500+</span>
              <span class="text-primary-100 font-semibold text-sm">Doctors</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ── SPECIALTIES ────────────────────────────────────────────────── -->
      <section class="w-full bg-slate-50 py-24 flex justify-center px-6 border-t border-slate-100">
        <div class="max-w-7xl w-full">
          <div class="text-center mb-12">
            <p class="text-xs font-black tracking-[0.25em] uppercase text-primary-500 mb-3">Browse by specialty</p>
            <h2 class="text-3xl font-extrabold text-slate-900">Find the right specialist</h2>
          </div>

          @if (specializations().length) {
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
              @for (spec of specializations(); track spec) {
                <a [routerLink]="['/doctors']" [queryParams]="{ spec: spec }"
                   class="group flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-primary-200 transition-all cursor-pointer">
                  <div class="w-12 h-12 rounded-xl bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                    <i class="pi pi-heart text-xl text-primary-600"></i>
                  </div>
                  <span class="text-sm font-bold text-slate-700 text-center leading-tight">{{ spec }}</span>
                </a>
              }
            </div>
          } @else {
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              @for (i of [1,2,3,4,5,6,7,8]; track i) {
                <div class="h-28 bg-slate-100 rounded-2xl animate-pulse"></div>
              }
            </div>
          }
        </div>
      </section>

      <!-- ── HOW IT WORKS ───────────────────────────────────────────────── -->
      <section class="w-full bg-white py-24 flex justify-center px-6">
        <div class="max-w-7xl w-full">
          <div class="text-center mb-16">
            <p class="text-xs font-black tracking-[0.25em] uppercase text-primary-500 mb-3">Simple process</p>
            <h2 class="text-3xl font-extrabold text-slate-900">How it works</h2>
            <p class="text-slate-400 mt-2 font-medium">Get care in three easy steps</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            @for (step of steps; track step.num) {
              <div class="flex flex-col items-center text-center p-8 rounded-3xl border border-slate-100 hover:border-primary-100 hover:shadow-lg transition-all">
                <div class="relative mb-6">
                  <div class="w-20 h-20 rounded-2xl bg-primary-50 flex items-center justify-center">
                    <i [class]="'pi text-3xl text-primary-600 ' + step.icon"></i>
                  </div>
                  <span class="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary-600 text-white text-xs font-black flex items-center justify-center border-2 border-white shadow-md">
                    {{ step.num }}
                  </span>
                </div>
                <h3 class="font-bold text-lg text-slate-900 mb-2">{{ step.title }}</h3>
                <p class="text-slate-500 text-sm leading-relaxed">{{ step.desc }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- ── CTA ───────────────────────────────────────────────────────── -->
      @if (!auth.isAuthenticated()) {
        <section class="w-full bg-slate-50 py-24 flex justify-center px-6 border-t border-slate-100">
          <div class="max-w-4xl w-full rounded-3xl bg-primary-600 shadow-2xl shadow-primary-600/20 text-white px-10 py-16 text-center relative overflow-hidden">
            <div class="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 pointer-events-none"></div>
            <div class="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none"></div>
            <p class="text-xs font-black tracking-[0.25em] uppercase text-primary-200 mb-3 relative z-10">Get started today</p>
            <h2 class="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight relative z-10">
              Ready to take control of your health?
            </h2>
            <p class="text-primary-200 text-base mb-8 font-medium relative z-10">
              Create a free account and book your first appointment in minutes.
            </p>
            <div class="flex flex-wrap justify-center gap-4 relative z-10">
              <a routerLink="/register"
                 class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-primary-700 font-bold text-sm hover:bg-primary-50 transition-colors shadow-lg">
                <i class="pi pi-user-plus"></i> Create Free Account
              </a>
              <a routerLink="/doctors"
                 class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/15 border border-white/30 text-white font-bold text-sm hover:bg-white/25 transition-colors">
                Browse Doctors
              </a>
            </div>
          </div>
        </section>
      }

    </div>
  `,
})
export class HomeComponent implements OnInit {
  auth   = inject(AuthService);
  router = inject(Router);
  http   = inject(HttpClient);

  steps = STEPS;

  searchSpec:   string = '';
  searchRegion: string = '';

  specializations = signal<string[]>([]);
  regions         = signal<string[]>([]);

  ngOnInit() {
    this.http.get<string[]>(`${environment.apiUrl}/api/public/specializations`)
      .subscribe({ next: v => this.specializations.set(v), error: () => {} });

    this.http.get<string[]>(`${environment.apiUrl}/api/public/regions`)
      .subscribe({ next: v => this.regions.set(v), error: () => {} });
  }

  onSearch() {
    const queryParams: Record<string, string> = {};
    if (this.searchSpec)   queryParams['spec']   = this.searchSpec;
    if (this.searchRegion) queryParams['region'] = this.searchRegion;
    this.router.navigate(['/doctors'], { queryParams });
  }
}
