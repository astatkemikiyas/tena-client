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
      <a routerLink="/slots"
         class="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <i class="pi pi-arrow-left text-xs"></i> Back to slots
      </a>

      <!-- Slot summary -->
      @if (slot()) {
        <div class="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 p-5">
          <p class="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-3">Selected Slot</p>
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-white border border-indigo-100 flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
              <span class="text-base font-bold text-indigo-700 leading-none">{{ slot()!.startTime | date:'d' }}</span>
              <span class="text-xs text-indigo-400 uppercase leading-none mt-0.5">{{ slot()!.startTime | date:'MMM' }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-800">Dr. {{ slot()!.doctorName || '—' }}</p>
              @if (slot()!.specialization) {
                <p class="text-xs text-indigo-600 font-medium">{{ slot()!.specialization }}</p>
              }
              <p class="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <i class="pi pi-clock text-xs"></i>
                {{ slot()!.startTime | date:'HH:mm' }} – {{ slot()!.endTime | date:'HH:mm' }}
                · {{ slot()!.startTime | date:'EEE, MMM d' }}
              </p>
              @if (slot()!.hospitalName) {
                <p class="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <i class="pi pi-building text-xs"></i>{{ slot()!.hospitalName }}
                </p>
              }
            </div>
          </div>
        </div>
      }

      <!-- Who is this for? -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <div>
          <h2 class="text-base font-semibold text-slate-800">Who is this appointment for?</h2>
          <p class="text-xs text-slate-400 mt-0.5">Booking will be pending until the doctor confirms it</p>
        </div>

        <!-- Toggle cards -->
        <div class="grid grid-cols-2 gap-3">
          <button (click)="isProxy = false"
            [class]="toggleCardClass(false)">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                 [class]="isProxy ? 'bg-slate-100' : 'bg-indigo-100'">
              <i class="pi pi-user text-lg" [class]="isProxy ? 'text-slate-400' : 'text-indigo-600'"></i>
            </div>
            <span class="text-sm font-semibold block" [class]="isProxy ? 'text-slate-500' : 'text-slate-800'">
              For Myself
            </span>
            <span class="text-xs mt-0.5 block" [class]="isProxy ? 'text-slate-400' : 'text-indigo-500'">
              Using my account
            </span>
            @if (!isProxy) {
              <div class="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                <i class="pi pi-check text-white" style="font-size:9px"></i>
              </div>
            }
          </button>

          <button (click)="isProxy = true"
            [class]="toggleCardClass(true)">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                 [class]="!isProxy ? 'bg-slate-100' : 'bg-indigo-100'">
              <i class="pi pi-users text-lg" [class]="!isProxy ? 'text-slate-400' : 'text-indigo-600'"></i>
            </div>
            <span class="text-sm font-semibold block" [class]="!isProxy ? 'text-slate-500' : 'text-slate-800'">
              For Someone Else
            </span>
            <span class="text-xs mt-0.5 block" [class]="!isProxy ? 'text-slate-400' : 'text-indigo-500'">
              Booking on their behalf
            </span>
            @if (isProxy) {
              <div class="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                <i class="pi pi-check text-white" style="font-size:9px"></i>
              </div>
            }
          </button>
        </div>

        <!-- Proxy fields (animated) -->
        @if (isProxy) {
          <div class="space-y-4 pt-1 border-t border-slate-100">
            <p class="text-xs text-slate-500 pt-1 flex items-center gap-1.5">
              <i class="pi pi-info-circle text-indigo-400"></i>
              Enter the patient's details below
            </p>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700">Patient Full Name <span class="text-rose-400">*</span></label>
              <input pInputText [(ngModel)]="patientName"
                     placeholder="e.g. Abebe Kebede" class="w-full" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700">Patient Phone Number <span class="text-rose-400">*</span></label>
              <input pInputText [(ngModel)]="patientPhone"
                     placeholder="+251 9XX XXX XXX" class="w-full" />
            </div>
          </div>
        }

        <!-- Status notice -->
        <div class="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-amber-50 border border-amber-200">
          <i class="pi pi-clock text-amber-500 text-sm mt-0.5 flex-shrink-0"></i>
          <p class="text-xs text-amber-800">
            Your booking will be <strong>pending</strong> until the doctor approves it.
            You'll be notified once confirmed.
          </p>
        </div>

        @if (errorMsg()) {
          <div class="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-rose-50 border border-rose-200">
            <i class="pi pi-exclamation-circle text-rose-500 text-sm mt-0.5 flex-shrink-0"></i>
            <p class="text-xs text-rose-700">{{ errorMsg() }}</p>
          </div>
        }

        <!-- Actions -->
        <div class="flex gap-3 pt-2 border-t border-slate-100">
          <a routerLink="/slots" class="flex-1">
            <p-button label="Cancel" [text]="true" styleClass="w-full" />
          </a>
          <p-button
            [label]="isProxy ? 'Book for Patient' : 'Book for Myself'"
            styleClass="flex-1"
            icon="pi pi-calendar-plus"
            (onClick)="book()"
            [loading]="saving()" />
        </div>
      </div>

    </div>
  `,
})
export class BookAppointmentComponent implements OnInit {
  private svc     = inject(AppointmentService);
  private slotSvc = inject(SlotService);
  private route   = inject(ActivatedRoute);
  private msg     = inject(MessageService);
  router          = inject(Router);

  slotId      = signal(Number(this.route.snapshot.queryParamMap.get('slotId') ?? 0));
  slot        = signal<AvailabilitySlotDTO | null>(null);
  saving      = signal(false);
  errorMsg    = signal('');

  isProxy     = false;
  patientName  = '';
  patientPhone = '';

  ngOnInit() {
    if (this.slotId()) {
      this.slotSvc.getById(this.slotId()).subscribe({ next: s => this.slot.set(s) });
    }
  }

  toggleCardClass(forProxy: boolean): string {
    const active = this.isProxy === forProxy;
    return 'relative flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all cursor-pointer ' +
      (active
        ? 'border-indigo-500 bg-indigo-50 shadow-sm'
        : 'border-slate-200 bg-white hover:border-slate-300');
  }

  book() {
    this.errorMsg.set('');
    if (this.isProxy) {
      if (!this.patientName.trim()) { this.errorMsg.set("Patient's name is required for proxy booking."); return; }
      if (!this.patientPhone.trim()) { this.errorMsg.set("Patient's phone number is required for proxy booking."); return; }
    }
    this.saving.set(true);
    this.svc.book({
      slotId:         this.slotId(),
      isProxyBooking: this.isProxy,
      patientName:    this.isProxy ? this.patientName.trim()  : undefined,
      patientPhone:   this.isProxy ? this.patientPhone.trim() : undefined,
    }).subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'Booking submitted!',
          detail: 'Your appointment is pending doctor approval.' });
        setTimeout(() => this.router.navigate(['/appointments']), 1800);
      },
      error: () => {
        this.errorMsg.set('Booking failed. Please try again.');
        this.saving.set(false);
      },
      complete: () => this.saving.set(false),
    });
  }
}
