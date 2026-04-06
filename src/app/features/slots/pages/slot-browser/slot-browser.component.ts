import {
  Component, inject, signal, OnInit, computed,
  ChangeDetectionStrategy, ChangeDetectorRef, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventContentArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin    from '@fullcalendar/daygrid';
import timeGridPlugin   from '@fullcalendar/timegrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import interactionPlugin from '@fullcalendar/interaction';
import { SlotService } from '../../services/slot.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AvailabilitySlotDTO } from '../../../../shared/models';

// ── Specialty palette (primary green theme — matches app) ──
const DEFAULT_P = { bg: '#f0f7e6', text: '#3a5c1a', border: '#b8dB85', dot: '#5e862e' };
const PALETTE: Record<string, { bg: string; text: string; border: string; dot: string }> = {};

const SPECS = [
  'General Medicine', 'Cardiology', 'Dermatology', 'Pediatrics',
  'Orthopedics', 'Ophthalmology', 'Dentistry', 'Psychiatry',
];

type ViewType = 'timeGridWeek' | 'dayGridMonth' | 'multiMonthYear';

@Component({
  selector: 'app-slot-browser',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FullCalendarModule],
  styles: [`
    :host ::ng-deep {
      .fc .fc-toolbar        { gap: 0.5rem; padding: 0; }
      .fc .fc-toolbar-title  { font-size: 1rem; font-weight: 700; color: #0F172A; letter-spacing: -0.01em; }

      .fc .fc-button-group   { border-radius: 0.625rem; box-shadow: 0 0 0 1px #E2E8F0; gap: 0; }
      .fc .fc-button-group .fc-button-primary:first-child { border-radius: 0.5rem 0 0 0.5rem !important; }
      .fc .fc-button-group .fc-button-primary:last-child  { border-radius: 0 0.5rem 0.5rem 0 !important; }
      .fc .fc-button-primary {
        background: #fff !important; border: none !important; color: #64748B !important;
        font-size: 0.8125rem !important; font-weight: 500 !important;
        padding: 0.375rem 0.875rem !important; transition: all .15s !important; box-shadow: none !important;
      }
      .fc .fc-button-primary:hover:not(.fc-button-active) { background: #F8FAFC !important; color: #334155 !important; }
      .fc .fc-button-primary.fc-button-active             { background: #5e862e !important; color: #fff !important; font-weight: 600 !important; }

      .fc .fc-prev-button, .fc .fc-next-button, .fc .fc-today-button {
        background: #fff !important; border: 1px solid #E2E8F0 !important; color: #475569 !important;
        font-size: .8125rem !important; font-weight: 500 !important; padding: .375rem .75rem !important;
        border-radius: .5rem !important; box-shadow: 0 1px 2px rgba(0,0,0,.05) !important; transition: all .15s !important;
      }
      .fc .fc-today-button:disabled { opacity: .45 !important; }
      .fc .fc-prev-button:hover, .fc .fc-next-button:hover, .fc .fc-today-button:not(:disabled):hover {
        background: #F8FAFC !important; border-color: #CBD5E1 !important;
      }

      .fc .fc-col-header-cell         { background: #F8FAFC; border-color: #F1F5F9; padding: .625rem 0; }
      .fc .fc-col-header-cell-cushion { font-size: .75rem; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: .05em; text-decoration: none; }
      .fc .fc-timegrid-slot-label-cushion { font-size: .7rem; color: #94A3B8; font-weight: 500; }

      .fc .fc-daygrid-day-number { font-size: .8125rem; font-weight: 600; color: #475569; text-decoration: none; padding: .5rem; }
      .fc .fc-day-today .fc-daygrid-day-number {
        background: #5e862e; color: #fff; border-radius: 50%;
        width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; margin: 4px;
      }
      .fc .fc-day-today { background: #f5faec !important; }

      .fc .fc-timegrid-now-indicator-line  { border-color: #EF4444; border-width: 2px; }
      .fc .fc-timegrid-now-indicator-arrow { border-top-color: #EF4444; }

      .fc .fc-scrollgrid { border-color: #F1F5F9; }
      .fc td, .fc th     { border-color: #F1F5F9; }

      /* FullCalendar's own popover — keep it BELOW our modal */
      .fc .fc-more-popover { z-index: 50 !important; }
      .fc .fc-popover      { z-index: 50 !important; box-shadow: 0 8px 24px rgba(0,0,0,.12) !important; border: 1px solid #E2E8F0 !important; border-radius: 12px !important; }
      .fc .fc-popover-title { font-size: .8125rem !important; font-weight: 700 !important; color: #0F172A !important; }

      /* Event cards */
      .fc-event {
        border-radius: 6px !important; cursor: pointer !important;
        border-width: 1px !important; border-left-width: 3px !important;
        box-shadow: none !important; transition: box-shadow .15s, transform .1s !important; overflow: hidden;
      }
      .fc-event:hover { box-shadow: 0 4px 14px rgba(0,0,0,.13) !important; transform: translateY(-1px) !important; z-index: 10 !important; }

      .tena-event           { padding: 3px 6px 4px; line-height: 1.35; height: 100%; overflow: hidden; }
      .tena-event__time     { font-size: 10px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: .02em; }
      .tena-event__doctor   { font-size: 11px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }
      .tena-event__spec     { font-size: 10px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: .7; margin-top: 1px; }
      .fc-daygrid-event .tena-event      { padding: 2px 5px; }
      .fc-daygrid-event .tena-event__spec { display: none; }
      .fc-multimonth-title { font-size: .8125rem !important; font-weight: 700 !important; color: #0F172A !important; }
    }
  `],
  template: `
    <div class="space-y-5">

      <!-- ── Header ─────────────────────────────────────────────────────── -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Book an Appointment</h1>
          <p class="text-slate-400 text-sm mt-0.5 font-medium">
            {{ filtered().length }} slot{{ filtered().length !== 1 ? 's' : '' }} available
          </p>
        </div>
        @if (!auth.isAuthenticated()) {
          <div class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-sm flex-shrink-0">
            <i class="pi pi-lock text-amber-500 text-xs"></i>
            <span class="text-amber-800 font-medium">
              <a routerLink="/login" class="font-bold hover:underline">Sign in</a> or
              <a routerLink="/register" class="font-bold hover:underline ml-0.5">register</a>
              to book
            </span>
          </div>
        }
      </div>

      <!-- ── Specialty filter chips ──────────────────────────────────────── -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-3">
        <div class="flex gap-2 overflow-x-auto no-scrollbar">
          @for (spec of specs; track spec) {
            <button (click)="selectSpec(spec)" [class]="chipClass(spec)">
              {{ spec }}
            </button>
          }
        </div>
      </div>

      <!-- ── "Next available" banner (month / year views) ───────────────── -->
      @if (showNavBanner()) {
        <div class="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
          <p class="text-sm text-slate-600">
            @if (nextSlot()) {
              No {{ filterSpec() }} slots in this period. Next available:
              <span class="font-semibold text-slate-800">{{ nextSlot()!.startTime | date:'EEE, MMM d' }}</span>
            } @else {
              No more {{ filterSpec() }} slots available.
            }
          </p>
          @if (nextSlot()) {
            <button (click)="jumpTo(nextSlot()!)"
              class="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors shadow-sm whitespace-nowrap">
              <i class="pi pi-arrow-right text-xs"></i>
              Go to {{ nextPeriodLabel() }}
            </button>
          }
        </div>
      }

      <!-- ── Calendar card ───────────────────────────────────────────────── -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm relative">

        @if (loading()) {
          <div class="flex flex-col items-center justify-center py-32 gap-3">
            <div class="w-10 h-10 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin"></div>
            <p class="text-sm text-slate-400 font-medium">Loading availability…</p>
          </div>
        } @else {
          <div class="p-4 sm:p-6">
            <full-calendar #calendar [options]="calendarOptions()" />
          </div>

          <!-- Empty overlay over calendar when no slots in view -->
          @if (!hasSlotInView() && !showNavBanner()) {
            <div class="absolute inset-0 z-[500] flex flex-col items-center justify-center gap-4 rounded-2xl"
                 style="background:rgba(255,255,255,0.88);backdrop-filter:blur(4px)">
              <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <i class="pi pi-calendar-times text-3xl text-slate-400"></i>
              </div>
              <div class="text-center">
                <p class="text-sm font-semibold text-slate-700">No slots in this period</p>
                <p class="text-xs text-slate-400 mt-1">for {{ filterSpec() }}</p>
              </div>
              @if (nextSlot()) {
                <button (click)="jumpTo(nextSlot()!)"
                  class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm">
                  <i class="pi pi-arrow-right text-sm"></i> Go to {{ nextPeriodLabel() }}
                </button>
              }
            </div>
          }
        }
      </div>

      <!-- ── Slot detail modal (z-[99999] — above FullCalendar's popover) ── -->
      @if (selectedSlot()) {
        <div class="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-4 sm:p-6"
             style="background:rgba(15,23,42,0.55);backdrop-filter:blur(6px)"
             (click)="selectedSlot.set(null)">
          <div class="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
               (click)="$event.stopPropagation()">

            <!-- Coloured header -->
            <div class="px-6 py-5"
                 [style.background]="selPal().bg"
                 [style.border-bottom]="'1px solid ' + selPal().border">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="w-2 h-2 rounded-full" [style.background]="selPal().dot"></span>
                    <span class="text-xs font-semibold tracking-wide" [style.color]="selPal().text">
                      {{ selectedSlot()!.specialization || 'General' }}
                    </span>
                  </div>
                  <p class="text-3xl font-bold tracking-tight leading-none" [style.color]="selPal().text">
                    {{ selectedSlot()!.startTime | date:'HH:mm' }}
                    <span class="text-xl font-normal opacity-40 mx-1">–</span>
                    {{ selectedSlot()!.endTime | date:'HH:mm' }}
                  </p>
                  <p class="text-xs font-medium opacity-60 mt-1.5" [style.color]="selPal().text">
                    {{ selectedSlot()!.startTime | date:'EEEE, MMMM d, y' }}
                  </p>
                </div>
                <button (click)="selectedSlot.set(null)"
                  class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 hover:opacity-70 transition-opacity"
                  [style.background]="selPal().border">
                  <i class="pi pi-times text-xs" [style.color]="selPal().text"></i>
                </button>
              </div>
            </div>

            <!-- Body -->
            <div class="px-6 py-5 space-y-4">
              <!-- Doctor -->
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                     [style.background]="selPal().bg" [style.color]="selPal().text">
                  {{ initials(selectedSlot()!.doctorName) }}
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-800">Dr. {{ selectedSlot()!.doctorName || '—' }}</p>
                  <p class="text-xs font-medium mt-0.5" [style.color]="selPal().dot">
                    {{ selectedSlot()!.specialization || 'General' }}
                  </p>
                </div>
              </div>

              <!-- Hospital -->
              @if (selectedSlot()!.hospitalName) {
                <div class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 text-sm text-slate-600">
                  <i class="pi pi-building text-slate-400 flex-shrink-0"></i>
                  {{ selectedSlot()!.hospitalName }}
                </div>
              }

              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Available
              </span>

              <!-- CTA -->
              <div class="pt-1 space-y-2">
                @if (auth.isAuthenticated()) {
                  <button (click)="book(selectedSlot()!)"
                    class="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
                    [style.background]="selPal().dot">
                    <i class="pi pi-calendar-plus"></i> Confirm Booking
                  </button>
                } @else {
                  <button (click)="book(selectedSlot()!)"
                    class="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm">
                    <i class="pi pi-sign-in"></i> Sign In to Book
                  </button>
                  <p class="text-center text-xs text-slate-400">You'll return here after signing in</p>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class SlotBrowserComponent implements OnInit {
  @ViewChild('calendar') calendarRef!: FullCalendarComponent;

  private svc    = inject(SlotService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private cdr    = inject(ChangeDetectorRef);
  auth           = inject(AuthService);

  slots        = signal<AvailabilitySlotDTO[]>([]);
  loading      = signal(true);
  filterSpec   = signal('General Medicine');
  selectedSlot = signal<AvailabilitySlotDTO | null>(null);
  currentView  = signal<ViewType>('dayGridMonth');
  viewStart    = signal<Date | null>(null);
  viewEnd      = signal<Date | null>(null);
  specs        = SPECS;

  filtered = computed(() => {
    const spec = this.filterSpec();
    return this.slots().filter(s => s.specialization === spec);
  });

  /** Does any filtered slot fall within the currently visible calendar range? */
  hasSlotInView = computed(() => {
    const [vs, ve] = [this.viewStart(), this.viewEnd()];
    if (!vs || !ve) return true;
    return this.filtered().some(s => {
      const d = new Date(s.startTime!);
      return d >= vs && d < ve;
    });
  });

  /** First filtered slot AFTER the current view window */
  nextSlot = computed(() => {
    const ve = this.viewEnd();
    if (!ve) return null;
    return this.filtered().find(s => new Date(s.startTime!) >= ve) ?? null;
  });

  /** Show the top nav banner only in month / year views when view has no slots */
  showNavBanner = computed(() =>
    !this.loading() &&
    !this.hasSlotInView() &&
    this.currentView() !== 'timeGridWeek'
  );

  nextPeriodLabel = computed(() => {
    switch (this.currentView()) {
      case 'dayGridMonth':   return 'next available month';
      case 'multiMonthYear': return 'next available year';
      default:               return 'next available week';
    }
  });

  calendarOptions = computed<CalendarOptions>(() => ({
    plugins:      [dayGridPlugin, timeGridPlugin, multiMonthPlugin, interactionPlugin],
    initialView:  'dayGridMonth',
    headerToolbar: {
      left:   'today prev,next',
      center: 'title',
      right:  'dayGridMonth,timeGridWeek,multiMonthYear',
    },
    buttonText: { today: 'Today', month: 'Month', week: 'Week', year: 'Year' },
    views: {
      timeGridWeek:   { buttonText: 'Week',  slotMinTime: '07:00:00', slotMaxTime: '20:00:00' },
      dayGridMonth:   { buttonText: 'Month', dayMaxEvents: 4 },
      multiMonthYear: { buttonText: 'Year',  multiMonthMaxColumns: 3 },
    },
    events:       this.toEvents(this.filtered()),
    eventContent: (arg: EventContentArg) => this.renderEvent(arg),
    eventClick:   (arg: EventClickArg)   => this.onEventClick(arg),
    datesSet: (arg) => {
      this.currentView.set(arg.view.type as ViewType);
      this.viewStart.set(arg.start);
      this.viewEnd.set(arg.end);
      this.cdr.markForCheck();
    },
    height:          'auto',
    nowIndicator:    true,
    allDaySlot:      false,
    slotDuration:    '00:30:00',
    eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
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

  selectSpec(spec: string) {
    this.filterSpec.set(spec);
    this.selectedSlot.set(null);
  }

  /** Navigate calendar to the next available slot, staying in the same view type */
  jumpTo(slot: AvailabilitySlotDTO) {
    const api = this.calendarRef.getApi();
    api.gotoDate(new Date(slot.startTime!));
  }

  onEventClick(arg: EventClickArg) {
    const slotId = arg.event.extendedProps['slotId'] as number;
    this.selectedSlot.set(this.filtered().find(s => s.id === slotId) ?? null);
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

  pal(spec?: string)  { return PALETTE[spec ?? ''] ?? DEFAULT_P; }
  selPal()            { return this.pal(this.selectedSlot()?.specialization); }

  chipClass(spec: string): string {
    const active = this.filterSpec() === spec;
    return 'flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ' +
      (active
        ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/25'
        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50');
  }

  private toEvents(slots: AvailabilitySlotDTO[]): EventInput[] {
    return slots.map(s => {
      const p = this.pal(s.specialization);
      return {
        id: String(s.id), start: s.startTime, end: s.endTime,
        backgroundColor: p.bg, borderColor: p.dot, textColor: p.text,
        extendedProps: { slotId: s.id, slot: s },
      };
    });
  }

  private renderEvent(arg: EventContentArg): { html: string } {
    const slot   = arg.event.extendedProps['slot'] as AvailabilitySlotDTO;
    const p      = this.pal(slot.specialization);
    const start  = slot.startTime ? this.fmt(slot.startTime) : '';
    const end    = slot.endTime   ? this.fmt(slot.endTime)   : '';
    return {
      html: `<div class="tena-event" style="color:${p.text}">
               <div class="tena-event__time">${start}${end ? ' – ' + end : ''}</div>
               <div class="tena-event__doctor">Dr. ${slot.doctorName ?? '—'}</div>
               ${slot.specialization ? `<div class="tena-event__spec">${slot.specialization}</div>` : ''}
             </div>`,
    };
  }

  private fmt(dt: string): string {
    return new Date(dt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  initials(name?: string): string {
    if (!name) return 'Dr';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }
}
