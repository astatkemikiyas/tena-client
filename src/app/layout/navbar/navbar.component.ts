import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex items-center justify-between h-16">

          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2.5 flex-shrink-0">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-sm">
              <i class="pi pi-heart text-white text-sm"></i>
            </div>
            <span class="font-bold text-slate-800 text-base tracking-tight">TenaDigital</span>
          </a>

          <!-- Desktop nav -->
          <nav class="hidden md:flex items-center gap-1">
            <a routerLink="/" [routerLinkActiveOptions]="{exact:true}" routerLinkActive="text-indigo-600 font-medium bg-indigo-50"
               class="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              Home
            </a>
            <a routerLink="/doctors" routerLinkActive="text-indigo-600 font-medium bg-indigo-50"
               class="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              Find Doctors
            </a>
            <a routerLink="/slots" routerLinkActive="text-indigo-600 font-medium bg-indigo-50"
               class="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              Browse Slots
            </a>
            @if (auth.isAuthenticated()) {
              <a routerLink="/appointments" routerLinkActive="text-indigo-600 font-medium bg-indigo-50"
                 class="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                My Appointments
              </a>
            }
          </nav>

          <!-- Desktop auth -->
          <div class="hidden md:flex items-center gap-3">
            @if (auth.isAuthenticated()) {
              <button (click)="auth.logout()"
                class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors">
                <div class="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                  <span class="text-xs font-bold text-white">P</span>
                </div>
                <span>Logout</span>
              </button>
            } @else {
              <a routerLink="/login"
                 class="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-2">
                Log in
              </a>
              <a routerLink="/register"
                 class="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                Get Started
              </a>
            }
          </div>

          <!-- Mobile hamburger -->
          <button (click)="mobileOpen.set(!mobileOpen())"
                  class="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
            <i [class]="mobileOpen() ? 'pi pi-times' : 'pi pi-bars'" class="text-base"></i>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      @if (mobileOpen()) {
        <div class="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          <a routerLink="/" (click)="mobileOpen.set(false)" routerLinkActive="text-indigo-600 bg-indigo-50"
             [routerLinkActiveOptions]="{exact:true}"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <i class="pi pi-home text-sm w-4"></i> Home
          </a>
          <a routerLink="/doctors" (click)="mobileOpen.set(false)" routerLinkActive="text-indigo-600 bg-indigo-50"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <i class="pi pi-user-plus text-sm w-4"></i> Find Doctors
          </a>
          <a routerLink="/slots" (click)="mobileOpen.set(false)" routerLinkActive="text-indigo-600 bg-indigo-50"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <i class="pi pi-calendar text-sm w-4"></i> Browse Slots
          </a>
          @if (auth.isAuthenticated()) {
            <a routerLink="/appointments" (click)="mobileOpen.set(false)" routerLinkActive="text-indigo-600 bg-indigo-50"
               class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              <i class="pi pi-calendar-check text-sm w-4"></i> My Appointments
            </a>
            <div class="pt-2 border-t border-slate-100">
              <button (click)="auth.logout(); mobileOpen.set(false)"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-rose-600 hover:bg-rose-50 transition-colors">
                <i class="pi pi-sign-out text-sm w-4"></i> Logout
              </button>
            </div>
          } @else {
            <div class="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <a routerLink="/login" (click)="mobileOpen.set(false)"
                 class="flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors">
                Log in
              </a>
              <a routerLink="/register" (click)="mobileOpen.set(false)"
                 class="flex items-center justify-center px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
                Get Started
              </a>
            </div>
          }
        </div>
      }
    </header>
  `,
})
export class NavbarComponent {
  auth       = inject(AuthService);
  mobileOpen = signal(false);
}
