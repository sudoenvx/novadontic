import { useState, type FormEvent } from "react";

import { getApiErrorMessage } from "../../../shared/api/apiError";
import { Button } from "../../../shared/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../shared/ui/Dialog";
import { Input } from "../../../shared/ui/Input";
import { Label } from "../../../shared/ui/Label";
import type { Role } from "../domain/role";

export type RoleFormValues = {
  name: string;
  description: string;
};

type RoleFormDialogProps = {
  mode: "create" | "edit";
  open: boolean;
  role?: Role;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: RoleFormValues) => Promise<void>;
  isSubmitting: boolean;
};

export function RoleFormDialog({
  mode,
  onOpenChange,
  onSubmit,
  open,
  role,
  isSubmitting,
}: RoleFormDialogProps) {
  const [values, setValues] = useState<RoleFormValues>(() =>
    getInitialValues(role),
  );
  const [error, setError] = useState("");
  const isEditing = mode === "edit";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = {
      name: values.name.trim(),
      description: values.description.trim(),
    };
    if (!normalized.name || !normalized.description) {
      setError("Enter a role name and description.");
      return;
    }
    setError("");
    try {
      await onSubmit(normalized);
      onOpenChange(false);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "Unable to save this role."));
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isSubmitting) onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit role" : "Add role"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the role name and description. Permissions are managed on the role page."
                : "Create a role, then select the permissions it should have."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Field htmlFor="role-name" label="Role name">
              <Input
                id="role-name"
                value={values.name}
                disabled={isSubmitting}
                onChange={(event) => {
                  const name = event.currentTarget.value;
                  setValues((current) => ({
                    ...current,
                    name,
                  }));
                  setError("");
                }}
                placeholder="e.g. Production lead"
                autoFocus
              />
            </Field>
            <Field htmlFor="role-description" label="Description">
              <Input
                id="role-description"
                value={values.description}
                disabled={isSubmitting}
                onChange={(event) => {
                  const description = event.currentTarget.value;
                  setValues((current) => ({
                    ...current,
                    description,
                  }));
                  setError("");
                }}
                placeholder="What can this role do?"
              />
            </Field>
          </div>
          {error && (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="neutral"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Create role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getInitialValues(role?: Role): RoleFormValues {
  return { name: role?.name ?? "", description: role?.description ?? "" };
}

function Field({
  children,
  htmlFor,
  label,
}: {
  children: React.ReactNode;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
