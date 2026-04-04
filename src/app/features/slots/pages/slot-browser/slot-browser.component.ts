import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SlotService } from '../../services/slot.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AvailabilitySlotDTO } from '../../../../shared/models';

const SPECS = [
  { label: 'All Specializations', value: '' },
  { label: 'General Medicine',    value: 'General Medicine' },
  { label: 'Cardiology',          value: 'Cardiology'       },
  { label: 'Dermatology',         value: 'Dermatology'      },
  { label: 'Pediatrics',          value: 'Pediatrics'       },
  { label: 'Orthopedics',         value: 'Orthopedics'      },
  { label: 'Ophthalmology',       value: 'Ophthalmology'    },
  { label: 'Dentistry',           value: 'Dentistry'        },
  { label: 'Psychiatry',          value: 'Psychiatry'       },
];

@Component({
  selector: 'app-slot-browser',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, SelectModule, ProgressSpinnerModule],
  template: `
    <div class="space-y-6">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Available Slots</h1>
          <p class="text-slate-500 text-sm mt-1">{{ filtered().length }} slots open for booking</p>
        </div>
        <div class="w-full sm:w-60">
          <p-select [(ngModel)]="filterSpec" [options]="specs" optionLabel="label" optionValue="value"
                    placeholder="All Specializations" styleClass="w-full" />
        </div>
      </div>

      <!-- Auth notice for guests -->
      @if (!auth.isAuthenticated()) {
        <div class="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
          <i class="pi pi-info-circle text-amber-500 flex-shrink-0"></i>
          <p class="text-sm text-amber-800">
            You can browse slots freely.
            <a routerLink="/login" class="font-semibold underline hover:no-underline ml-1">Sign in</a> or
            <a routerLink="/register" class="font-semibold underline hover:no-underline ml-1">create an account</a>
            to book an appointment.
          </p>
        </div>
      }

      <!-- Loading -->
      @if (loading()) {
        <div class="flex justify-center py-24">
          <p-progressSpinner strokeWidth="3" [style]="{width:'48px',height:'48px'}" />
        </div>

      <!-- Empty -->
      } @else if (filtered().length === 0) {
        <div class="flex flex-col items-center py-24 gap-3">
          <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
            <i class="pi pi-calendar text-3xl text-slate-400"></i>
          </div>
          <p class="text-sm font-semibold text-slate-600">No slots available</p>
          <p class="text-xs text-slate-400">Check back soon or try a different specialization</p>
        </div>

      <!-- Grid -->
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (slot of filtered(); track slot.id) {
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all flex flex-col group">

              <!-- Card top -->
              <div class="bg-gradient-to-br from-indigo-50 to-slate-50 px-5 pt-5 pb-4 border-b border-slate-100">
                <div class="flex items-start justify-between">
                  <div>
                    <p class="text-base font-bold text-slate-800">
                      {{ slot.startTime | date:'EEE, MMM d' }}
                    </p>
                    <p class="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <i class="pi pi-clock text-xs"></i>
                      {{ slot.startTime | date:'HH:mm' }} – {{ slot.endTime | date:'HH:mm' }}
                    </p>
                  </div>
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Open
                  </span>
                </div>
              </div>

              <!-- Card body -->
              <div class="px-5 py-4 flex-1 flex flex-col gap-3">
                <!-- Doctor -->
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center flex-shrink-0">
                    <span class="text-sm font-bold text-indigo-700">{{ initials(slot.doctorName) }}</span>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-slate-800 truncate">
                      {{ slot.doctorName || 'Doctor' }}
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

                <!-- Book button -->
                <div class="mt-auto pt-3 border-t border-slate-100">
                  @if (auth.isAuthenticated()) {
                    <button (click)="book(slot)"
                       class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors group-hover:shadow-sm">
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
    </div>
  `,
})
export class SlotBrowserComponent implements OnInit {
  private svc    = inject(SlotService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  auth           = inject(AuthService);

  slots      = signal<AvailabilitySlotDTO[]>([]);
  loading    = signal(false);
  filterSpec = '';
  specs      = SPECS;

  filtered = computed(() =>
    this.filterSpec
      ? this.slots().filter(s => s.specialization === this.filterSpec)
      : this.slots()
  );

  ngOnInit() {
    const doctorId = this.route.snapshot.queryParamMap.get('doctorId');
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: d => this.slots.set(doctorId ? d.filter(s => s.doctorId === doctorId) : d),
      error:    () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
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

  initials(name?: string): string {
    if (!name) return 'Dr';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }
}
