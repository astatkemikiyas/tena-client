import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface ServiceCategory { name: string; icon: string; bg: string; fg: string; spec: string; }
interface Step           { num: string; title: string; desc: string; icon: string; }

const CATEGORIES: ServiceCategory[] = [
  { name: 'General Medicine', icon: 'pi-heart',      bg: 'bg-rose-50',   fg: 'text-rose-500',   spec: 'General Medicine' },
  { name: 'Cardiology',       icon: 'pi-chart-line', bg: 'bg-red-50',    fg: 'text-red-500',    spec: 'Cardiology'       },
  { name: 'Dermatology',      icon: 'pi-sun',        bg: 'bg-amber-50',  fg: 'text-amber-500',  spec: 'Dermatology'      },
  { name: 'Pediatrics',       icon: 'pi-users',      bg: 'bg-blue-50',   fg: 'text-blue-500',   spec: 'Pediatrics'       },
  { name: 'Orthopedics',      icon: 'pi-wrench',     bg: 'bg-green-50',  fg: 'text-green-500',  spec: 'Orthopedics'      },
  { name: 'Ophthalmology',    icon: 'pi-eye',        bg: 'bg-purple-50', fg: 'text-purple-500', spec: 'Ophthalmology'    },
  { name: 'Dentistry',        icon: 'pi-shield',     bg: 'bg-teal-50',   fg: 'text-teal-500',   spec: 'Dentistry'        },
  { name: 'Psychiatry',       icon: 'pi-comments',   bg: 'bg-indigo-50', fg: 'text-indigo-500', spec: 'Psychiatry'       },
];

const STEPS: Step[] = [
  { num: '01', title: 'Find a Doctor',    desc: 'Browse verified specialists by specialty, hospital, or availability.',   icon: 'pi-search'          },
  { num: '02', title: 'Pick a Slot',      desc: 'Choose a time that works for you from real-time available slots.',       icon: 'pi-calendar'        },
  { num: '03', title: 'Confirm Booking',  desc: 'Create a free account and confirm your appointment in seconds.',         icon: 'pi-check-circle'    },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-16">

      <!-- ── Hero ────────────────────────────────────────────────── -->
      <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600 text-white px-8 py-16 sm:py-20">
        <div class="relative z-10 max-w-2xl">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-indigo-100 mb-5">
            <i class="pi pi-verified text-xs"></i> Verified Healthcare Professionals
          </span>
          <h1 class="text-4xl sm:text-5xl font-bold leading-tight tracking-tight mb-4">
            Quality Healthcare,<br/>At Your Fingertips
          </h1>
          <p class="text-indigo-200 text-lg leading-relaxed mb-8 max-w-lg">
            Book appointments with top specialists across Ethiopia's leading hospitals — fast, easy, and completely free.
          </p>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/slots"
               class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-700 font-semibold text-sm hover:bg-indigo-50 transition-colors shadow-lg">
              <i class="pi pi-calendar text-sm"></i> Browse Available Slots
            </a>
            <a routerLink="/doctors"
               class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-800/40 text-white font-medium text-sm border border-white/20 hover:bg-indigo-800/60 transition-colors">
              <i class="pi pi-search text-sm"></i> Find a Doctor
            </a>
          </div>
        </div>
        <!-- Decorative circles -->
        <div class="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/5"></div>
        <div class="absolute right-8 -bottom-20 w-96 h-96 rounded-full bg-white/5"></div>
        <div class="absolute right-48 top-8 w-24 h-24 rounded-full bg-white/5"></div>
      </section>

      <!-- ── Stats bar ─────────────────────────────────────────────── -->
      <section class="grid grid-cols-3 gap-0 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="flex flex-col items-center py-6 px-4">
          <span class="text-3xl font-bold text-indigo-600">500+</span>
          <span class="text-xs text-slate-500 mt-1 font-medium">Registered Doctors</span>
        </div>
        <div class="flex flex-col items-center py-6 px-4 border-x border-slate-200">
          <span class="text-3xl font-bold text-indigo-600">50+</span>
          <span class="text-xs text-slate-500 mt-1 font-medium">Partner Hospitals</span>
        </div>
        <div class="flex flex-col items-center py-6 px-4">
          <span class="text-3xl font-bold text-indigo-600">15+</span>
          <span class="text-xs text-slate-500 mt-1 font-medium">Specializations</span>
        </div>
      </section>

      <!-- ── Service Categories ─────────────────────────────────────── -->
      <section>
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-slate-800">Our Services</h2>
          <p class="text-slate-500 text-sm mt-1">Find the right specialist for your needs</p>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          @for (cat of categories; track cat.name) {
            <a [routerLink]="['/doctors']" [queryParams]="{ spec: cat.spec }"
               class="group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer text-center">
              <div [class]="'w-13 h-13 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ' + cat.bg">
                <i [class]="'pi text-xl ' + cat.icon + ' ' + cat.fg"></i>
              </div>
              <span class="text-xs font-semibold text-slate-700 leading-tight">{{ cat.name }}</span>
            </a>
          }
        </div>
      </section>

      <!-- ── How it works ───────────────────────────────────────────── -->
      <section class="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12">
        <div class="text-center mb-10">
          <h2 class="text-2xl font-bold text-slate-800">How It Works</h2>
          <p class="text-slate-500 text-sm mt-2">Get care in three simple steps</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-8">
          @for (step of steps; track step.num) {
            <div class="flex flex-col items-center text-center gap-4">
              <div class="relative">
                <div class="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <i [class]="'pi text-2xl text-indigo-600 ' + step.icon"></i>
                </div>
                <span class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  {{ step.num }}
                </span>
              </div>
              <div>
                <h3 class="font-semibold text-slate-800 text-sm mb-1">{{ step.title }}</h3>
                <p class="text-xs text-slate-500 leading-relaxed">{{ step.desc }}</p>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- ── CTA ────────────────────────────────────────────────────── -->
      @if (!auth.isAuthenticated()) {
        <section class="rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 text-white px-8 py-12 text-center">
          <h2 class="text-2xl font-bold mb-2">Ready to take care of your health?</h2>
          <p class="text-slate-400 text-sm mb-6">Create a free account and book your first appointment today.</p>
          <div class="flex flex-wrap justify-center gap-3">
            <a routerLink="/register"
               class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 transition-colors shadow-lg">
              <i class="pi pi-user-plus text-sm"></i> Create Free Account
            </a>
            <a routerLink="/slots"
               class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium text-sm hover:bg-white/20 transition-colors">
              Browse Slots First
            </a>
          </div>
        </section>
      }

    </div>
  `,
})
export class HomeComponent {
  auth       = inject(AuthService);
  categories = CATEGORIES;
  steps      = STEPS;
}
