import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SlotService } from '../../services/slot.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AvailabilitySlotDTO } from '../../../../shared/models';

const SPECS = [
  'General Medicine', 'Cardiology', 'Dermatology', 'Pediatrics',
  'Orthopedics', 'Ophthalmology', 'Dentistry', 'Psychiatry',
];

@Component({
  selector: 'app-slot-browser',
  standalone: true,
  imports: [CommonModule, RouterLink, ProgressSpinnerModule],
  template: `
    <div class="space-y-6">

      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Available Slots</h1>
        <p class="text-slate-500 text-sm mt-1">
          @if (activeDate()) {
            {{ slotsForDate().length }} slot{{ slotsForDate().length !== 1 ? 's' : '' }}
            on {{ formatLabel(activeDate()!) }}
          } @else {
            Browse and book an appointment
          }
        </p>
      </div>

      <!-- Auth notice for guests -->
      @if (!auth.isAuthenticated()) {
        <div class="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
          <i class="pi pi-info-circle text-amber-500 flex-shrink-0 text-sm"></i>
          <p class="text-sm text-amber-800">
            Browse freely.
            <a routerLink="/login" class="font-semibold underline hover:no-underline ml-1">Sign in</a> or
            <a routerLink="/register" class="font-semibold underline hover:no-underline ml-1">register</a>
            to book.
          </p>
        </div>
      }

      <!-- Specialization filter chips -->
      <div class="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
        @for (spec of specs; track spec) {
          <button (click)="selectSpec(spec)"
            [class]="chipClass(spec)">
            {{ spec }}
          </button>
        }
      </div>

      @if (loading()) {
        <div class="flex justify-center py-24">
          <p-progressSpinner strokeWidth="3" [style]="{width:'48px',height:'48px'}" />
        </div>

      } @else if (filtered().length === 0) {
        <!-- Empty spec state -->
        <div class="flex flex-col items-center py-24 gap-3">
          <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
            <i class="pi pi-calendar text-3xl text-slate-400"></i>
          </div>
          <p class="text-sm font-semibold text-slate-600">No slots for this specialization</p>
          <p class="text-xs text-slate-400">Check back soon or try another specialty</p>
        </div>

      } @else {

        <!-- Date strip -->
        <div class="flex gap-2.5 overflow-x-auto no-scrollbar pb-0.5">
          @for (date of availableDates(); track date) {
            <button (click)="selectedDate.set(date)"
              [class]="datePillClass(date)">
              <span class="text-xs font-medium leading-none opacity-75">{{ weekday(date) }}</span>
              <span class="text-xl font-bold leading-tight">{{ day(date) }}</span>
              <span class="text-xs font-medium leading-none opacity-75">{{ month(date) }}</span>
              <span [class]="'text-xs font-bold mt-0.5 ' + (activeDate() === date ? 'text-indigo-200' : 'text-indigo-500')">
                {{ countForDate(date) }}
              </span>
            </button>
          }
        </div>

        <!-- Slot grid -->
        @if (slotsForDate().length === 0) {
          <div class="flex flex-col items-center py-16 gap-3">
            <div class="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
              <i class="pi pi-clock text-2xl text-slate-400"></i>
            </div>
            <p class="text-sm font-semibold text-slate-600">No slots on this date</p>
            <p class="text-xs text-slate-400">Select another date above</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (slot of slotsForDate(); track slot.id) {
              <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all flex flex-col group">

                <!-- Time banner -->
                <div class="bg-gradient-to-br from-indigo-50 to-slate-50 px-5 pt-5 pb-4 border-b border-slate-100">
                  <div class="flex items-start justify-between">
                    <div>
                      <p class="text-xl font-bold text-slate-800 tracking-tight">
                        {{ slot.startTime | date:'HH:mm' }}
                        <span class="text-slate-400 font-normal text-base mx-1">–</span>
                        {{ slot.endTime | date:'HH:mm' }}
                      </p>
                      <p class="text-xs text-slate-500 mt-0.5">
                        {{ slot.startTime | date:'EEEE, MMMM d' }}
                      </p>
                    </div>
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 flex-shrink-0">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Open
                    </span>
                  </div>
                </div>

                <!-- Card body -->
                <div class="px-5 py-4 flex-1 flex flex-col gap-3">

                  <!-- Doctor row -->
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center flex-shrink-0">
                      <span class="text-sm font-bold text-indigo-700">{{ initials(slot.doctorName) }}</span>
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-semibold text-slate-800 truncate">
                        Dr. {{ slot.doctorName || '—' }}
                      </p>
                      @if (slot.specialization) {
                        <p class="text-xs text-indigo-600 font-medium">{{ slot.specialization }}</p>
                      }
                    </div>
                  </div>

                  <!-- Hospital -->
                  @if (slot.hospitalName) {
                    <p class="text-xs text-slate-400 flex items-center gap-1.5">
                      <i class="pi pi-building text-xs"></i>{{ slot.hospitalName }}
                    </p>
                  }

                  <!-- CTA -->
                  <div class="mt-auto pt-3 border-t border-slate-100">
                    @if (auth.isAuthenticated()) {
                      <button (click)="book(slot)"
                        class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">
                        <i class="pi pi-calendar-plus text-sm"></i> Book This Slot
                      </button>
                    } @else {
                      <button (click)="book(slot)"
                        class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:border-indigo-300 hover:text-indigo-600 transition-colors">
                        <i class="pi pi-lock text-sm"></i> Sign In to Book
                      </button>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
})
export class SlotBrowserComponent implements OnInit {
  private svc   = inject(SlotService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  auth           = inject(AuthService);

  slots        = signal<AvailabilitySlotDTO[]>([]);
  loading      = signal(false);
  filterSpec   = signal('General Medicine');
  selectedDate = signal<string | null>(null);
  specs        = SPECS;

  /** Slots matching the selected specialization */
  filtered = computed(() =>
    this.slots().filter(s => s.specialization === this.filterSpec())
  );

  /** Unique sorted date keys for the filtered slots */
  availableDates = computed(() => {
    const seen = new Set<string>();
    return this.filtered()
      .map(s => this.dateKey(s.startTime))
      .filter(d => seen.has(d) ? false : (seen.add(d), true));
  });

  /** The currently active date (falls back to the first available date) */
  activeDate = computed(() => this.selectedDate() ?? this.availableDates()[0] ?? null);

  /** Slots for the active date */
  slotsForDate = computed(() => {
    const date = this.activeDate();
    if (!date) return [];
    return this.filtered().filter(s => this.dateKey(s.startTime) === date);
  });

  ngOnInit() {
    const doctorId = this.route.snapshot.queryParamMap.get('doctorId');
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: d => {
        const base = doctorId ? d.filter(s => s.doctorId === doctorId) : d;
        this.slots.set(base);
        // Reset to first available date whenever data loads
        this.selectedDate.set(null);
      },
      error:    () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  selectSpec(spec: string) {
    this.filterSpec.set(spec);
    this.selectedDate.set(null); // reset to first date for new spec
  }

  book(slot: AvailabilitySlotDTO) {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/appointments/book'], { queryParams: { slotId: slot.id } });
    } else {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/appointments/book?slotId=${slot.id}` },
      });
    }
  }

  // ── Styling helpers ──────────────────────────────────────────────────────

  chipClass(spec: string): string {
    const active = this.filterSpec() === spec;
    return 'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ' +
      (active
        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600');
  }

  datePillClass(date: string): string {
    const active = this.activeDate() === date;
    return 'flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-2xl border transition-all min-w-[64px] ' +
      (active
        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:shadow-sm');
  }

  // ── Date helpers ─────────────────────────────────────────────────────────

  dateKey(dt: string): string {
    return new Date(dt).toDateString();
  }

  weekday(key: string): string {
    return new Date(key).toLocaleDateString('en-US', { weekday: 'short' });
  }

  day(key: string): string {
    return String(new Date(key).getDate());
  }

  month(key: string): string {
    return new Date(key).toLocaleDateString('en-US', { month: 'short' });
  }

  formatLabel(key: string): string {
    return new Date(key).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  countForDate(date: string): string {
    const n = this.filtered().filter(s => this.dateKey(s.startTime) === date).length;
    return n === 1 ? '1 slot' : `${n} slots`;
  }

  initials(name?: string): string {
    if (!name) return 'Dr';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }
}
