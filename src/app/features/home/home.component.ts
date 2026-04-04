import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AppointmentService } from '../appointments/services/appointment.service';
import { AppointmentDTO } from '../../shared/models';

interface ServiceCategory {
  id:   number;
  name: string;
  spec: string;
  icon: string;
  bg:   string;
  fg:   string;
}

const CATEGORIES: ServiceCategory[] = [
  { id: 1, name: 'General Medicine', spec: 'General Medicine',  icon: 'pi-heart',       bg: 'bg-rose-50',   fg: 'text-rose-500'   },
  { id: 2, name: 'Cardiology',       spec: 'Cardiology',        icon: 'pi-chart-line',   bg: 'bg-red-50',    fg: 'text-red-500'    },
  { id: 3, name: 'Dermatology',      spec: 'Dermatology',       icon: 'pi-sun',          bg: 'bg-amber-50',  fg: 'text-amber-500'  },
  { id: 4, name: 'Pediatrics',       spec: 'Pediatrics',        icon: 'pi-users',        bg: 'bg-blue-50',   fg: 'text-blue-500'   },
  { id: 5, name: 'Orthopedics',      spec: 'Orthopedics',       icon: 'pi-wrench',       bg: 'bg-green-50',  fg: 'text-green-500'  },
  { id: 6, name: 'Ophthalmology',    spec: 'Ophthalmology',     icon: 'pi-eye',          bg: 'bg-purple-50', fg: 'text-purple-500' },
  { id: 7, name: 'Dentistry',        spec: 'Dentistry',         icon: 'pi-shield',       bg: 'bg-teal-50',   fg: 'text-teal-500'   },
  { id: 8, name: 'Psychiatry',       spec: 'Psychiatry',        icon: 'pi-comments',     bg: 'bg-indigo-50', fg: 'text-indigo-500' },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, ProgressSpinnerModule],
  template: `
    <div class="space-y-8">

      <!-- Hero -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-500 p-8 text-white">
        <div class="relative z-10">
          <p class="text-indigo-200 text-sm font-medium mb-1">Welcome back</p>
          <h2 class="text-2xl font-bold mb-2">How can we help you today?</h2>
          <p class="text-indigo-200 text-sm mb-6 max-w-sm">
            Book an appointment with top specialists across Ethiopia's leading hospitals.
          </p>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/doctors"
               class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-indigo-700 text-sm font-semibold hover:bg-indigo-50 transition-colors">
              <i class="pi pi-search text-sm"></i> Find a Doctor
            </a>
            <a routerLink="/slots"
               class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-700/40 text-white text-sm font-medium border border-white/20 hover:bg-indigo-700/60 transition-colors">
              <i class="pi pi-calendar text-sm"></i> Browse Slots
            </a>
          </div>
        </div>
        <!-- decorative circles -->
        <div class="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5"></div>
        <div class="absolute -right-4 -bottom-12 w-56 h-56 rounded-full bg-white/5"></div>
      </div>

      <!-- Service Categories -->
      <div>
        <h3 class="text-base font-semibold text-slate-800 mb-4">Our Services</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          @for (cat of categories; track cat.id) {
            <a [routerLink]="['/doctors']" [queryParams]="{ spec: cat.spec }"
               class="flex flex-col items-center gap-2.5 p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group">
              <div [class]="'w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 ' + cat.bg">
                <i [class]="'pi text-xl ' + cat.icon + ' ' + cat.fg"></i>
              </div>
              <span class="text-xs font-medium text-slate-700 text-center leading-tight">{{ cat.name }}</span>
            </a>
          }
        </div>
      </div>

      <!-- Upcoming Appointments -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-semibold text-slate-800">Upcoming Appointments</h3>
          <a routerLink="/appointments" class="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            View all <i class="pi pi-arrow-right text-xs"></i>
          </a>
        </div>

        @if (loading()) {
          <div class="flex justify-center py-10">
            <p-progressSpinner strokeWidth="3" [style]="{width:'40px',height:'40px'}" />
          </div>
        } @else if (upcoming().length === 0) {
          <div class="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <div class="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-3">
              <i class="pi pi-calendar text-2xl text-indigo-400"></i>
            </div>
            <p class="text-sm font-medium text-slate-700 mb-1">No upcoming appointments</p>
            <p class="text-xs text-slate-400 mb-4">Book your first appointment with a specialist</p>
            <a routerLink="/slots"
               class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
              <i class="pi pi-plus text-xs"></i> Book Appointment
            </a>
          </div>
        } @else {
          <div class="space-y-3">
            @for (appt of upcoming(); track appt.id) {
              <div class="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-indigo-50 flex flex-col items-center justify-center flex-shrink-0">
                  <span class="text-xs font-bold text-indigo-700 leading-none">
                    {{ appt.startTime ? (appt.startTime | date:'d') : '—' }}
                  </span>
                  <span class="text-xs text-indigo-400 uppercase leading-none mt-0.5">
                    {{ appt.startTime ? (appt.startTime | date:'MMM') : '' }}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-slate-800 truncate">
                    {{ appt.doctorName || 'Doctor' }}
                  </p>
                  <p class="text-xs text-slate-500">
                    {{ appt.specialization || 'Appointment' }}
                    @if (appt.startTime) {
                      · {{ appt.startTime | date:'HH:mm' }}
                    }
                  </p>
                </div>
                <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  Upcoming
                </span>
              </div>
            }
          </div>
        }
      </div>

    </div>
  `,
})
export class HomeComponent implements OnInit {
  private apptSvc = inject(AppointmentService);

  loading    = signal(false);
  all        = signal<AppointmentDTO[]>([]);
  upcoming   = computed(() => this.all().filter(a => a.status === 'SCHEDULED').slice(0, 3));
  categories = CATEGORIES;

  ngOnInit() {
    this.loading.set(true);
    this.apptSvc.getAll().subscribe({
      next:     d => this.all.set(d),
      error:    () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }
}
