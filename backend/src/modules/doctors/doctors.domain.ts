export type DoctorSource = 'clinic' | 'portal';

export interface DoctorClinic {
  id: string;
  name: string;
}

export interface Doctor {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  country: string | null;
  specialty: string | null;
  notes: string | null;
  source: DoctorSource;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  clinics: DoctorClinic[];
}

export interface DoctorInput {
  fullName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  country?: string | null;
  specialty?: string | null;
  notes?: string | null;
  source?: DoctorSource;
  isActive?: boolean;
  clinicIds?: string[];
}

export type DoctorUpdateInput = Partial<DoctorInput>;

export interface DoctorListInput {
  search?: string | undefined;
  isActive?: boolean | undefined;
  clinicId?: string | undefined;
  limit: number;
  cursor?: string | undefined;
}

export interface DoctorListResult {
  data: Doctor[];
  nextCursor: string | null;
  total: number;
}

export interface DoctorsServiceContract {
  list(input: DoctorListInput): Promise<DoctorListResult>;
  getById(id: string): Promise<Doctor>;
  create(input: DoctorInput): Promise<Doctor>;
  update(id: string, input: DoctorUpdateInput): Promise<Doctor>;
  delete(id: string): Promise<void>;
}
