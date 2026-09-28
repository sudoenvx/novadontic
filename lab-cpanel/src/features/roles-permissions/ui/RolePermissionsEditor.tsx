import { useState } from "react";
import { Pencil, Save, Trash2 } from "lucide-react";

import { Button } from "../../../shared/ui/Button";
import { Badge } from "../../../shared/ui/Badge";
import { Card, CardHeader, CardTitle } from "../../../shared/ui/Card";
import { Checkbox } from "../../../shared/ui/Checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../shared/ui/Dialog";
import type { Permission, Role } from "../domain/role";
import { permissionGroups } from "../domain/role";

type RolePermissionsEditorProps = {
  role: Role;
  onDelete: (roleId: string) => void;
  onEdit: () => void;
  onSave: () => void;
  onPermissionToggle: (permission: Permission, checked: boolean) => void;
};

export function RolePermissionsEditor({
  onDelete,
  onEdit,
  onSave,
  onPermissionToggle,
  role,
}: RolePermissionsEditorProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const selectedCount = role.permissions.length;
  const totalCount = permissionGroups.reduce(
    (count, group) => count + group.permissions.length,
    0,
  );

  return (
    <Card className="overflow-x-hidden lg:min-h-0">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="normal-case  gap-2 flex-center">
              {role.name}
              {
            role.type === "system" && (
              <Badge tone={"info"} className="uppercase">
                System
              </Badge>
            )
          }
            </CardTitle>
          </div>
          <p className="mt-1 text-sm text-text-muted">{role.description}</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          
          <Button variant="neutral" onClick={onEdit}>
            <Pencil /> Edit role
          </Button>

          <Button onClick={onSave}>
            <Save />
            Save
          </Button>
          {role.type === "custom" && role.staffCount === 0 && (
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 /> Delete role
            </Button>
          )}
        </div>
      </CardHeader>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-sm bg-accent px-2 py-1.5 text-accent-foreground">
        <p className="text-sm">
          <strong>{selectedCount}</strong> of <strong>{totalCount}</strong>{" "}
          permissions selected
        </p>
      </div>
      <div className="grid gap-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
        {permissionGroups.map((group) => (
          <section key={group.subject} className="grid gap-1.5">
            <div className="flex items-center justify-between gap-2 border-b border-border-soft pb-1">
              <h3 className="text-sm font-semibold text-text">{group.label}</h3>
            </div>
            <div className="grid gap-1 sm:grid-cols-2">
              {group.permissions.map((permission) => (
                <label
                  key={permission.id}
                  className="flex items-start gap-2 rounded-sm px-1.5 py-1.5 hover:bg-neutral-100"
                >
                  <Checkbox
                    checked={role.permissions.includes(permission.id)}
                    onCheckedChange={(checked) =>
                      onPermissionToggle(permission.id, checked)
                    }
                    aria-label={permission.label}
                    disabled={role.type === "owner"}
                  />
                  <span className="grid gap-0.5">
                    <span className="text-sm font-medium text-text">
                      {permission.label}
                    </span>
                    <span className="font-mono text-2xs text-secondary">
                      {permission.id}
                    </span>
                    <span className="text-xs text-text-muted">
                      {permission.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete role?</DialogTitle>
            <DialogDescription>
              This role has no staff assigned. Deleting it cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="neutral"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(role.id);
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
