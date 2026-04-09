import { HospitalInfoDTO } from './hospitalInfoDTO';

export interface PublicDoctorDTO {
    userId?: string;
    name?: string;
    medicalLicenseNumber?: string;
    specialization?: string;
    bio?: string;
    govApprovalStatus?: string;
    hospitals?: HospitalInfoDTO[];
    yearsOfExperience?: number;
}
