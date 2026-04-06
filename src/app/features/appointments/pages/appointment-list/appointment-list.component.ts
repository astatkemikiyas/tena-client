import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppointmentDTO, AppointmentStatus } from '../../../../shared/models';
import { AppointmentService } from '../../services/appointment.service';

type TabId = 'all' | 'upcoming' | 'past';

interface StatusMeta {
  label: string;
  bar:   string;
  badge: string;
  dot:   string;
}

const STATUSES: Record<string, StatusMeta> = {
  PENDING:     { label: 'Pending Approval', bar: 'bg-amber-400',   badge: 'bg-amber-100 text-amber-800',     dot: 'bg-amber-400'   },
  SCHEDULED:   { label: 'Scheduled',        bar: 'bg-blue-500',    badge: 'bg-blue-100 text-blue-800',       dot: 'bg-blue-500'    },
  ATTENDED:    { label: 'Attended',          bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
  COMPLETED:   { label: 'Completed',         bar: 'bg-green-500',   badge: 'bg-green-100 text-green-800',     dot: 'bg-green-500'   },
  CANCELLED:   { label: 'Cancelled',         bar: 'bg-slate-300',   badge: 'bg-slate-100 text-slate-500',     dot: 'bg-slate-400'   },
  LATE_CANCEL: { label: 'Late Cancel',       bar: 'bg-orange-400',  badge: 'bg-orange-100 text-orange-800',   dot: 'bg-orange-400'  },
  NO_SHOW:     { label: 'No Show',           bar: 'bg-rose-500',    badge: 'bg-rose-100 text-rose-800',       dot: 'bg-rose-500'    },
};

const UPCOMING_SET = new Set(['PENDING', 'SCHEDULED']);

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">

      <!-- ── Hero header ───────────────────────────────────────────── -->
      <div class="relative bg-gradient-to-br from-primary-50 via-primary-50/40 to-white rounded-2xl border border-primary-100/70 px-6 py-7 overflow-hidden">
        <div class="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-primary-100/40 pointer-events-none"></div>
        <div class="absolute bottom-0 right-1/3 w-24 h-24 rounded-full bg-primary-50/60 pointer-events-none"></div>
        <div class="relative z-10">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p class="text-xs font-black tracking-[0.18em] uppercase text-primary-500 mb-1.5">Healthcare</p>
              <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">My Appointments</h1>
              <p class="text-sm text-slate-400 mt-1 font-medium">Track and manage your healthcare visits</p>
            </div>
            <a routerLink="/slots"
               class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 active:scale-[0.97] transition-all shadow-md shadow-primary-600/25 self-start flex-shrink-0">
              <i class="pi pi-calendar-plus text-sm"></i>
              Book New Slot
            </a>
          </div>

          <!-- Quick stats -->
          @if (!loading() && all().length > 0) {
            <div class="flex items-center gap-6 sm:gap-10 mt-6 pt-5 border-t border-primary-100/60">
              <div class="flex flex-col">
                <span class="text-2xl font-black text-slate-900">{{ all().length }}</span>
                <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Total</span>
              </div>
              <div class="h-8 w-px bg-primary-100"></div>
              <div class="flex flex-col">
                <span class="text-2xl font-black text-slate-900">{{ upcomingCount() }}</span>
                <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Upcoming</span>
              </div>
              <div class="h-8 w-px bg-primary-100"></div>
              <div class="flex flex-col">
                <span class="text-2xl font-black text-slate-900">{{ completedCount() }}</span>
                <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Completed</span>
              </div>
            </div>
          }
        </div>
      </div>

      <div class="space-y-5">

        <!-- Tab bar -->
        <div class="flex gap-1 bg-slate-100/80 p-1 rounded-xl">
          @for (tab of tabs; track tab.id) {
            <button
              (click)="setTab(tab.id)"
              [class]="activeTab() === tab.id
                ? 'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white shadow-sm text-slate-800 font-semibold text-sm transition-all'
                : 'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-slate-500 font-medium text-sm hover:text-slate-700 transition-all'">
              {{ tab.label }}
              <span [class]="activeTab() === tab.id
                ? 'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold bg-primary-100 text-primary-700'
                : 'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-500'">
                {{ tab.count() }}
              </span>
            </button>
          }
        </div>

        <!-- Status chip filters -->
        @if (!loading() && tabStatuses().length > 1) {
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filter:</span>
            <button
              (click)="activeStatus.set('')"
              [class]="activeStatus() === ''
                ? 'px-3 py-1 rounded-full text-xs font-semibold bg-primary-600 text-white transition-colors'
                : 'px-3 py-1 rounded-full text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:border-primary-300 hover:text-primary-700 transition-colors'">
              All
            </button>
            @for (st of tabStatuses(); track st) {
              <button
                (click)="activeStatus.set(activeStatus() === st ? '' : st)"
                [class]="activeStatus() === st
                  ? 'px-3 py-1 rounded-full text-xs font-semibold ring-2 ring-offset-1 ring-primary-400 transition-colors ' + meta(st).badge
                  : 'px-3 py-1 rounded-full text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:border-primary-300 hover:text-primary-700 transition-colors'">
                <span class="inline-flex items-center gap-1.5">
                  <span [class]="'w-1.5 h-1.5 rounded-full flex-shrink-0 ' + meta(st).dot"></span>
                  {{ meta(st).label }}
                </span>
              </button>
            }
          </div>
        }

        <!-- Loading skeleton -->
        @if (loading()) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (n of [1,2,3,4]; track n) {
              <div class="rounded-2xl border border-slate-100 bg-white overflow-hidden animate-pulse shadow-sm">
                <div class="h-1.5 bg-slate-200"></div>
                <div class="p-5 space-y-4">
                  <div class="flex items-start justify-between">
                    <div class="space-y-1.5">
                      <div class="h-4 bg-slate-200 rounded w-36"></div>
                      <div class="h-3 bg-slate-200 rounded w-24"></div>
                    </div>
                    <div class="h-6 bg-slate-200 rounded-full w-24"></div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0"></div>
                    <div class="flex-1 space-y-1.5">
                      <div class="h-4 bg-slate-200 rounded w-40"></div>
                      <div class="h-3 bg-slate-200 rounded w-28"></div>
                    </div>
                  </div>
                  <div class="h-3 bg-slate-200 rounded w-48"></div>
                  <div class="pt-3 border-t border-slate-100 flex justify-between">
                    <div class="h-3 bg-slate-200 rounded w-24"></div>
                    <div class="h-6 bg-slate-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            }
          </div>

        <!-- Empty state -->
        } @else if (displayed().length === 0) {
          <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div class="h-2 bg-gradient-to-r from-primary-400 to-primary-600"></div>
            <div class="flex flex-col items-center py-20 px-6 gap-5 text-center">
              <div class="w-20 h-20 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center">
                <i class="pi pi-calendar text-3xl text-primary-400"></i>
              </div>
              @if (all().length === 0) {
                <div>
                  <p class="text-lg font-bold text-slate-800">No appointments yet</p>
                  <p class="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
                    Book your first appointment with a verified specialist.
                  </p>
                </div>
                <a routerLink="/slots"
                   class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors shadow-md shadow-primary-600/25">
                  <i class="pi pi-calendar-plus"></i> Browse Available Slots
                </a>
              } @else {
                <div>
                  <p class="text-lg font-bold text-slate-800">No appointments match this filter</p>
                  <p class="text-sm text-slate-400 mt-1 max-w-xs mx-auto">Try a different tab or clear the filter.</p>
                </div>
                <button (click)="setTab('all')"
                        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                  <i class="pi pi-list text-xs"></i> View all appointments
                </button>
              }
            </div>
          </div>

        <!-- Appointment cards -->
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (apt of displayed(); track apt.id) {

              <div class="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-primary-100 transition-all">

                <!-- Top status bar -->
                <div [class]="'h-1.5 ' + meta(apt.status).bar"></div>

                <div class="p-5">

                  <!-- Date + time  /  Status badge -->
                  <div class="flex items-start justify-between mb-4">
                    <div>
                      <p class="text-base font-bold text-slate-800">{{ formatDate(apt.startTime) }}</p>
                      <p class="text-sm text-slate-400 mt-0.5 font-medium">
                        {{ formatTime(apt.startTime) }}&nbsp;–&nbsp;{{ formatTime(apt.endTime) }}
                      </p>
                    </div>
                    <span [class]="'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ' + meta(apt.status).badge">
                      <span [class]="'w-1.5 h-1.5 rounded-full ' + meta(apt.status).dot"></span>
                      {{ meta(apt.status).label }}
                    </span>
                  </div>

                  <!-- Doctor + specialization -->
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 border border-primary-100">
                      <span class="text-sm font-bold text-primary-700">{{ initials(apt.doctorName) }}</span>
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-semibold text-slate-800 truncate">
                        {{ apt.doctorName ?? 'Unknown Doctor' }}
                      </p>
                      @if (apt.specialization) {
                        <p class="text-xs font-medium text-primary-600 mt-0.5">{{ apt.specialization }}</p>
                      }
                    </div>
                  </div>

                  <!-- Hospital -->
                  @if (apt.hospitalName) {
                    <div class="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                      <i class="pi pi-building text-slate-400 w-3.5 flex-shrink-0"></i>
                      <span class="truncate">{{ apt.hospitalName }}</span>
                    </div>
                  }

                  <!-- Proxy booking indicator -->
                  @if (apt.isProxyBooking) {
                    <div class="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                      <i class="pi pi-users text-violet-400 w-3.5 flex-shrink-0"></i>
                      <span>For&nbsp;<span class="font-semibold text-slate-700">{{ apt.patientName }}</span></span>
                    </div>
                  }

                  <!-- Footer: booked date + cancel -->
                  <div class="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div class="flex items-center gap-1 text-xs text-slate-400">
                      <i class="pi pi-clock text-slate-300 w-3 flex-shrink-0"></i>
                      Booked&nbsp;{{ formatBooked(apt.createdAt) }}
                    </div>
                    @if (canCancel(apt)) {
                      <button
                        (click)="cancel(apt)"
                        [disabled]="cancelling() === apt.id"
                        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        @if (cancelling() === apt.id) {
                          <svg class="animate-spin w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                          </svg>
                          Cancelling…
                        } @else {
                          <i class="pi pi-times text-[10px]"></i> Cancel
                        }
                      </button>
                    }
                  </div>

                </div>
              </div>
            }
          </div>
        }

      </div><!-- /space-y-5 -->

    </div><!-- /max-w-4xl -->

    <!-- Cancel confirmation modal -->
    @if (confirmTarget()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
           style="background:rgba(15,23,42,0.55);backdrop-filter:blur(6px)"
           (click)="dismissConfirm()">

        <div class="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
             (click)="$event.stopPropagation()">

          <!-- Top accent -->
          <div class="h-1.5 bg-rose-500"></div>

          <div class="p-6">
            <!-- Icon + title -->
            <div class="flex items-start gap-4 mb-4">
              <div class="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0 border border-rose-100">
                <i class="pi pi-times text-rose-500 text-base"></i>
              </div>
              <div>
                <h2 class="text-base font-bold text-slate-800">Cancel appointment</h2>
                <p class="text-sm text-slate-400 mt-0.5">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <!-- Appointment summary -->
            <div class="bg-slate-50 rounded-xl p-4 space-y-2.5 mb-5 border border-slate-100">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0">
                  <span class="text-xs font-bold text-primary-700">{{ initials(confirmTarget()!.doctorName) }}</span>
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-slate-800 truncate">
                    {{ confirmTarget()!.doctorName ?? 'Unknown Doctor' }}
                  </p>
                  @if (confirmTarget()!.specialization) {
                    <p class="text-xs text-primary-600 font-medium">{{ confirmTarget()!.specialization }}</p>
                  }
                </div>
              </div>
              @if (confirmTarget()!.startTime) {
                <div class="flex items-center gap-2 text-xs text-slate-600">
                  <i class="pi pi-calendar text-slate-400 text-xs w-4"></i>
                  <span>{{ formatDate(confirmTarget()!.startTime) }}</span>
                </div>
                <div class="flex items-center gap-2 text-xs text-slate-600">
                  <i class="pi pi-clock text-slate-400 text-xs w-4"></i>
                  <span>{{ formatTime(confirmTarget()!.startTime) }} – {{ formatTime(confirmTarget()!.endTime) }}</span>
                </div>
              }
              @if (confirmTarget()!.hospitalName) {
                <div class="flex items-center gap-2 text-xs text-slate-600">
                  <i class="pi pi-building text-slate-400 text-xs w-4"></i>
                  <span class="truncate">{{ confirmTarget()!.hospitalName }}</span>
                </div>
              }
            </div>

            <!-- Actions -->
            <div class="flex gap-3">
              <button (click)="dismissConfirm()"
                class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                Keep it
              </button>
              <button (click)="executeCancel()"
                [disabled]="cancelling() !== null"
                class="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
                @if (cancelling() !== null) {
                  <svg class="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Cancelling…
                } @else {
                  Yes, cancel
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class AppointmentListComponent implements OnInit {
  private svc = inject(AppointmentService);

  all           = signal<AppointmentDTO[]>([]);
  loading       = signal(true);
  cancelling    = signal<number | null>(null);
  confirmTarget = signal<AppointmentDTO | null>(null);

  activeTab    = signal<TabId>('all');
  activeStatus = signal<string>('');

  private upcomingList = computed(() => this.all().filter(a => UPCOMING_SET.has(a.status ?? '')));
  private pastList     = computed(() => this.all().filter(a => !UPCOMING_SET.has(a.status ?? '')));

  upcomingCount  = computed(() => this.upcomingList().length);
  completedCount = computed(() => this.all().filter(a => a.status === 'COMPLETED' || a.status === 'ATTENDED').length);

  tabs = [
    { id: 'all'      as TabId, label: 'All',      count: computed(() => this.all().length) },
    { id: 'upcoming' as TabId, label: 'Upcoming',  count: computed(() => this.upcomingList().length) },
    { id: 'past'     as TabId, label: 'Past',      count: computed(() => this.pastList().length) },
  ];

  tabStatuses = computed(() => {
    const base = this.activeTab() === 'upcoming' ? this.upcomingList()
               : this.activeTab() === 'past'     ? this.pastList()
               : this.all();
    return [...new Set(base.map(a => a.status ?? '').filter(Boolean))];
  });

  displayed = computed(() => {
    const base = this.activeTab() === 'upcoming' ? this.upcomingList()
               : this.activeTab() === 'past'     ? this.pastList()
               : this.all();
    const s = this.activeStatus();
    return s ? base.filter(a => a.status === s) : base;
  });

  ngOnInit() {
    this.svc.getAll().subscribe({
      next:  d  => { this.all.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  setTab(id: TabId) {
    this.activeTab.set(id);
    this.activeStatus.set('');
  }

  meta(status: string | undefined): StatusMeta {
    return STATUSES[status ?? ''] ?? STATUSES['CANCELLED'];
  }

  initials(name: string | undefined): string {
    if (!name) return '?';
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  formatDate(iso: string | undefined): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });
  }

  formatTime(iso: string | undefined): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  formatBooked(iso: string | undefined): string {
    if (!iso) return 'unknown date';
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86_400_000);
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7)  return `${days} days ago`;
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  canCancel(apt: AppointmentDTO): boolean {
    return apt.status === 'PENDING' || apt.status === 'SCHEDULED';
  }

  cancel(apt: AppointmentDTO) {
    if (!apt.id || this.cancelling() !== null) return;
    this.confirmTarget.set(apt);
  }

  dismissConfirm() {
    if (this.cancelling() !== null) return;
    this.confirmTarget.set(null);
  }

  executeCancel() {
    const apt = this.confirmTarget();
    if (!apt?.id || this.cancelling() !== null) return;
    this.cancelling.set(apt.id);
    this.svc.cancel(apt.id).subscribe({
      next: () => {
        this.all.update(list =>
          list.map(a => a.id === apt.id ? { ...a, status: 'CANCELLED' as AppointmentStatus } : a),
        );
        this.cancelling.set(null);
        this.confirmTarget.set(null);
      },
      error: () => this.cancelling.set(null),
    });
  }
}
