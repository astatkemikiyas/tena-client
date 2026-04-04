import { Component, inject, signal, OnInit, computed, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import interactionPlugin from '@fullcalendar/interaction';
import { SlotService } from '../../services/slot.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AvailabilitySlotDTO } from '../../../../shared/models';

const SPECS = [
  { label: 'All',              value: '' },
  { label: 'General Medicine', value: 'General Medicine' },
  { label: 'Cardiology',       value: 'Cardiology' },
  { label: 'Dermatology',      value: 'Dermatology' },
  { label: 'Pediatrics',       value: 'Pediatrics' },
  { label: 'Orthopedics',      value: 'Orthopedics' },
  { label: 'Ophthalmology',    value: 'Ophthalmology' },
  { label: 'Dentistry',        value: 'Dentistry' },
  { label: 'Psychiatry',       value: 'Psychiatry' },
];

const SPEC_COLORS: Record<string, string> = {
  'General Medicine': '#4f46e5',
  'Cardiology':       '#dc2626',
  'Dermatology':      '#d97706',
  'Pediatrics':       '#2563eb',
  'Orthopedics':      '#16a34a',
  'Ophthalmology':    '#7c3aed',
  'Dentistry':        '#0d9488',
  'Psychiatry':       '#db2777',
};

@Component({
  selector: 'app-slot-browser',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FullCalendarModule],
  styles: [`
    :host ::ng-deep {
      .fc { font-family: inherit; }
      .fc-toolbar-title { font-size: 1rem; font-weight: 700; color: #1e293b; }
      .fc-button-primary {
        background: #4f46e5 !important;
        border-color: #4f46e5 !important;
        font-size: 0.75rem !important;
        padding: 0.375rem 0.75rem !important;
        border-radius: 0.5rem !important;
        font-weight: 500 !important;
      }
      .fc-button-primary:disabled { opacity: 0.5 !important; }
      .fc-button-active { background: #3730a3 !important; border-color: #3730a3 !important; }
      .fc-button-group { gap: 2px; }
      .fc-daygrid-event, .fc-timegrid-event {
        border-radius: 4px !important;
        cursor: pointer !important;
        font-size: 0.7rem !important;
      }
      .fc-event-title { font-weight: 600 !important; }
      .fc-col-header-cell { background: #f8fafc; }
      .fc-multimonth-title { font-weight: 700 !important; font-size: 0.85rem !important; }
    }
  `],
  template: `
    <div class="space-y-5">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Available Slots</h1>
          <p class="text-slate-500 text-sm mt-0.5">
            {{ filtered().length }} slot{{ filtered().length !== 1 ? 's' : '' }} available
          </p>
        </div>

        <!-- Auth notice inline -->
        @if (!auth.isAuthenticated()) {
          <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-sm">
            <i class="pi pi-info-circle text-amber-500 text-xs"></i>
            <span class="text-amber-800">
              <a routerLink="/login" class="font-semibold underline">Sign in</a> or
              <a routerLink="/register" class="font-semibold underline ml-0.5">register</a>
              to book
            </span>
          </div>
        }
      </div>

      <!-- Specialization filter chips -->
      <div class="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
        @for (spec of specs; track spec.value) {
          <button (click)="selectSpec(spec.value)" [class]="chipClass(spec.value)">
            @if (spec.value && specColor(spec.value)) {
              <span class="w-2 h-2 rounded-full flex-shrink-0" [style.background]="specColor(spec.value)"></span>
            }
            {{ spec.label }}
          </button>
        }
      </div>

      <!-- Calendar card -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        @if (loading()) {
          <div class="flex items-center justify-center py-32">
            <div class="flex flex-col items-center gap-3">
              <div class="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <p class="text-sm text-slate-500">Loading slots…</p>
            </div>
          </div>
        } @else {
          <div class="p-4 sm:p-6">
            <full-calendar [options]="calendarOptions()" />
          </div>
        }
      </div>

      <!-- Slot detail panel -->
      @if (selectedSlot()) {
        <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
             (click)="selectedSlot.set(null)">
          <div class="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
               (click)="$event.stopPropagation()">

            <!-- Panel header -->
            <div class="bg-gradient-to-br from-indigo-600 to-indigo-700 px-6 py-5 text-white">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs font-medium text-indigo-200 mb-1">
                    {{ selectedSlot()!.startTime | date:'EEEE, MMMM d, y' }}
                  </p>
                  <p class="text-2xl font-bold tracking-tight">
                    {{ selectedSlot()!.startTime | date:'HH:mm' }}
                    <span class="text-indigo-300 text-lg font-normal mx-1">–</span>
                    {{ selectedSlot()!.endTime | date:'HH:mm' }}
                  </p>
                </div>
                <button (click)="selectedSlot.set(null)"
                  class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <i class="pi pi-times text-sm"></i>
                </button>
              </div>
            </div>

            <!-- Panel body -->
            <div class="px-6 py-5 space-y-4">

              <!-- Doctor -->
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center flex-shrink-0">
                  <span class="text-sm font-bold text-indigo-700">{{ initials(selectedSlot()!.doctorName) }}</span>
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-800">Dr. {{ selectedSlot()!.doctorName || '—' }}</p>
                  @if (selectedSlot()!.specialization) {
                    <p class="text-xs font-medium" [style.color]="specColor(selectedSlot()!.specialization!)">
                      {{ selectedSlot()!.specialization }}
                    </p>
                  }
                </div>
              </div>

              <!-- Hospital -->
              @if (selectedSlot()!.hospitalName) {
                <div class="flex items-center gap-2 text-sm text-slate-500">
                  <i class="pi pi-building text-slate-400"></i>
                  {{ selectedSlot()!.hospitalName }}
                </div>
              }

              <!-- Status badge -->
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Available
                </span>
              </div>

              <!-- CTA -->
              @if (auth.isAuthenticated()) {
                <button (click)="book(selectedSlot()!)"
                  class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
                  <i class="pi pi-calendar-plus"></i> Confirm Booking
                </button>
              } @else {
                <div class="space-y-2">
                  <button (click)="book(selectedSlot()!)"
                    class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
                    <i class="pi pi-sign-in"></i> Sign In to Book
                  </button>
                  <p class="text-center text-xs text-slate-400">You'll be redirected back after sign in</p>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class SlotBrowserComponent implements OnInit {
  private svc    = inject(SlotService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private cdr    = inject(ChangeDetectorRef);
  auth           = inject(AuthService);

  slots        = signal<AvailabilitySlotDTO[]>([]);
  loading      = signal(true);
  filterSpec   = signal('');
  selectedSlot = signal<AvailabilitySlotDTO | null>(null);
  specs        = SPECS;

  filtered = computed(() => {
    const spec = this.filterSpec();
    return spec ? this.slots().filter(s => s.specialization === spec) : this.slots();
  });

  calendarOptions = computed<CalendarOptions>(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, multiMonthPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left:   'prev,next today',
      center: 'title',
      right:  'dayGridMonth,timeGridWeek,multiMonthYear',
    },
    buttonText: {
      today: 'Today',
      month: 'Month',
      week:  'Week',
      year:  'Year',
    },
    views: {
      multiMonthYear: { buttonText: 'Year' },
      timeGridWeek:   { buttonText: 'Week' },
      dayGridMonth:   { buttonText: 'Month' },
    },
    events: this.toEvents(this.filtered()),
    eventClick: (arg: EventClickArg) => this.onEventClick(arg),
    eventDisplay: 'block',
    dayMaxEvents: 3,
    height: 'auto',
    nowIndicator: true,
    eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    slotLabelFormat:  { hour: '2-digit', minute: '2-digit', hour12: false },
  }));

  ngOnInit() {
    const doctorId = this.route.snapshot.queryParamMap.get('doctorId');
    this.svc.getAll().subscribe({
      next: d => {
        this.slots.set(doctorId ? d.filter(s => s.doctorId === doctorId) : d);
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => { this.loading.set(false); this.cdr.markForCheck(); },
    });
  }

  selectSpec(value: string) {
    this.filterSpec.set(value);
    this.selectedSlot.set(null);
  }

  onEventClick(arg: EventClickArg) {
    const slotId = arg.event.extendedProps['slotId'] as number;
    const slot = this.filtered().find(s => s.id === slotId) ?? null;
    this.selectedSlot.set(slot);
  }

  book(slot: AvailabilitySlotDTO) {
    this.selectedSlot.set(null);
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/appointments/book'], { queryParams: { slotId: slot.id } });
    } else {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/appointments/book?slotId=${slot.id}` },
      });
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private toEvents(slots: AvailabilitySlotDTO[]): EventInput[] {
    return slots.map(s => ({
      id:    String(s.id),
      title: `${s.startTime ? new Date(s.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''} Dr. ${s.doctorName ?? '—'}`,
      start: s.startTime,
      end:   s.endTime,
      backgroundColor: this.specColor(s.specialization),
      borderColor:     this.specColor(s.specialization),
      extendedProps: { slotId: s.id },
    }));
  }

  specColor(spec?: string): string {
    return SPEC_COLORS[spec ?? ''] ?? '#4f46e5';
  }

  chipClass(value: string): string {
    const active = this.filterSpec() === value;
    return 'flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all border ' +
      (active
        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600');
  }

  initials(name?: string): string {
    if (!name) return 'Dr';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }
}
