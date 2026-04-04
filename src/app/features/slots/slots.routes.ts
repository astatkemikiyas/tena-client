import { Routes } from '@angular/router';
export const SLOTS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/slot-browser/slot-browser.component').then(m => m.SlotBrowserComponent) },
];
