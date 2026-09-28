import { Plus, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader, PageHeaderActions } from "../../../shared/ui/PageHeader";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { Page } from "../../../shared/ui/Page";
import { toast } from "../../../shared/ui/Toast";
import { roleFixtures } from "../data/roles";
import { getVisibleRoles } from "../domain/role";
import type { Role } from "../domain/role";
import { RoleFormDialog, type RoleFormValues } from "./RoleFormDialog";
import { RolePermissionsEditor } from "./RolePermissionsEditor";

export function RolesPermissionsPage() {
  const [roles, setRoles] = useState<Role[]>(roleFixtures);
  const [selectedRoleId, setSelectedRoleId] = useState("administrator");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role>();
  const visibleRoles = useMemo(() => getVisibleRoles(roles), [roles]);
  const selectedRole =
    visibleRoles.find((role) => role.id === selectedRoleId) ?? visibleRoles[0];

  function handleCreateRole(values: RoleFormValues) {
    const role: Role = {
      id: `${values.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      name: values.name,
      description: values.description,
      type: 'custom',
      permissions: [],
      staffCount: 0,
    };
    setRoles((currentRoles) => [...currentRoles, role]);
    setSelectedRoleId(role.id);
    setIsFormOpen(false);
    toast.add({
      title: "Role created",
      description: `${role.name} starts with no permissions selected.`,
      type: "success",
    });
  }

  function handleUpdateRole(values: RoleFormValues) {
    if (!editingRole) return;

    setRoles((currentRoles) =>
      currentRoles.map((role) =>
        role.id === editingRole.id ? { ...role, ...values } : role,
      ),
    );
    setEditingRole(undefined);
    toast.add({ title: "Role updated", type: "success" });
  }

  function handlePermissionToggle(
    permissionId: Role["permissions"][number],
    checked: boolean,
  ) {
    if (!selectedRole) return;

    setRoles((currentRoles) =>
      currentRoles.map((role) => {
        if (role.id !== selectedRole.id || role.type === 'owner') return role;
        const permissions = checked
          ? [...new Set([...role.permissions, permissionId])]
          : role.permissions.filter(
              (permission) => permission !== permissionId,
            );
        return { ...role, permissions };
      }),
    );
  }

  function handleDeleteRole(roleId: string) {
    const role = roles.find((item) => item.id === roleId)
    if (!role || role.type !== 'custom' || role.staffCount > 0) return

    setRoles((currentRoles) => currentRoles.filter((item) => item.id !== roleId))
    setSelectedRoleId((currentId) => currentId === roleId ? '' : currentId)
    toast.add({ title: 'Role deleted', description: `${role.name} was removed.`, type: 'success' })
  }

  function handleSaveRole() {
    if (!selectedRole) return

    toast.add({
      title: "Role saved",
      description: `${selectedRole.name} permissions are up to date.`,
      type: "success",
    })
  }

  return (
    <Page size="full" className="min-h-0 flex-1 lg:overflow-hidden">
      <PageHeader
        title="Roles & permissions"
        description="Control what each role can see and do across the lab workspace."
      >
        <PageHeaderActions>
          <Button
            onClick={() => {
              setEditingRole(undefined);
              setIsFormOpen(true);
            }}
          >
            <Plus /> Add role
          </Button>
        </PageHeaderActions>
      </PageHeader>

      <div className="grid gap-3 lg:min-h-0 lg:flex-1 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <RoleList
          roles={visibleRoles}
          selectedRoleId={selectedRole?.id}
          onSelect={setSelectedRoleId}
        />
        {selectedRole ? (
          <RolePermissionsEditor
            role={selectedRole}
            onDelete={handleDeleteRole}
            onEdit={() => setEditingRole(selectedRole)}
            onSave={handleSaveRole}
            onPermissionToggle={handlePermissionToggle}
          />
        ) : (
          <Card className="items-center justify-center gap-2 py-12 text-center">
            <ShieldCheck className="text-primary" />
            <p className="font-medium text-text">No editable roles yet</p>
            <p className="text-sm text-text-muted">
              Create a role to start selecting permissions.
            </p>
          </Card>
        )}
      </div>

      <RoleFormDialog
        key={editingRole?.id ?? "new-role-form"}
        mode={editingRole ? "edit" : "create"}
        open={isFormOpen || editingRole !== undefined}
        role={editingRole}
        onOpenChange={(open) => {
          if (!open) {
            setIsFormOpen(false);
            setEditingRole(undefined);
          }
        }}
        onSubmit={editingRole ? handleUpdateRole : handleCreateRole}
      />
    </Page>
  );
}

function RoleList({
  roles,
  selectedRoleId,
  onSelect,
}: {
  roles: Role[];
  selectedRoleId?: string;
  onSelect: (roleId: string) => void;
}) {
  return (
    <Card className="h-fit lg:sticky lg:top-0">
      <div>
        <h2 className="text-base font-semibold uppercase text-primary">
          Roles
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Choose a role to review its access across the lab workspace.
        </p>
      </div>
      <div className="grid gap-1">
        {roles.map((role) => (
          <button
            key={role.id}
            type="button"
            className={`grid gap-1 rounded-sm px-2 py-2 text-left transition-colors ${selectedRoleId === role.id ? "bg-neutral-100" : "hover:bg-neutral-100"}`}
            onClick={() => onSelect(role.id)}
            aria-pressed={selectedRoleId === role.id}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-semibold text-text">{role.name}</span>
              </span>
            <span className="line-clamp-2 text-xs text-text-muted">
              {role.description}
            </span>
            <span className="text-2xs uppercase tracking-wide text-secondary">
              {role.staffCount} staff
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}
