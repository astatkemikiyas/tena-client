import { Injectable, inject } from '@angular/core';
import { ClientService } from '../../../api';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private api = inject(ClientService);

  getAll() { return this.api.getAvailableDoctors(); }
}
