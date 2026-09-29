export interface ClinicDoctorInput {
  id: string;
  fullName: string;
  email: string | null;
  specialty: string | null;
  isActive: boolean;
}

export interface Clinic {
  id: string;
  name: string;
  legalName: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  doctors: ClinicDoctorInput[];
}

export interface ClinicInput {
  name: string;
  legalName?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  notes?: string | null;
  isActive?: boolean;
  doctorIds?: string[];
}

export interface ClinicListInput {
  search?: string | undefined;
  isActive?: boolean | undefined;
  limit: number;
  cursor?: string | undefined;
}

export interface ClinicListResult {
  data: Clinic[];
  nextCursor: string | null;
  total: number;
}

export interface ClinicsServiceContract {
  list(input: ClinicListInput): Promise<ClinicListResult>;
  getById(id: string): Promise<Clinic>;
  create(input: ClinicInput): Promise<Clinic>;
  update(id: string, input: Partial<ClinicInput>): Promise<Clinic>;
  deactivate(id: string): Promise<void>;
}
