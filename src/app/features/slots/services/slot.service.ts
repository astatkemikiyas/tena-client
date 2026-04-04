import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AvailabilitySlotDTO } from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class SlotService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/client/slots`;

  getAll()         { return this.http.get<AvailabilitySlotDTO[]>(this.base); }
  getById(id: number) { return this.http.get<AvailabilitySlotDTO>(`${this.base}/${id}`); }
}
