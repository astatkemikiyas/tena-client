import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { DoctorProfileDTO } from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/client/doctors`;

  getAll()                    { return this.http.get<DoctorProfileDTO[]>(this.base); }
  getById(id: string)         { return this.http.get<DoctorProfileDTO>(`${this.base}/${id}`); }
  getSlots(doctorId: string)  { return this.http.get<any[]>(`${this.base}/${doctorId}/slots`); }
}
