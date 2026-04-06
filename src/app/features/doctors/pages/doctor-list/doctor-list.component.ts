import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DoctorService } from '../../services/doctor.service';
import { DoctorProfileDTO } from '../../../../shared/models';

const SPECIALIZATIONS = [
  'All', 'General Medicine', 'Cardiology', 'Dermatology', 'Pediatrics',
  'Orthopedics', 'Ophthalmology', 'Dentistry', 'Psychiatry', 'Neurology',
];

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, SelectModule, ProgressSpinnerModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-slate-800">Find a Doctor</h2>
          <p class="text-sm text-slate-500">{{ filtered().length }} doctors available</p>
        </div>
        <div class="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
          <p-select [(ngModel)]="selectedSpec" [options]="specs"
                    placeholder="Specialty" styleClass="w-full sm:w-48" />
          <p-select [(ngModel)]="selectedRegion" [options]="regions()"
                    placeholder="Region" styleClass="w-full sm:w-36"
                    (onChange)="onRegionChange()" />
          <p-select [(ngModel)]="selectedCity" [options]="cities()"
                    placeholder="City" styleClass="w-full sm:w-36" />
        </div>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-20">
          <p-progressSpinner strokeWidth="3" [style]="{width:'48px',height:'48px'}" />
        </div>
      } @else if (filtered().length === 0) {
        <div class="flex flex-col items-center py-20 gap-3 text-slate-400">
          <i class="pi pi-user-minus text-5xl"></i>
          <p class="text-sm font-medium">No doctors found</p>
          <p class="text-xs text-slate-400">Try a different specialization</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (doc of filtered(); track doc.userId) {
            <div class="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-primary-200 transition-all flex flex-col gap-4">
              <div class="flex items-start gap-4">
                <div class="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <span class="text-xl font-bold text-primary-700">
                    {{ initials(doc.name) }}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-slate-800 text-sm leading-snug">
                    {{ doc.name || 'Dr. ' + doc.medicalLicenseNumber }}
                  </h3>
                  <p class="text-xs text-primary-600 font-medium mt-0.5">
                    {{ doc.specialization || 'General Medicine' }}
                  </p>
                  @if (doc.hospitalName || doc.city) {
                    <p class="text-xs text-slate-400 mt-1 flex items-center gap-1 truncate">
                      <i class="pi pi-building text-xs"></i>
                      {{ doc.hospitalName }}
                      @if(doc.hospitalName && doc.city){ · }
                      {{ doc.city }}
                    </p>
                  }
                </div>
              </div>
              @if (doc.bio) {
                <p class="text-xs text-slate-500 leading-relaxed line-clamp-2">{{ doc.bio }}</p>
              }
              <div class="flex items-center justify-between pt-1 border-t border-slate-100">
                @if (doc.yearsOfExperience) {
                  <span class="text-xs text-slate-400">
                    <i class="pi pi-star text-amber-400 mr-1"></i>
                    {{ doc.yearsOfExperience }}+ yrs experience
                  </span>
                } @else {
                  <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                    Available
                  </span>
                }
                <p-button label="Book Slot" size="small" icon="pi pi-calendar-plus"
                          (onClick)="bookSlot(doc)" />
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class DoctorListComponent implements OnInit {
  private svc    = inject(DoctorService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  doctors      = signal<DoctorProfileDTO[]>([]);
  loading      = signal(false);
  selectedSpec = signal<string>('All');
  selectedRegion = signal<string>('All');
  selectedCity = signal<string>('All');
  specs        = SPECIALIZATIONS;

  regions = computed(() => ['All', ...new Set(this.doctors().map(d => d.region).filter(Boolean) as string[])]);
  cities = computed(() => ['All', ...new Set(this.doctors()
     .filter(d => this.selectedRegion() === 'All' || d.region === this.selectedRegion())
     .map(d => d.city).filter(Boolean) as string[])]);

  filtered = computed(() =>
    this.doctors().filter(d => {
      const specMatch = this.selectedSpec() === 'All' || (d.specialization ?? 'General Medicine') === this.selectedSpec();
      const regionMatch = this.selectedRegion() === 'All' || d.region === this.selectedRegion();
      const cityMatch = this.selectedCity() === 'All' || d.city === this.selectedCity();
      return specMatch && regionMatch && cityMatch;
    })
  );

  ngOnInit() {
    const spec = this.route.snapshot.queryParamMap.get('spec');
    if (spec) this.selectedSpec.set(spec);
    this.load();
  }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next:     d => this.doctors.set(d),
      error:    () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  onRegionChange() {
    this.selectedCity.set('All');
  }

  bookSlot(doc: DoctorProfileDTO) {
    this.router.navigate(['/slots'], {
      queryParams: { doctorId: doc.userId },
    });
  }

  initials(name?: string): string {
    if (!name) return 'Dr';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }
}
