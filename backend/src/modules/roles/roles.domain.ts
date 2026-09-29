export interface Permission {
  code: string;
  module: string;
  description: string | null;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'owner' | 'system' | 'custom';
  isSystem: boolean;
  staffCount: number;
  permissions: string[];
}

export interface RoleInput {
  name: string;
  description: string;
}

export interface RoleUpdateInput {
  name?: string;
  description?: string;
}

export interface RoleListInput {
  search?: string | undefined;
}

export interface RolesServiceContract {
  listPermissions(module?: string): Promise<Permission[]>;
  list(input: RoleListInput): Promise<Role[]>;
  getById(id: string): Promise<Role>;
  create(input: RoleInput): Promise<Role>;
  update(id: string, input: RoleUpdateInput): Promise<Role>;
  setPermissions(id: string, permissionCodes: string[]): Promise<Role>;
  delete(id: string): Promise<void>;
}
