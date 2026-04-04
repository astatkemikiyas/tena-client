import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AppointmentDTO } from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/client/appointments`;

  getAll()              { return this.http.get<AppointmentDTO[]>(this.base); }
  getById(id: number)   { return this.http.get<AppointmentDTO>(`${this.base}/${id}`); }
  book(dto: AppointmentDTO) { return this.http.post<AppointmentDTO>(this.base, dto); }
  cancel(id: number)    { return this.http.delete<void>(`${this.base}/${id}`); }
}
