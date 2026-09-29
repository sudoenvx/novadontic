export interface StaffRole {
  id: string;
  code: string;
  name: string;
}

export interface StaffMember {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  roles: StaffRole[];
}

export interface CreateStaffInput {
  fullName: string;
  email: string;
  password: string;
  phone?: string | null;
  roleIds: string[];
}

export interface UpdateStaffInput {
  fullName?: string;
  email?: string;
  phone?: string | null;
  roleIds?: string[];
}

export interface StaffListInput {
  search?: string | undefined;
  isActive?: boolean | undefined;
  limit: number;
  cursor?: string | undefined;
}

export interface StaffListResult {
  data: StaffMember[];
  nextCursor: string | null;
  total: number;
}

export interface StaffServiceContract {
  list(input: StaffListInput): Promise<StaffListResult>;
  getById(id: string): Promise<StaffMember>;
  create(input: CreateStaffInput): Promise<StaffMember>;
  update(id: string, input: UpdateStaffInput): Promise<StaffMember>;
  setActive(id: string, isActive: boolean, actorId: string): Promise<StaffMember>;
  delete(id: string, actorId: string): Promise<void>;
}
