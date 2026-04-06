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
    <div class="max-w-2xl mx-auto space-y-4">

      <!-- ── Hero card ────────────────────────────────────────── -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        <!-- Gradient top bar -->
        <div class="h-1.5 bg-gradient-to-r from-primary-400 to-primary-600"></div>

        <div class="p-6 sm:p-8">

          <!-- Avatar + identity -->
          <div class="flex flex-col sm:flex-row sm:items-center gap-5 mb-8">
            <div class="w-20 h-20 rounded-2xl bg-primary-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-600/20">
              <span class="text-3xl font-black text-white tracking-tight">{{ profile?.initials }}</span>
            </div>
            <div class="min-w-0">
              <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight truncate">
                {{ profile?.name || 'Your Name' }}
              </h1>
              <p class="text-sm font-semibold text-slate-400 mt-0.5">
                &#64;{{ profile?.username || '—' }}
              </p>
              <p class="text-sm text-slate-400 mt-0.5 truncate">{{ profile?.email || '—' }}</p>
            </div>
          </div>

          <!-- Stats row -->
          <div class="grid grid-cols-3 gap-px bg-slate-100 rounded-xl overflow-hidden">
            <div class="bg-white px-4 py-4 text-center">
              @if (totalAppointments() === null) {
                <div class="h-7 w-10 bg-slate-100 rounded animate-pulse mx-auto mb-1.5"></div>
              } @else {
                <p class="text-2xl font-black text-slate-900">{{ totalAppointments() }}</p>
              }
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Total</p>
            </div>
            <div class="bg-white px-4 py-4 text-center">
              @if (completedAppointments() === null) {
                <div class="h-7 w-10 bg-slate-100 rounded animate-pulse mx-auto mb-1.5"></div>
              } @else {
                <p class="text-2xl font-black text-emerald-600">{{ completedAppointments() }}</p>
              }
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Completed</p>
            </div>
            <div class="bg-white px-4 py-4 text-center">
              @if (upcomingAppointments() === null) {
                <div class="h-7 w-10 bg-slate-100 rounded animate-pulse mx-auto mb-1.5"></div>
              } @else {
                <p class="text-2xl font-black text-primary-600">{{ upcomingAppointments() }}</p>
              }
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Upcoming</p>
            </div>
          </div>

        </div>
      </div>

      <!-- ── Account information ───────────────────────────────── -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <i class="pi pi-id-card text-primary-500 text-sm"></i>
          <h2 class="text-sm font-bold text-slate-700 tracking-tight">Account information</h2>
        </div>
        <div class="divide-y divide-slate-50">

          <div class="flex items-center gap-4 px-6 py-4">
            <div class="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
              <i class="pi pi-user text-slate-400 text-sm"></i>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Full name</p>
              <p class="text-sm font-semibold text-slate-800 truncate">{{ profile?.name || '—' }}</p>
            </div>
          </div>

          <div class="flex items-center gap-4 px-6 py-4">
            <div class="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
              <i class="pi pi-at text-slate-400 text-sm"></i>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Username</p>
              <p class="text-sm font-semibold text-slate-800 truncate">{{ profile?.username || '—' }}</p>
            </div>
          </div>

          <div class="flex items-center gap-4 px-6 py-4">
            <div class="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
              <i class="pi pi-envelope text-slate-400 text-sm"></i>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email address</p>
              <p class="text-sm font-semibold text-slate-800 truncate">{{ profile?.email || '—' }}</p>
            </div>
          </div>

        </div>
      </div>

      <!-- ── Quick actions ─────────────────────────────────────── -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <i class="pi pi-bolt text-primary-500 text-sm"></i>
          <h2 class="text-sm font-bold text-slate-700 tracking-tight">Quick actions</h2>
        </div>
        <div class="divide-y divide-slate-50">

          <a routerLink="/appointments"
             class="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group">
            <div class="w-9 h-9 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0">
              <i class="pi pi-calendar-check text-primary-600 text-sm"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-800">My appointments</p>
              <p class="text-xs text-slate-400 mt-0.5">View and manage your bookings</p>
            </div>
            <i class="pi pi-chevron-right text-slate-300 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all text-xs"></i>
          </a>

          <a routerLink="/slots"
             class="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group">
            <div class="w-9 h-9 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0">
              <i class="pi pi-calendar-plus text-primary-600 text-sm"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-800">Browse available slots</p>
              <p class="text-xs text-slate-400 mt-0.5">Find and book a new appointment</p>
            </div>
            <i class="pi pi-chevron-right text-slate-300 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all text-xs"></i>
          </a>

          <a routerLink="/doctors"
             class="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group">
            <div class="w-9 h-9 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0">
              <i class="pi pi-search text-primary-600 text-sm"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-800">Find a doctor</p>
              <p class="text-xs text-slate-400 mt-0.5">Browse verified specialists</p>
            </div>
            <i class="pi pi-chevron-right text-slate-300 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all text-xs"></i>
          </a>

        </div>
      </div>

      <!-- ── Sign out ───────────────────────────────────────────── -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <button (click)="auth.logout()"
          class="w-full flex items-center gap-4 px-6 py-4 hover:bg-rose-50 transition-colors group text-left">
          <div class="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0">
            <i class="pi pi-sign-out text-rose-500 text-sm"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-rose-600">Sign out</p>
            <p class="text-xs text-slate-400 mt-0.5">Sign out of your account</p>
          </div>
          <i class="pi pi-chevron-right text-slate-200 group-hover:text-rose-300 group-hover:translate-x-0.5 transition-all text-xs"></i>
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
