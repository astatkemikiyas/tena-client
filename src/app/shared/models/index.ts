// Re-export all generated models and services from the OpenAPI spec
export * from '../api';

// Alias: client spec uses PublicDoctorDTO — keep DoctorProfileDTO for backward compat
export type { PublicDoctorDTO as DoctorProfileDTO } from '../api/model/publicDoctorDTO';

// Additional type aliases
export type AppointmentStatus =
  | 'PENDING' | 'SCHEDULED' | 'CANCELLED' | 'LATE_CANCEL'
  | 'ATTENDED' | 'NO_SHOW'  | 'COMPLETED';
