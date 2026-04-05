import { Injectable, inject } from '@angular/core';
import { ClientService } from '../../../api';
import { AppointmentDTO } from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private api = inject(ClientService);

  getAll()                  { return this.api.getMyAppointments(); }
  getById(id: number)       { return this.api.getAppointmentById(id); }
  book(dto: AppointmentDTO) { return this.api.bookAppointment(dto); }
  cancel(id: number)        { return this.api.cancelAppointment(id); }
}
