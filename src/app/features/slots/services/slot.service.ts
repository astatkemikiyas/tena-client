import { Injectable, inject } from '@angular/core';
import { ClientService } from '../../../api';

@Injectable({ providedIn: 'root' })
export class SlotService {
  private api = inject(ClientService);

  getAll()            { return this.api.getAvailableSlots(); }
  getById(id: number) { return this.api.getSlotById(id); }
}
