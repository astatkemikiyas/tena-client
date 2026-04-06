import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AppointmentService } from '../appointments/services/appointment.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-50">
      <div class="max-w-3xl mx-auto px-4 py-10 space-y-5">

        <!-- Hero card -->
        <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div class="h-28 bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600"></div>
          <div class="px-6 pb-6">
            <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12">
              <div class="flex items-end gap-4">
                <div class="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-700 flex items-center justify-center shadow-xl border-4 border-white flex-shrink-0">
                  <span class="text-3xl font-bold text-white">{{ profile?.initials }}</span>
                </div>
                <div class="pb-1 min-w-0">
                  <h1 class="text-2xl font-bold text-slate-800">{{ profile?.name || '—' }}</h1>
                  <p class="text-sm text-slate-500 mt-0.5">&#64;{{ profile?.username || '—' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats row -->
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
            <p class="text-2xl font-bold text-indigo-600">{{ totalAppointments() ?? '—' }}</p>
            <p class="text-xs text-slate-500 mt-1">Appointments</p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
            <p class="text-2xl font-bold text-emerald-600">{{ completedAppointments() ?? '—' }}</p>
            <p class="text-xs text-slate-500 mt-1">Completed</p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
            <p class="text-2xl font-bold text-amber-500">{{ upcomingAppointments() ?? '—' }}</p>
            <p class="text-xs text-slate-500 mt-1">Upcoming</p>
          </div>
        </div>

        <!-- Account info -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100">
            <h2 class="text-sm font-semibold text-slate-700">Account information</h2>
          </div>
          <div class="divide-y divide-slate-100">

            <div class="flex items-center gap-4 px-6 py-4">
              <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <i class="pi pi-user text-indigo-500"></i>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs text-slate-400 mb-0.5">Full name</p>
                <p class="text-sm font-medium text-slate-800">{{ profile?.name || '—' }}</p>
              </div>
            </div>

            <div class="flex items-center gap-4 px-6 py-4">
              <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <i class="pi pi-at text-indigo-500"></i>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs text-slate-400 mb-0.5">Username</p>
                <p class="text-sm font-medium text-slate-800">{{ profile?.username || '—' }}</p>
              </div>
            </div>

            <div class="flex items-center gap-4 px-6 py-4">
              <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <i class="pi pi-envelope text-indigo-500"></i>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs text-slate-400 mb-0.5">Email address</p>
                <p class="text-sm font-medium text-slate-800">{{ profile?.email || '—' }}</p>
              </div>
            </div>

          </div>
        </div>

        <!-- Quick actions -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100">
            <h2 class="text-sm font-semibold text-slate-700">Quick actions</h2>
          </div>
          <div class="divide-y divide-slate-100">
            <a routerLink="/appointments"
               class="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group">
              <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <i class="pi pi-calendar-check text-indigo-500"></i>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-800">My appointments</p>
                <p class="text-xs text-slate-400 mt-0.5">View and manage your bookings</p>
              </div>
              <i class="pi pi-chevron-right text-slate-300 group-hover:text-slate-400 transition-colors"></i>
            </a>
            <a routerLink="/slots"
               class="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group">
              <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <i class="pi pi-calendar-plus text-indigo-500"></i>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-800">Browse available slots</p>
                <p class="text-xs text-slate-400 mt-0.5">Find and book an appointment</p>
              </div>
              <i class="pi pi-chevron-right text-slate-300 group-hover:text-slate-400 transition-colors"></i>
            </a>
          </div>
        </div>

        <!-- Sign out -->
        <button (click)="auth.logout()"
          class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-rose-200 text-rose-600 text-sm font-medium hover:bg-rose-50 transition-colors">
          <i class="pi pi-sign-out"></i>
          Sign out
        </button>

      </div>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);
  private appointmentService = inject(AppointmentService);

  profile = this.auth.getProfile();

  totalAppointments     = signal<number | null>(null);
  completedAppointments = signal<number | null>(null);
  upcomingAppointments  = signal<number | null>(null);

  ngOnInit() {
    this.appointmentService.getAll().subscribe({
      next: appts => {
        this.totalAppointments.set(appts.length);
        this.completedAppointments.set(appts.filter(a => a.status === 'COMPLETED' || a.status === 'ATTENDED').length);
        this.upcomingAppointments.set(appts.filter(a => a.status === 'SCHEDULED' || a.status === 'PENDING').length);
      },
      error: () => {
        this.totalAppointments.set(0);
        this.completedAppointments.set(0);
        this.upcomingAppointments.set(0);
      },
    });
  }
}
