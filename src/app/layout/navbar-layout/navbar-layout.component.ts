import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-navbar-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col">
      <app-navbar />
      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <router-outlet />
      </main>
      <footer class="border-t border-slate-200 bg-white mt-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div class="flex items-center gap-2">
<img src="assets/images/logo.png" alt="TenaDigital" class="h-8 w-auto" />
            <span class="text-sm font-bold text-slate-700 leading-none">TenaDigital</span>
          </div>
          <p class="text-xs text-slate-400">&copy; {{ year }} Tena Digital. All rights reserved.</p>
          <div class="flex items-center gap-4 text-xs text-slate-400">
            <a href="#" class="hover:text-slate-600 transition-colors">Privacy</a>
            <a href="#" class="hover:text-slate-600 transition-colors">Terms</a>
            <a href="#" class="hover:text-slate-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class NavbarLayoutComponent {
  year = new Date().getFullYear();
}
