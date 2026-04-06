import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

interface Step  { num: string; title: string; desc: string; icon: string; }
interface Stats { doctors: number; hospitals: number; specializations: number; }

const STEPS: Step[] = [
  { num: '01', title: 'Find a Doctor',   desc: 'Browse verified specialists by specialty or location.',       icon: 'pi-search'       },
  { num: '02', title: 'Pick a Slot',     desc: 'Choose a time that fits your schedule in real-time.',        icon: 'pi-calendar'     },
  { num: '03', title: 'Confirm Booking', desc: 'Create a free account and lock in your appointment.',        icon: 'pi-check-circle' },
];

const SPEC_ICONS: string[] = ['pi-heart', 'pi-users', 'pi-star', 'pi-bolt', 'pi-eye', 'pi-shield', 'pi-comments', 'pi-sun'];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="flex flex-col min-h-screen w-full overflow-x-hidden bg-white">

      <!-- ── HERO ─────────────────────────────────────────────────────── -->
      <section class="w-full bg-gradient-to-b from-primary-50/60 to-white">
        <div class="max-w-4xl mx-auto px-6 pt-20 pb-16 lg:pt-28 lg:pb-20 flex flex-col items-center text-center">

          <!-- Badge -->
          <span class="inline-flex items-center gap-2 bg-white border border-primary-100 text-primary-600 text-xs font-bold px-3.5 py-1.5 rounded-full tracking-wider uppercase shadow-sm mb-8">
            Healthcare, simplified
          </span>

          <!-- Headline -->
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.06] mb-5">
            Find a doctor.<br/>
            <span class="text-primary-600">Book in minutes.</span>
          </h1>
          <p class="text-lg text-slate-400 font-medium max-w-xl mb-10">
          Search verified specialists across Ethiopia, pick a time that works, and book your appointment all in one place.
          </p>

          <!-- ── Search card ──────────────────────────────────────────── -->
          <div class="w-full bg-white rounded-3xl shadow-[0_8px_40px_-8px_rgba(0,0,0,0.10)] border border-slate-100 p-5">

            <div class="flex flex-col sm:flex-row gap-3">

              <!-- Specialty -->
              <div class="flex-1 relative">
                <label class="absolute -top-[9px] left-4 bg-white px-1 text-[10px] font-bold text-primary-500 uppercase tracking-widest z-10">Specialty</label>
                <div class="relative">
                  <i class="pi pi-heart absolute left-4 top-1/2 -translate-y-1/2 text-primary-400 text-sm pointer-events-none"></i>
                  <select [(ngModel)]="searchSpec"
                          class="w-full appearance-none bg-white border border-slate-200 hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 rounded-xl pl-10 pr-9 py-3.5 text-sm font-semibold text-slate-700 outline-none transition-all cursor-pointer">
                    <option value="">All specialties</option>
                    @for (s of specializations(); track s) {
                      <option [value]="s">{{ s }}</option>
                    }
                  </select>
                  <i class="pi pi-angle-down absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                </div>
              </div>

              <!-- Region -->
              <div class="flex-1 relative">
                <label class="absolute -top-[9px] left-4 bg-white px-1 text-[10px] font-bold text-primary-500 uppercase tracking-widest z-10">Region</label>
                <div class="relative">
                  <i class="pi pi-map-marker absolute left-4 top-1/2 -translate-y-1/2 text-primary-400 text-sm pointer-events-none"></i>
                  <select [(ngModel)]="searchRegion"
                          class="w-full appearance-none bg-white border border-slate-200 hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 rounded-xl pl-10 pr-9 py-3.5 text-sm font-semibold text-slate-700 outline-none transition-all cursor-pointer">
                    <option value="">All regions</option>
                    @for (r of regions(); track r) {
                      <option [value]="r">{{ r }}</option>
                    }
                  </select>
                  <i class="pi pi-angle-down absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                </div>
              </div>

              <!-- Search button -->
              <button (click)="onSearch()"
                      class="sm:self-end h-[50px] px-8 rounded-xl bg-primary-600 hover:bg-primary-700 active:scale-[0.97] text-white font-bold text-sm shadow-lg shadow-primary-600/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                <i class="pi pi-search"></i> Search
              </button>

            </div>

            <!-- Quick pills -->
            @if (specializations().length) {
              <div class="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Popular:</span>
                @for (pill of specializations().slice(0,5); track pill) {
                  <button (click)="searchSpec = pill; onSearch()"
                          class="px-3 py-1 rounded-full bg-slate-50 hover:bg-primary-50 border border-slate-200 hover:border-primary-200 text-slate-600 hover:text-primary-700 text-xs font-semibold transition-colors">
                    {{ pill }}
                  </button>
                }
              </div>
            }
          </div>

          <!-- Stats row -->
          @if (stats()) {
            <div class="flex items-center justify-center gap-8 sm:gap-14 mt-10">
              <div class="flex flex-col items-center">
                <span class="text-3xl font-black text-slate-900">{{ stats()!.doctors }}</span>
                <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Doctors</span>
              </div>
              <div class="h-10 w-px bg-slate-200"></div>
              <div class="flex flex-col items-center">
                <span class="text-3xl font-black text-slate-900">{{ stats()!.hospitals }}</span>
                <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Hospitals</span>
              </div>
              <div class="h-10 w-px bg-slate-200"></div>
              <div class="flex flex-col items-center">
                <span class="text-3xl font-black text-slate-900">{{ stats()!.specializations }}</span>
                <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Specialties</span>
              </div>
            </div>
          }

        </div>
      </section>


      <!-- ── SPECIALTIES ────────────────────────────────────────────── -->
      <section class="w-full bg-white py-20 border-t border-slate-100 flex justify-center px-6">
        <div class="max-w-6xl w-full">

          <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p class="text-xs font-black tracking-[0.2em] uppercase text-primary-500 mb-2">Specialties</p>
              <h2 class="text-2xl font-extrabold text-slate-900">Browse by specialty</h2>
            </div>
            <a [routerLink]="['/doctors']"
               class="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors self-start sm:self-auto">
              See all doctors <i class="pi pi-arrow-right text-xs"></i>
            </a>
          </div>

          @if (specializations().length) {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              @for (spec of specializations(); track spec; let i = $index) {
                <a [routerLink]="['/doctors']" [queryParams]="{ spec }"
                   class="group flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white hover:border-primary-200 hover:bg-primary-50/30 hover:shadow-md transition-all cursor-pointer">
                  <div class="w-10 h-10 rounded-xl bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center flex-shrink-0 transition-colors">
                    <i [class]="'pi text-base text-primary-600 ' + icon(i)"></i>
                  </div>
                  <span class="text-sm font-bold text-slate-700 leading-snug flex-1">{{ spec }}</span>
                  <i class="pi pi-arrow-right text-[10px] text-slate-300 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all"></i>
                </a>
              }
            </div>
          } @else {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              @for (i of [1,2,3,4]; track i) {
                <div class="h-[62px] bg-slate-100 rounded-2xl animate-pulse"></div>
              }
            </div>
          }

        </div>
      </section>


      <!-- ── HOW IT WORKS ───────────────────────────────────────────── -->
      <section class="w-full bg-slate-50 border-t border-slate-100 py-20 flex justify-center px-6">
        <div class="max-w-6xl w-full">

          <div class="text-center mb-14">
            <p class="text-xs font-black tracking-[0.2em] uppercase text-primary-500 mb-2">Process</p>
            <h2 class="text-2xl font-extrabold text-slate-900">How it works</h2>
            <p class="text-slate-400 text-sm mt-2 font-medium">Three steps to better care</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            @for (step of steps; track step.num; let last = $last) {
              <div class="relative bg-white rounded-2xl border border-slate-100 p-7 hover:shadow-lg transition-shadow">
                <!-- Step number watermark -->
                <span class="absolute top-4 right-5 text-6xl font-black text-slate-50 leading-none select-none">{{ step.num }}</span>
                <!-- Icon -->
                <div class="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-5 relative z-10">
                  <i [class]="'pi text-xl text-primary-600 ' + step.icon"></i>
                </div>
                <h3 class="font-bold text-slate-900 mb-2 relative z-10">{{ step.title }}</h3>
                <p class="text-sm text-slate-500 leading-relaxed relative z-10">{{ step.desc }}</p>
                <!-- Connector line (not on last card) -->
                @if (!last) {
                  <div class="hidden md:block absolute top-[52px] -right-[11px] w-5 h-px bg-primary-200 z-20"></div>
                }
              </div>
            }
          </div>

        </div>
      </section>


      <!-- ── CTA ───────────────────────────────────────────────────── -->
      @if (!auth.isAuthenticated()) {
        <section class="w-full bg-white border-t border-slate-100 py-20 flex justify-center px-6">
          <div class="max-w-3xl w-full rounded-3xl bg-primary-600 relative overflow-hidden px-10 py-16 text-center text-white">
            <!-- Subtle decoration -->
            <div class="absolute inset-0 pointer-events-none"
                 style="background:radial-gradient(ellipse at top right,rgba(255,255,255,0.12),transparent 60%)"></div>

            <p class="text-xs font-black tracking-[0.2em] uppercase text-primary-200 mb-3 relative z-10">Get started</p>
            <h2 class="text-3xl font-extrabold tracking-tight mb-3 relative z-10">Take control of your health.</h2>
            <p class="text-primary-200 text-sm font-medium mb-8 max-w-sm mx-auto relative z-10">
              Create a free account and book your first appointment today.
            </p>
            <div class="flex flex-wrap justify-center gap-3 relative z-10">
              <a routerLink="/register"
                 class="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-white text-primary-700 font-bold text-sm hover:bg-primary-50 transition-colors shadow-md">
                <i class="pi pi-user-plus"></i> Create Account
              </a>
              <a routerLink="/doctors"
                 class="inline-flex items-center gap-2 px-7 py-3 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors">
                Browse Doctors <i class="pi pi-arrow-right text-xs"></i>
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

  searchSpec   = '';
  searchRegion = '';

  specializations = signal<string[]>([]);
  regions         = signal<string[]>([]);
  stats           = signal<Stats | null>(null);

  icon(i: number): string {
    return SPEC_ICONS[i % SPEC_ICONS.length];
  }

  ngOnInit() {
    this.http.get<string[]>(`${environment.apiUrl}/api/public/specializations`)
      .subscribe({ next: v => this.specializations.set(v), error: () => {} });

    this.http.get<string[]>(`${environment.apiUrl}/api/public/regions`)
      .subscribe({ next: v => this.regions.set(v), error: () => {} });

    this.http.get<Stats>(`${environment.apiUrl}/api/public/stats`)
      .subscribe({ next: v => this.stats.set(v), error: () => {} });
  }

  onSearch() {
    const queryParams: Record<string, string> = {};
    if (this.searchSpec)   queryParams['spec']   = this.searchSpec;
    if (this.searchRegion) queryParams['region'] = this.searchRegion;
    this.router.navigate(['/doctors'], { queryParams });
  }
}
