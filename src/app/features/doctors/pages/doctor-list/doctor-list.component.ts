import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DoctorService } from '../../services/doctor.service';
import { DoctorProfileDTO } from '../../../../shared/models';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">

      <!-- ── Page header ─────────────────────────────────────── -->
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Find a Doctor</h1>
        <p class="text-sm text-slate-400 mt-0.5 font-medium">
          {{ filtered().length }} doctor{{ filtered().length !== 1 ? 's' : '' }} available
        </p>
      </div>

      <!-- ── Filter bar ──────────────────────────────────────── -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div class="flex flex-col sm:flex-row gap-3">

          <!-- Specialty -->
          <div class="flex-1 relative">
            <label class="absolute -top-[9px] left-4 bg-white px-1 text-[10px] font-bold text-primary-500 uppercase tracking-widest z-10">Specialty</label>
            <div class="relative">
              <i class="pi pi-heart absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400 text-sm pointer-events-none"></i>
              <select [ngModel]="selectedSpec()" (ngModelChange)="selectedSpec.set($event)"
                      class="w-full appearance-none bg-white border border-slate-200 hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 rounded-xl pl-10 pr-9 py-3 text-sm font-semibold text-slate-700 outline-none transition-all cursor-pointer">
                <option value="">All specialties</option>
                @for (s of specs(); track s) {
                  <option [value]="s">{{ s }}</option>
                }
              </select>
              <i class="pi pi-angle-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
            </div>
          </div>

          <!-- Region -->
          <div class="flex-1 relative">
            <label class="absolute -top-[9px] left-4 bg-white px-1 text-[10px] font-bold text-primary-500 uppercase tracking-widest z-10">Region</label>
            <div class="relative">
              <i class="pi pi-map-marker absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400 text-sm pointer-events-none"></i>
              <select [ngModel]="selectedRegion()" (ngModelChange)="selectedRegion.set($event); selectedCity.set('')"
                      class="w-full appearance-none bg-white border border-slate-200 hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 rounded-xl pl-10 pr-9 py-3 text-sm font-semibold text-slate-700 outline-none transition-all cursor-pointer">
                <option value="">All regions</option>
                @for (r of regions(); track r) {
                  <option [value]="r">{{ r }}</option>
                }
              </select>
              <i class="pi pi-angle-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
            </div>
          </div>

          <!-- City -->
          @if (cities().length > 0) {
            <div class="flex-1 relative">
              <label class="absolute -top-[9px] left-4 bg-white px-1 text-[10px] font-bold text-primary-500 uppercase tracking-widest z-10">City</label>
              <div class="relative">
                <i class="pi pi-building absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400 text-sm pointer-events-none"></i>
                <select [ngModel]="selectedCity()" (ngModelChange)="selectedCity.set($event)"
                        class="w-full appearance-none bg-white border border-slate-200 hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 rounded-xl pl-10 pr-9 py-3 text-sm font-semibold text-slate-700 outline-none transition-all cursor-pointer">
                  <option value="">All cities</option>
                  @for (c of cities(); track c) {
                    <option [value]="c">{{ c }}</option>
                  }
                </select>
                <i class="pi pi-angle-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
              </div>
            </div>
          }

          <!-- Clear filters -->
          @if (selectedSpec() || selectedRegion() || selectedCity()) {
            <button (click)="clearFilters()"
                    class="self-end h-[46px] px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-colors flex items-center gap-1.5 whitespace-nowrap">
              <i class="pi pi-times text-xs"></i> Clear
            </button>
          }
        </div>

        <!-- Active filter pills -->
        @if (selectedSpec() || selectedRegion() || selectedCity()) {
          <div class="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
            @if (selectedSpec()) {
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-100">
                <i class="pi pi-heart text-[10px]"></i> {{ selectedSpec() }}
                <button (click)="selectedSpec.set('')" class="ml-0.5 hover:text-primary-900">
                  <i class="pi pi-times text-[10px]"></i>
                </button>
              </span>
            }
            @if (selectedRegion()) {
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-100">
                <i class="pi pi-map-marker text-[10px]"></i> {{ selectedRegion() }}
                <button (click)="selectedRegion.set(''); selectedCity.set('')" class="ml-0.5 hover:text-primary-900">
                  <i class="pi pi-times text-[10px]"></i>
                </button>
              </span>
            }
            @if (selectedCity()) {
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-100">
                <i class="pi pi-building text-[10px]"></i> {{ selectedCity() }}
                <button (click)="selectedCity.set('')" class="ml-0.5 hover:text-primary-900">
                  <i class="pi pi-times text-[10px]"></i>
                </button>
              </span>
            }
          </div>
        }
      </div>

      <!-- ── Loading skeleton ────────────────────────────────── -->
      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (n of [1,2,3,4,5,6]; track n) {
            <div class="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 animate-pulse">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-full bg-slate-100 flex-shrink-0"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-slate-100 rounded w-3/4"></div>
                  <div class="h-3 bg-slate-100 rounded w-1/2"></div>
                </div>
              </div>
              <div class="h-3 bg-slate-100 rounded"></div>
              <div class="h-3 bg-slate-100 rounded w-5/6"></div>
              <div class="pt-3 border-t border-slate-100 flex justify-between items-center">
                <div class="h-5 bg-slate-100 rounded w-24"></div>
                <div class="h-8 bg-slate-100 rounded-lg w-24"></div>
              </div>
            </div>
          }
        </div>

      <!-- ── Empty state ─────────────────────────────────────── -->
      } @else if (filtered().length === 0) {
        <div class="flex flex-col items-center py-20 gap-4 text-center">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <i class="pi pi-user-minus text-3xl text-slate-400"></i>
          </div>
          <div>
            <p class="font-semibold text-slate-700">No doctors found</p>
            <p class="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
          </div>
          <button (click)="clearFilters()"
                  class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            Clear all filters
          </button>
        </div>

      <!-- ── Doctor cards ────────────────────────────────────── -->
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (doc of filtered(); track doc.userId) {
            <div class="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md hover:border-primary-100 transition-all flex flex-col gap-4">

              <!-- Doctor info -->
              <div class="flex items-start gap-4">
                <div class="w-13 h-13 w-[52px] h-[52px] rounded-2xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <span class="text-lg font-extrabold text-primary-600">{{ initials(doc.name) }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-slate-800 text-sm leading-snug truncate">
                    {{ doc.name || 'Dr. ' + doc.medicalLicenseNumber }}
                  </h3>
                  <p class="text-xs font-semibold text-primary-600 mt-0.5">
                    {{ doc.specialization || 'General Medicine' }}
                  </p>
                  @if (doc.hospitalName) {
                    <p class="text-xs text-slate-400 mt-1 flex items-center gap-1 truncate">
                      <i class="pi pi-building text-[10px]"></i>
                      {{ doc.hospitalName }}{{ doc.city ? ' · ' + doc.city : '' }}
                    </p>
                  }
                </div>
              </div>

              <!-- Bio -->
              @if (doc.bio) {
                <p class="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1">{{ doc.bio }}</p>
              }

              <!-- Footer -->
              <div class="flex items-center justify-between pt-3 border-t border-slate-100">
                @if (doc.yearsOfExperience) {
                  <span class="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <i class="pi pi-star-fill text-amber-400 text-[11px]"></i>
                    {{ doc.yearsOfExperience }}+ yrs
                  </span>
                } @else {
                  <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Available
                  </span>
                }
                <button (click)="bookSlot(doc)"
                        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 active:scale-[0.97] text-white text-xs font-bold transition-all shadow-sm shadow-primary-600/20">
                  <i class="pi pi-calendar-plus text-xs"></i> Book
                </button>
              </div>

            </div>
          }
        </div>
      }

    </div>
  `,
})
export class DoctorListComponent implements OnInit {
  private svc    = inject(DoctorService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  doctors = signal<DoctorProfileDTO[]>([]);
  loading = signal(false);

  selectedSpec   = signal('');
  selectedRegion = signal('');
  selectedCity   = signal('');

  specs   = computed(() => [...new Set(this.doctors().map(d => d.specialization).filter(Boolean) as string[])].sort());
  regions = computed(() => [...new Set(this.doctors().map(d => d.region).filter(Boolean)   as string[])].sort());
  cities  = computed(() => {
    const r = this.selectedRegion();
    const base = r ? this.doctors().filter(d => d.region === r) : this.doctors();
    return [...new Set(base.map(d => d.city).filter(Boolean) as string[])].sort();
  });

  filtered = computed(() =>
    this.doctors().filter(d => {
      const specMatch   = !this.selectedSpec()   || (d.specialization ?? 'General Medicine') === this.selectedSpec();
      const regionMatch = !this.selectedRegion() || d.region === this.selectedRegion();
      const cityMatch   = !this.selectedCity()   || d.city   === this.selectedCity();
      return specMatch && regionMatch && cityMatch;
    })
  );

  ngOnInit() {
    const spec = this.route.snapshot.queryParamMap.get('spec');
    if (spec) this.selectedSpec.set(spec);
    this.load();
  }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next:     d => this.doctors.set(d),
      error:    () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  clearFilters() {
    this.selectedSpec.set('');
    this.selectedRegion.set('');
    this.selectedCity.set('');
  }

  bookSlot(doc: DoctorProfileDTO) {
    this.router.navigate(['/slots'], { queryParams: { doctorId: doc.userId } });
  }

  initials(name?: string): string {
    if (!name) return 'Dr';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }
}
