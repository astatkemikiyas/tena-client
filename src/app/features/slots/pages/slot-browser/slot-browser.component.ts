import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SlotService } from '../../services/slot.service';
import { AvailabilitySlotDTO } from '../../../../shared/models';

const SPECIALIZATIONS = [
  { label: 'All Specializations', value: '' },
  { label: 'General Medicine',    value: 'General Medicine' },
  { label: 'Cardiology',          value: 'Cardiology' },
  { label: 'Dermatology',         value: 'Dermatology' },
  { label: 'Pediatrics',          value: 'Pediatrics' },
  { label: 'Orthopedics',         value: 'Orthopedics' },
  { label: 'Ophthalmology',       value: 'Ophthalmology' },
  { label: 'Dentistry',           value: 'Dentistry' },
  { label: 'Psychiatry',          value: 'Psychiatry' },
];

@Component({
  selector: 'app-slot-browser',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, SelectModule, ProgressSpinnerModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast />
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-slate-800">Available Slots</h2>
          <p class="text-sm text-slate-500">{{ filtered().length }} slots available</p>
        </div>
        <div class="w-full sm:w-56">
          <p-select [(ngModel)]="filterSpec" [options]="specs" optionLabel="label" optionValue="value"
                    placeholder="All Specializations" styleClass="w-full" />
        </div>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-20">
          <p-progressSpinner strokeWidth="3" [style]="{width:'48px',height:'48px'}" />
        </div>
      } @else if (filtered().length === 0) {
        <div class="flex flex-col items-center py-20 gap-3">
          <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
            <i class="pi pi-calendar text-3xl text-slate-400"></i>
          </div>
          <p class="text-sm font-medium text-slate-600">No slots available</p>
          <p class="text-xs text-slate-400">Check back later or try a different filter</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (slot of filtered(); track slot.id) {
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all flex flex-col">
              <div class="bg-gradient-to-r from-slate-50 to-indigo-50 px-5 pt-5 pb-4">
                <div class="flex items-start justify-between mb-1">
                  <div>
                    <p class="text-base font-semibold text-slate-800">
                      {{ slot.startTime | date:'EEEE, MMM d' }}
                    </p>
                    <p class="text-sm text-slate-500 mt-0.5">
                      <i class="pi pi-clock text-xs mr-1"></i>
                      {{ slot.startTime | date:'HH:mm' }} – {{ slot.endTime | date:'HH:mm' }}
                    </p>
                  </div>
                  <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 flex-shrink-0">
                    Open
                  </span>
                </div>
              </div>

              <div class="px-5 py-4 flex-1 flex flex-col gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span class="text-sm font-bold text-indigo-700">
                      {{ initials(slot.doctorName) }}
                    </span>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-slate-800 truncate">
                      {{ slot.doctorName || 'Doctor' }}
                    </p>
                    @if (slot.specialization) {
                      <p class="text-xs text-indigo-600 font-medium">{{ slot.specialization }}</p>
                    }
                  </div>
                </div>
                @if (slot.hospitalName) {
                  <p class="text-xs text-slate-400 flex items-center gap-1.5">
                    <i class="pi pi-building text-xs"></i>{{ slot.hospitalName }}
                  </p>
                }
                <div class="mt-auto pt-2">
                  <p-button label="Book This Slot" styleClass="w-full" size="small"
                            icon="pi pi-calendar-plus" (onClick)="book(slot)" />
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class SlotBrowserComponent implements OnInit {
  private svc    = inject(SlotService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  slots      = signal<AvailabilitySlotDTO[]>([]);
  loading    = signal(false);
  filterSpec = '';
  specs      = SPECIALIZATIONS;

  filtered = computed(() =>
    this.filterSpec
      ? this.slots().filter(s => s.specialization === this.filterSpec)
      : this.slots()
  );

  ngOnInit() {
    const doctorId = this.route.snapshot.queryParamMap.get('doctorId');
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: d => {
        const list = doctorId ? d.filter(s => s.doctorId === doctorId) : d;
        this.slots.set(list);
      },
      error:    () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  book(slot: AvailabilitySlotDTO) {
    this.router.navigate(['/appointments/book'], { queryParams: { slotId: slot.id } });
  }

  initials(name?: string): string {
    if (!name) return 'Dr';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }
}
