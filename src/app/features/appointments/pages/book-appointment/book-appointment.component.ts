import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AppointmentService } from '../../services/appointment.service';
import { SlotService } from '../../../slots/services/slot.service';
import { AvailabilitySlotDTO } from '../../../../shared/models';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule, InputTextModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast />
    <div class="max-w-lg mx-auto space-y-5">

      <!-- Back -->
      <a routerLink="/slots" class="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <i class="pi pi-arrow-left text-xs"></i> Back to slots
      </a>

      <!-- Slot summary card -->
      @if (slot()) {
        <div class="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 p-5">
          <p class="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-3">Appointment Summary</p>
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-white border border-indigo-100 flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
              <span class="text-base font-bold text-indigo-700 leading-none">
                {{ slot()!.startTime | date:'d' }}
              </span>
              <span class="text-xs text-indigo-400 uppercase leading-none mt-0.5">
                {{ slot()!.startTime | date:'MMM' }}
              </span>
            </div>
            <div class="flex-1">
              <p class="text-sm font-semibold text-slate-800">
                {{ slot()!.doctorName || 'Doctor' }}
              </p>
              @if (slot()!.specialization) {
                <p class="text-xs text-indigo-600 font-medium">{{ slot()!.specialization }}</p>
              }
              <p class="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <i class="pi pi-clock text-xs"></i>
                {{ slot()!.startTime | date:'HH:mm' }} – {{ slot()!.endTime | date:'HH:mm' }}
              </p>
              @if (slot()!.hospitalName) {
                <p class="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <i class="pi pi-building text-xs"></i>{{ slot()!.hospitalName }}
                </p>
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="bg-indigo-50 rounded-2xl border border-indigo-100 p-5">
          <p class="text-sm text-slate-600">Booking slot <strong>#{{ slotId() }}</strong></p>
        </div>
      }

      <!-- Form card -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <div>
          <h2 class="text-base font-semibold text-slate-800">Patient Details</h2>
          <p class="text-xs text-slate-400 mt-0.5">Leave blank to book for yourself</p>
        </div>

        <div class="space-y-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700">Patient Name <span class="text-slate-400 font-normal">(proxy booking)</span></label>
            <input pInputText [(ngModel)]="patientName" placeholder="Enter patient's full name" class="w-full" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700">Phone Number <span class="text-slate-400 font-normal">(proxy booking)</span></label>
            <input pInputText [(ngModel)]="patientPhone" placeholder="+251 9XX XXX XXX" class="w-full" />
          </div>
        </div>

        <div class="flex gap-3 pt-2 border-t border-slate-100">
          <a routerLink="/slots" class="flex-1">
            <p-button label="Cancel" [text]="true" styleClass="w-full" />
          </a>
          <p-button label="Confirm Booking" styleClass="flex-1"
                    icon="pi pi-check" (onClick)="book()" [loading]="saving()" />
        </div>
      </div>

    </div>
  `,
})
export class BookAppointmentComponent implements OnInit {
  private svc      = inject(AppointmentService);
  private slotSvc  = inject(SlotService);
  private route    = inject(ActivatedRoute);
  private msg      = inject(MessageService);
  router           = inject(Router);

  slotId      = signal(Number(this.route.snapshot.queryParamMap.get('slotId') ?? 0));
  slot        = signal<AvailabilitySlotDTO | null>(null);
  patientName  = '';
  patientPhone = '';
  saving       = signal(false);

  ngOnInit() {
    if (this.slotId()) {
      this.slotSvc.getById(this.slotId()).subscribe({
        next: s => this.slot.set(s),
      });
    }
  }

  book() {
    this.saving.set(true);
    const isProxy = !!this.patientName;
    this.svc.book({
      slotId:         this.slotId(),
      isProxyBooking: isProxy,
      patientName:    isProxy ? this.patientName  : undefined,
      patientPhone:   isProxy ? this.patientPhone : undefined,
    }).subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'Booked!', detail: 'Your appointment is confirmed.' });
        setTimeout(() => this.router.navigate(['/appointments']), 1500);
      },
      error:    () => { this.msg.add({ severity: 'error', summary: 'Booking failed', detail: 'Please try again.' }); this.saving.set(false); },
      complete: () => this.saving.set(false),
    });
  }
}
