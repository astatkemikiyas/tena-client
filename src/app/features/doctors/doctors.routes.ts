import { Routes } from '@angular/router';
export const DOCTORS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/doctor-list/doctor-list.component').then(m => m.DoctorListComponent) },
];
