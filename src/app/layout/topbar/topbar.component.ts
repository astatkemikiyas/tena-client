import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  '/':              { title: 'Home',              sub: 'Welcome to TenaDigital'     },
  '/doctors':       { title: 'Find a Doctor',     sub: 'Browse specialists near you' },
  '/slots':         { title: 'Available Slots',   sub: 'Book an appointment'         },
  '/appointments':  { title: 'My Appointments',   sub: 'View and manage your bookings' },
  '/appointments/book': { title: 'Book Appointment', sub: 'Confirm your slot'        },
};

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 sticky top-0 z-10">
      <div>
        <h1 class="text-sm font-semibold text-slate-800">{{ page().title }}</h1>
        <p class="text-xs text-slate-400">{{ page().sub }}</p>
      </div>
      <div class="flex items-center gap-1">
        <button class="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors relative">
          <i class="pi pi-bell text-sm"></i>
          <span class="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary-500"></span>
        </button>
        <button class="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <i class="pi pi-cog text-sm"></i>
        </button>
        <div class="w-px h-5 bg-slate-200 mx-1"></div>
        <div class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center cursor-pointer">
          <span class="text-xs font-bold text-white">P</span>
        </div>
      </div>
    </header>
  `,
})
export class TopbarComponent {
  private router = inject(Router);

  page = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: any) => {
        const path = '/' + (e.urlAfterRedirects ?? e.url).split('/').slice(1).join('/');
        return PAGE_TITLES[path] ?? PAGE_TITLES[Object.keys(PAGE_TITLES).find(k => path.startsWith(k) && k !== '/') ?? '/'];
      }),
    ),
    { initialValue: PAGE_TITLES['/'] },
  );
}
