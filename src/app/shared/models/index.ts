// Re-export all generated models and services from the OpenAPI spec
export * from '../../api';

import { PublicDoctorDTO } from '../../api/model/publicDoctorDTO';

export interface DoctorProfileDTO extends PublicDoctorDTO {
  region?: string;
  city?: string;
}

// Additional type aliases
export type AppointmentStatus =
  | 'PENDING' | 'SCHEDULED' | 'CANCELLED' | 'LATE_CANCEL'
  | 'ATTENDED' | 'NO_SHOW'  | 'COMPLETED';
