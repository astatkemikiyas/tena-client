import { Routes } from '@angular/router';
export const APPOINTMENTS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/appointment-list/appointment-list.component').then(m => m.AppointmentListComponent) },
  { path: 'book', loadComponent: () => import('./pages/book-appointment/book-appointment.component').then(m => m.BookAppointmentComponent) },
];
