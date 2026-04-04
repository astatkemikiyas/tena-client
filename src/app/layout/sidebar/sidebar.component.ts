import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

interface NavItem {
  label: string;
  icon:  string;
  path:  string;
}

const NAV: NavItem[] = [
  { label: 'Home',            icon: 'pi-home',            path: '/'              },
  { label: 'Find a Doctor',   icon: 'pi-search',          path: '/doctors'       },
  { label: 'Available Slots', icon: 'pi-calendar',        path: '/slots'         },
  { label: 'My Appointments', icon: 'pi-calendar-check',  path: '/appointments'  },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <aside class="flex flex-col w-64 min-h-screen bg-white border-r border-slate-200">
      <!-- Logo -->
      <div class="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-sm">
          <i class="pi pi-heart text-white text-base"></i>
        </div>
        <div>
          <span class="font-bold text-slate-800 text-sm tracking-tight">Tena</span>
          <span class="block text-xs text-slate-400 -mt-0.5">Patient Portal</span>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-5 space-y-0.5">
        <p class="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu</p>
        @for (item of nav; track item.path) {
          <a [routerLink]="item.path"
             routerLinkActive="bg-indigo-50 text-indigo-700 font-medium"
             [routerLinkActiveOptions]="{ exact: item.path === '/' }"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 text-sm hover:bg-slate-50 transition-colors">
            <i [class]="'pi ' + item.icon + ' text-base'"></i>
            {{ item.label }}
          </a>
        }
      </nav>

      <!-- Profile -->
      <div class="px-3 py-4 border-t border-slate-100">
        <div class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
            <i class="pi pi-user text-indigo-600 text-sm"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-slate-700 truncate">My Account</p>
            <p class="text-xs text-slate-400 truncate">patient&#64;tena.et</p>
          </div>
          <i class="pi pi-cog text-slate-400 text-xs"></i>
        </div>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  nav = NAV;
}
