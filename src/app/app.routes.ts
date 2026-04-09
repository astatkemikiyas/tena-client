import { Routes } from '@angular/router';
import { NavbarLayoutComponent } from './layout/navbar-layout/navbar-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // ── Auth pages (no navbar, full-screen) — blocked when logged in ─
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },

  // ── App pages (with navbar layout) ───────────────────────────────
  {
    path: '',
    component: NavbarLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'doctors',
        loadChildren: () => import('./features/doctors/doctors.routes').then(m => m.DOCTORS_ROUTES),
      },
      {
        path: 'slots',
        loadChildren: () => import('./features/slots/slots.routes').then(m => m.SLOTS_ROUTES),
      },
      {
        path: 'appointments',
        canActivate: [authGuard],
        loadChildren: () => import('./features/appointments/appointments.routes').then(m => m.APPOINTMENTS_ROUTES),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
      },
    ],
  },

  { path: 'callback', loadComponent: () => import('./features/auth/callback/callback.component').then(m => m.CallbackComponent) },
  { path: '**', redirectTo: '' },
];
