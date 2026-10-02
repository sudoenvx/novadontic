import { Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { getApiErrorMessage } from "../../../shared/api/apiError";
import { PageHeader, PageHeaderActions } from "../../../shared/ui/PageHeader";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { Page } from "../../../shared/ui/Page";
import { toast } from "../../../shared/ui/Toast";
import { groupRolePermissions, getVisibleRoles } from "../domain/role";
import type { Role } from "../domain/role";
import {
  useCreateRole,
  useDeleteRole,
  useRolePermissions,
  useRoles,
  useSetRolePermissions,
  useUpdateRole,
} from "../queries/role.queries";
import { RoleFormDialog, type RoleFormValues } from "./RoleFormDialog";
import { RolePermissionsEditor } from "./RolePermissionsEditor";

export function RolesPermissionsPage() {
  const rolesQuery = useRoles();
  const permissionsQuery = useRolePermissions();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const permissionsMutation = useSetRolePermissions();
  const deleteMutation = useDeleteRole();
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [permissionDrafts, setPermissionDrafts] = useState<
    Record<string, string[]>
  >({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role>();
  const roles = rolesQuery.data ?? [];
  const visibleRoles = getVisibleRoles(roles);
  const selectedRole =
    visibleRoles.find((role) => role.id === selectedRoleId) ?? visibleRoles[0];
  const selectedPermissions = selectedRole
    ? permissionDrafts[selectedRole.id] ?? selectedRole.permissions
    : [];
  const permissionGroups = groupRolePermissions(permissionsQuery.data ?? []);
  const hasPermissionChanges =
    Boolean(selectedRole) &&
    (selectedRole?.permissions.length !== selectedPermissions.length ||
      selectedRole?.permissions.some(
        (permission) => !selectedPermissions.includes(permission),
      ));
  const isFormSubmitting =
    createMutation.isPending || updateMutation.isPending;

  async function handleSubmitRole(values: RoleFormValues) {
    if (editingRole) {
      const role = await updateMutation.mutateAsync({
        roleId: editingRole.id,
        input: values,
      });
      setEditingRole(undefined);
      toast.add({
        title: "Role updated",
        description: `${role.name} was updated.`,
        type: "success",
      });
      return;
    }

    const role = await createMutation.mutateAsync(values);
    setSelectedRoleId(role.id);
    setIsFormOpen(false);
    toast.add({
      title: "Role created",
      description: `${role.name} starts with no permissions selected.`,
      type: "success",
    });
  }

  function handlePermissionToggle(permission: string, checked: boolean) {
    if (!selectedRole || selectedRole.type === "owner") return;

    setPermissionDrafts((drafts) => {
      const current = drafts[selectedRole.id] ?? selectedRole.permissions;
      const permissions = checked
        ? [...new Set([...current, permission])]
        : current.filter((item) => item !== permission);
      return { ...drafts, [selectedRole.id]: permissions };
    });
  }

  async function handleDeleteRole(roleId: string): Promise<boolean> {
    const role = roles.find((item) => item.id === roleId);
    if (!role || role.type !== "custom" || role.staffCount > 0) return false;

    try {
      await deleteMutation.mutateAsync(roleId);
      setPermissionDrafts((drafts) => {
        const remainingDrafts = { ...drafts };
        delete remainingDrafts[roleId];
        return remainingDrafts;
      });
      setSelectedRoleId((currentId) => currentId === roleId ? "" : currentId);
      toast.add({
        title: "Role deleted",
        description: `${role.name} was removed.`,
        type: "success",
      });
      return true;
    } catch (error) {
      toast.add({
        title: "Unable to delete role",
        description: getApiErrorMessage(error, "Please try again."),
        type: "error",
      });
      return false;
    }
  }

  async function handleSaveRole() {
    if (!selectedRole || !hasPermissionChanges) return;

    try {
      await permissionsMutation.mutateAsync({
        roleId: selectedRole.id,
        permissionCodes: selectedPermissions,
      });
      setPermissionDrafts((drafts) => {
        const remainingDrafts = { ...drafts };
        delete remainingDrafts[selectedRole.id];
        return remainingDrafts;
      });
      toast.add({
        title: "Role saved",
        description: `${selectedRole.name} permissions are up to date.`,
        type: "success",
      });
    } catch (error) {
      toast.add({
        title: "Unable to save permissions",
        description: getApiErrorMessage(error, "Please try again."),
        type: "error",
      });
    }
  }

  return (
    <Page size="full">
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

      {rolesQuery.isPending ? (
        <Card role="status">Loading roles...</Card>
      ) : rolesQuery.isError ? (
        <Card role="alert" className="gap-3">
          <p>{getApiErrorMessage(rolesQuery.error, "Unable to load roles.")}</p>
          <Button variant="outline" onClick={() => rolesQuery.refetch()}>
            Retry
          </Button>
        </Card>
      ) : (
        <div className="grid min-w-0 gap-3 xl:grid-cols-[18rem_minmax(0,1fr)]">
          <RoleList
            roles={visibleRoles}
            selectedRoleId={selectedRole?.id}
            onSelect={setSelectedRoleId}
          />
          {permissionsQuery.isPending ? (
            <Card role="status">Loading permission catalog...</Card>
          ) : permissionsQuery.isError ? (
            <Card role="alert" className="gap-3">
              <p>
                {getApiErrorMessage(
                  permissionsQuery.error,
                  "Unable to load permissions.",
                )}
              </p>
              <Button
                variant="outline"
                onClick={() => permissionsQuery.refetch()}
              >
                Retry
              </Button>
            </Card>
          ) : selectedRole ? (
            <RolePermissionsEditor
              role={{ ...selectedRole, permissions: selectedPermissions }}
              permissionGroups={permissionGroups}
              onDelete={handleDeleteRole}
              onEdit={() => setEditingRole(selectedRole)}
              onSave={handleSaveRole}
              onPermissionToggle={handlePermissionToggle}
              isSaving={permissionsMutation.isPending}
              isDeleting={deleteMutation.isPending}
              hasPermissionChanges={hasPermissionChanges}
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
      )}

      <RoleFormDialog
        key={editingRole?.id ?? "new-role-form"}
        mode={editingRole ? "edit" : "create"}
        open={isFormOpen || editingRole !== undefined}
        role={editingRole}
        isSubmitting={isFormSubmitting}
        onOpenChange={(open) => {
          if (!open) {
            setIsFormOpen(false);
            setEditingRole(undefined);
          }
        }}
        onSubmit={handleSubmitRole}
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
    <Card className="h-fit xl:sticky xl:top-[calc(var(--navbar-height)+var(--page-gap))]">
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
            className={`grid gap-1 rounded-sm px-2 py-2 text-left transition-colors ${selectedRoleId === role.id ? "bg-primary-soft" : "hover:bg-neutral-50"}`}
            onClick={() => onSelect(role.id)}
            aria-pressed={selectedRoleId === role.id}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="font-semibold text-text">{role.name}</span>
            </span>
            <span className="line-clamp-2 text-xs text-text-muted">
              {role.description}
            </span>
            <span className="text-2xs uppercase tracking-wide text-text-secondary">
              {role.staffCount} staff
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}
