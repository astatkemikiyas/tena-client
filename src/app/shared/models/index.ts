export type AppointmentStatus =
  | 'PENDING'   | 'SCHEDULED' | 'CANCELLED' | 'LATE_CANCEL'
  | 'ATTENDED'  | 'NO_SHOW'   | 'COMPLETED';

export interface AvailabilitySlotDTO {
  id?:             number;
  doctorId?:       string;
  hospitalId?:     number;
  hospitalName?:   string;
  startTime:       string;
  endTime:         string;
  doctorName?:     string;
  specialization?: string;
  createdAt?:      string;
}

export interface DoctorProfileDTO {
  userId?:              string;
  name?:                string;
  medicalLicenseNumber: string;
  specialization?:      string;
  bio?:                 string;
  hospitalId?:          number;
  hospitalName?:        string;
  yearsOfExperience?:   number;
  govApprovalStatus?:   string;
}

export interface AppointmentDTO {
  id?:             number;
  slotId:          number;
  bookedByUserId?: string;
  isProxyBooking?: boolean;
  patientName?:    string;
  patientPhone?:   string;
  status?:         AppointmentStatus;
  doctorName?:     string;
  specialization?: string;
  hospitalName?:   string;
  startTime?:      string;
  endTime?:        string;
  checkedInAt?:    string;
  cancelledAt?:    string;
  createdAt?:      string;
  updatedAt?:      string;
}

export interface StatusUpdateRequest { status: string; }
