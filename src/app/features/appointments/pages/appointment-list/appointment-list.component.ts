import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AppointmentService } from '../../services/appointment.service';
import { AppointmentDTO, AppointmentStatus } from '../../../../shared/models';

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; cls: string }> = {
  SCHEDULED:   { label: 'Scheduled',    cls: 'bg-blue-50 text-blue-700 ring-blue-200'     },
  ATTENDED:    { label: 'Attended',     cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  COMPLETED:   { label: 'Completed',    cls: 'bg-green-50 text-green-700 ring-green-200'   },
  CANCELLED:   { label: 'Cancelled',    cls: 'bg-slate-100 text-slate-500 ring-slate-200'  },
  LATE_CANCEL: { label: 'Late Cancel',  cls: 'bg-amber-50 text-amber-700 ring-amber-200'   },
  NO_SHOW:     { label: 'No Show',      cls: 'bg-rose-50 text-rose-700 ring-rose-200'      },
};

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, ConfirmDialogModule, ToastModule, ProgressSpinnerModule],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast />
    <p-confirmDialog />
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-slate-800">My Appointments</h2>
          <p class="text-sm text-slate-500">{{ all().length }} total</p>
        </div>
        <a routerLink="/slots"
           class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
          <i class="pi pi-plus text-xs"></i> Book New
        </a>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-20">
          <p-progressSpinner strokeWidth="3" [style]="{width:'48px',height:'48px'}" />
        </div>
      } @else if (all().length === 0) {
        <div class="flex flex-col items-center py-20 gap-3">
          <div class="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
            <i class="pi pi-calendar text-3xl text-indigo-400"></i>
          </div>
          <p class="text-sm font-medium text-slate-700">No appointments yet</p>
          <p class="text-xs text-slate-400 mb-2">Book your first appointment with a specialist</p>
          <a routerLink="/slots"
             class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
            Browse Available Slots
          </a>
        </div>
      } @else {

        @if (upcoming().length > 0) {
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Upcoming</p>
            <div class="space-y-3">
              @for (appt of upcoming(); track appt.id) {
                <ng-container *ngTemplateOutlet="card; context: { appt: appt, canCancel: true }" />
              }
            </div>
          </div>
        }

        @if (past().length > 0) {
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Past</p>
            <div class="space-y-3">
              @for (appt of past(); track appt.id) {
                <ng-container *ngTemplateOutlet="card; context: { appt: appt, canCancel: false }" />
              }
            </div>
          </div>
        }

      }
    </div>

    <ng-template #card let-appt="appt" let-canCancel="canCancel">
      <div class="bg-white rounded-xl border border-slate-200 p-4 flex gap-4 hover:shadow-sm transition-shadow">
        <!-- Date box -->
        <div class="w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
             [class]="appt.status === 'SCHEDULED' ? 'bg-indigo-50' : 'bg-slate-50'">
          <span class="text-base font-bold leading-none"
                [class]="appt.status === 'SCHEDULED' ? 'text-indigo-700' : 'text-slate-500'">
            {{ appt.startTime ? (appt.startTime | date:'d') : (appt.createdAt | date:'d') }}
          </span>
          <span class="text-xs uppercase leading-none mt-0.5"
                [class]="appt.status === 'SCHEDULED' ? 'text-indigo-400' : 'text-slate-400'">
            {{ appt.startTime ? (appt.startTime | date:'MMM') : (appt.createdAt | date:'MMM') }}
          </span>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="text-sm font-semibold text-slate-800 truncate">
                {{ appt.doctorName || 'Doctor #' + appt.slotId }}
              </p>
              <p class="text-xs text-slate-500 mt-0.5">
                @if (appt.specialization) {
                  {{ appt.specialization }}
                }
                @if (appt.startTime) {
                  · {{ appt.startTime | date:'HH:mm' }}
                }
              </p>
              @if (appt.hospitalName) {
                <p class="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <i class="pi pi-building text-xs"></i>{{ appt.hospitalName }}
                </p>
              }
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <span [class]="'inline-flex px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ' + statusCls(appt.status)">
                {{ statusLabel(appt.status) }}
              </span>
              @if (canCancel) {
                <button (click)="cancel(appt)"
                        class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors">
                  <i class="pi pi-times text-xs"></i>
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </ng-template>
  `,
})
export class AppointmentListComponent implements OnInit {
  private svc  = inject(AppointmentService);
  private msg  = inject(MessageService);
  private conf = inject(ConfirmationService);

  all      = signal<AppointmentDTO[]>([]);
  loading  = signal(false);
  upcoming = computed(() => this.all().filter(a => a.status === 'SCHEDULED'));
  past     = computed(() => this.all().filter(a => a.status !== 'SCHEDULED'));

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next:     d => this.all.set(d),
      error:    () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  cancel(a: AppointmentDTO) {
    this.conf.confirm({
      message: 'Cancel this appointment?',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () =>
        this.svc.cancel(a.id!).subscribe({
          next: () => {
            this.msg.add({ severity: 'info', summary: 'Appointment cancelled' });
            this.load();
          },
        }),
    });
  }

  statusLabel(s?: AppointmentStatus) { return STATUS_CONFIG[s ?? 'SCHEDULED']?.label ?? s; }
  statusCls(s?: AppointmentStatus)   { return STATUS_CONFIG[s ?? 'SCHEDULED']?.cls   ?? ''; }
}
