import {
  ArrowLeft,
  Boxes,
  ChevronDown,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Badge } from "../../../shared/ui/Badge";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "../../../shared/ui/Collapsible";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../shared/ui/AlertDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../shared/ui/Dialog";
import { Input } from "../../../shared/ui/Input";
import { PageLoading } from "../../../shared/ui/Loading";
import { Page } from "../../../shared/ui/Page";
import { Switch } from "../../../shared/ui/Switch";
import { toast } from "../../../shared/ui/Toast";
import { getApiErrorMessage } from "../../../shared/api/apiError";
import {
  getApplianceFieldCount,
  getApplianceGroupCount,
  type ApplianceField,
  type ApplianceFieldInput,
  type ApplianceFieldGroup,
} from "../domain/appliance";
import {
  useAppliance,
  useCreateApplianceField,
  useCreateApplianceGroup,
  useDeleteAppliance,
  useDeleteApplianceField,
  useDeleteApplianceGroup,
  useSetApplianceActive,
  useUpdateAppliance,
  useUpdateApplianceField,
  useUpdateApplianceGroup,
} from "../queries/appliance.queries";
import { ApplianceFieldFormCard } from "./ApplianceFieldFormCard";
import { FieldGroupDialog } from "./FieldGroupDialog";
import { FieldTypeBadge } from "./FieldTypeBadge";

type FieldFormState = { groupId: string; field?: ApplianceField };
type FieldDeleteState = { groupId: string; field: ApplianceField };

export function ApplianceDetailsPage() {
  const navigate = useNavigate();
  const { applianceId } = useParams();
  const applianceQuery = useAppliance(applianceId ?? "");
  const updateApplianceMutation = useUpdateAppliance();
  const deleteApplianceMutation = useDeleteAppliance();
  const setApplianceActiveMutation = useSetApplianceActive();
  const createGroupMutation = useCreateApplianceGroup();
  const updateGroupMutation = useUpdateApplianceGroup();
  const deleteGroupMutation = useDeleteApplianceGroup();
  const createFieldMutation = useCreateApplianceField();
  const updateFieldMutation = useUpdateApplianceField();
  const deleteFieldMutation = useDeleteApplianceField();
  const appliance = applianceQuery.data;
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<ApplianceFieldGroup>();
  const [fieldForm, setFieldForm] = useState<FieldFormState>();
  const [fieldToDelete, setFieldToDelete] = useState<FieldDeleteState>();
  const [isDeleteTypeOpen, setIsDeleteTypeOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [isRenaming, setIsRenaming] = useState(false);
  const [name, setName] = useState("");

  if (!appliance) {
    if (applianceQuery.isPending) {
      return (
        <Page size="full">
          <PageLoading label="Loading appliance type" />
        </Page>
      );
    }
    return (
      <Page size="full">
        <Card className="items-start gap-3">
          <p role="alert" className="font-medium text-text">
            {applianceQuery.isError
              ? `Could not load appliance type: ${getApiErrorMessage(applianceQuery.error, "Please try again.")}`
              : "Appliance type not found"}
          </p>
          <Button onClick={() => navigate("/appliances")}>
            <ArrowLeft /> Back to appliances
          </Button>
        </Card>
      </Page>
    );
  }

  const selectedAppliance = appliance;

  function showMutationError(title: string, error: unknown) {
    toast.add({
      title,
      description: getApiErrorMessage(error, "Please try again."),
      type: "error",
    });
  }

  async function handleSaveGroup(groupName: string) {
    if (groupToEdit) {
      await updateGroupMutation.mutateAsync({
        applianceTypeId: selectedAppliance.id,
        groupId: groupToEdit.id,
        input: { name: groupName },
      });
      setGroupToEdit(undefined);
      toast.add({ title: "Field group renamed", type: "success" });
      return;
    }

    const group = await createGroupMutation.mutateAsync({
      applianceTypeId: selectedAppliance.id,
      input: { name: groupName },
    });
    setOpenGroups((current) => ({ ...current, [group.id]: true }));
    toast.add({ title: "Field group added", type: "success" });
  }

  async function handleSaveField(groupId: string, field: ApplianceField) {
    const input: ApplianceFieldInput = {
      key: field.key,
      label: field.label,
      type: field.type,
      options: field.options,
      defaultValue: field.defaultValue,
      dependsOn: field.dependsOn,
      dependsOnValue: field.dependsOnValue,
      required: field.required,
      sortOrder: field.sortOrder,
      helpText: field.helpText,
    };
    const isEditing = Boolean(fieldForm?.field);
    if (fieldForm?.field) {
      await updateFieldMutation.mutateAsync({
        applianceTypeId: selectedAppliance.id,
        groupId,
        fieldId: fieldForm.field.id,
        input,
      });
    } else {
      await createFieldMutation.mutateAsync({
        applianceTypeId: selectedAppliance.id,
        groupId,
        input,
      });
    }
    setFieldForm(undefined);
    toast.add({
      title: isEditing ? "Field updated" : "Field added",
      description: `${field.label} is now part of the appliance.`,
      type: "success",
    });
  }

  async function handleConfirmDeleteField() {
    if (!fieldToDelete) return;
    try {
      await deleteFieldMutation.mutateAsync({
        applianceTypeId: selectedAppliance.id,
        groupId: fieldToDelete.groupId,
        fieldId: fieldToDelete.field.id,
      });
      toast.add({ title: "Field removed", description: fieldToDelete.field.label, type: "success" });
      setFieldToDelete(undefined);
    } catch (error) {
      showMutationError("Could not remove field", error);
    }
  }

  async function handleDeleteGroup(groupId: string) {
    const group = selectedAppliance.groups.find((item) => item.id === groupId);
    try {
      await deleteGroupMutation.mutateAsync({
        applianceTypeId: selectedAppliance.id,
        groupId,
      });
      setOpenGroups((current) => ({ ...current, [groupId]: false }));
      toast.add({ title: "Field group removed", description: group?.name, type: "success" });
    } catch (error) {
      showMutationError("Could not remove field group", error);
    }
  }

  async function handleRename(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = name.trim();
    if (!nextName) {
      toast.add({ title: "Name is required", type: "error" });
      return;
    }
    try {
      await updateApplianceMutation.mutateAsync({
        applianceTypeId: selectedAppliance.id,
        input: { name: nextName },
      });
      setIsRenaming(false);
      toast.add({ title: "Appliance renamed", type: "success" });
    } catch (error) {
      showMutationError("Could not rename appliance", error);
    }
  }

  async function handleToggleActive() {
    try {
      const updated = await setApplianceActiveMutation.mutateAsync({
        applianceTypeId: selectedAppliance.id,
        isActive: !selectedAppliance.isActive,
      });
      toast.add({
        title: `${updated.name} ${updated.isActive ? "activated" : "deactivated"}`,
        type: "success",
      });
    } catch (error) {
      showMutationError("Could not update appliance status", error);
    }
  }

  async function handleDeleteType() {
    try {
      await deleteApplianceMutation.mutateAsync(selectedAppliance.id);
      toast.add({
        title: "Appliance type deleted",
        description: selectedAppliance.name,
        type: "success",
      });
      navigate("/appliances");
    } catch (error) {
      showMutationError("Could not delete appliance type", error);
    }
  }

  return (
    <Page size="full" className="w-4xl max-w-5xl mx-auto">
      <Button
        variant="ghost"
        className="w-fit"
        onClick={() => navigate("/appliances")}
      >
        <ArrowLeft /> Appliances &amp; fields
      </Button>
      <Card className="gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="grid size-14 shrink-0 place-items-center rounded-md bg-surface-muted text-text-muted"
              aria-hidden="true"
            >
              <Boxes size={26} />
            </span>
            <div>
              {isRenaming ? (
                <form
                  className="flex items-center gap-2"
                  onSubmit={handleRename}
                >
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    aria-label="Appliance name"
                    autoFocus
                  />
                  <Button type="submit" size="sm">
                    {updateApplianceMutation.isPending ? "Saving…" : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="neutral"
                    size="sm"
                    onClick={() => setIsRenaming(false)}
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                <h1 className="text-lg font-semibold text-text">
                  {appliance.name}
                </h1>
              )}
              <p className="text-sm text-text-muted">
                {appliance.source} · visible to every lab
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={appliance.isActive}
              disabled={setApplianceActiveMutation.isPending}
              aria-label={`${appliance.isActive ? "Deactivate" : "Activate"} ${appliance.name}`}
              onCheckedChange={() => void handleToggleActive()}
            />
            {!isRenaming && (
              <>
                <Button
                  variant="neutral"
                  onClick={() => {
                    setName(appliance.name);
                    setIsRenaming(true);
                  }}
                >
                  Rename
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setIsDeleteTypeOpen(true)}
                >
                  Delete type
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="info">{getApplianceGroupCount(appliance)} field groups</Badge>
          <Badge tone="info">{getApplianceFieldCount(appliance)} fields</Badge>
          <Badge tone="info">
            {appliance.casesUsing === null
              ? "Case usage not tracked"
              : `${appliance.casesUsing} cases using this type`}
          </Badge>
        </div>
      </Card>

      {fieldForm && (
        <ApplianceFieldFormCard
          key={fieldForm.field?.id ?? `new-${fieldForm.groupId}`}
          appliance={appliance}
          initialGroupId={fieldForm.groupId}
          field={fieldForm.field}
          onSave={handleSaveField}
          onCancel={() => setFieldForm(undefined)}
          isPending={createFieldMutation.isPending || updateFieldMutation.isPending}
        />
      )}

      <Card className="gap-3">
        {appliance.groups.map((group) => {
          const isOpen = openGroups[group.id] ?? true;
          return (
            <Collapsible
              key={group.id}
              open={isOpen}
              onOpenChange={(open) =>
                setOpenGroups((current) => ({ ...current, [group.id]: open }))
              }
              className="overflow-hidden rounded-[calc(var(--radius-md)-2px)] border border-border"
            >
              <div className="flex flex-wrap items-center gap-2 bg-surface-soft px-2 py-1">
                <CollapsibleTrigger className="group flex min-w-0 flex-1 items-center gap-2 rounded-sm px-1 py-1 text-left">
                  <ChevronDown
                    className={`shrink-0 text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                    size={16}
                  />
                  <span className="truncate font-semibold text-text">
                    {group.name}
                  </span>
                  <span className="text-xs text-text-muted">
                    {group.fields.length}{" "}
                    {group.fields.length === 1 ? "field" : "fields"}
                  </span>
                </CollapsibleTrigger>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setFieldForm({ groupId: group.id })}
                  >
                    <Plus /> Add field
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Rename ${group.name}`}
                    onClick={() => {
                      setGroupToEdit(group)
                      setIsGroupDialogOpen(true)
                    }}
                  >
                    <Pencil /> Rename
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    disabled={deleteGroupMutation.isPending}
                    onClick={() => void handleDeleteGroup(group.id)}
                  >
                    <Trash2 /> Delete
                  </Button>
                </div>
              </div>
              <CollapsiblePanel>
                {group.fields.length > 0 ? (
                  group.fields.map((field) => (
                    <div
                      key={field.id}
                      role="button"
                      tabIndex={0}
                      className="group/field flex cursor-pointer flex-wrap items-center justify-between gap-3 border-t border-border px-2 py-2 transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none"
                      onClick={() => setFieldForm({ groupId: group.id, field })}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setFieldForm({ groupId: group.id, field });
                        }
                      }}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <FieldTypeBadge type={field.type} />
                        <div className="min-w-0">
                          <p className="font-medium text-text">
                            {field.label}{" "}
                            {field.required && (
                              <span className="text-destructive">*</span>
                            )}
                          </p>
                          <p className="font-mono text-2xs text-text-muted">
                            {field.key}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right text-xs text-text-muted">
                          <p>Default: {field.defaultValue || "—"}</p>
                        {field.options.length > 0 && (
                            <p className="mt-1">
                              {field.options.length} options
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-70 transition-opacity group-hover/field:opacity-100 group-focus-within/field:opacity-100">
                          <Button
                            size="icon-md"
                            variant="ghost"
                            aria-label={`Edit ${field.label}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              setFieldForm({ groupId: group.id, field });
                            }}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            size="icon-md"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            aria-label={`Delete ${field.label}`}
                            disabled={deleteFieldMutation.isPending}
                            onClick={(event) => {
                              event.stopPropagation();
                              setFieldToDelete({ groupId: group.id, field });
                            }}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="px-4 py-3 text-sm text-text-muted">
                    No fields yet. Add the first field to this group.
                  </p>
                )}
              </CollapsiblePanel>
            </Collapsible>
          );
        })}
        {appliance.groups.length === 0 && (
          <p className="py-8 text-center text-sm text-text-muted">
            Start by creating a field group.
          </p>
        )}
        <Button
          variant="neutral"
          className="w-fit"
          onClick={() => setIsGroupDialogOpen(true)}
        >
          <Plus /> Add field group
        </Button>
      </Card>

      <FieldGroupDialog
        key={groupToEdit?.id ?? "new-group"}
        open={isGroupDialogOpen}
        onOpenChange={(open) => {
          setIsGroupDialogOpen(open)
          if (!open) setGroupToEdit(undefined)
        }}
        onCreate={handleSaveGroup}
        initialName={groupToEdit?.name}
        title={groupToEdit ? 'Rename field group' : 'Add field group'}
        submitLabel={groupToEdit ? 'Save name' : 'Add group'}
        isPending={createGroupMutation.isPending || updateGroupMutation.isPending}
        isNameAvailable={(groupName) =>
          !appliance.groups.some(
            (group) =>
              group.id !== groupToEdit?.id &&
              group.name.toLowerCase() === groupName.trim().toLowerCase(),
          )
        }
      />
      <AlertDialog
        open={isDeleteTypeOpen}
        onOpenChange={(open) => {
          if (!deleteApplianceMutation.isPending) setIsDeleteTypeOpen(open);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete appliance type?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes {appliance.name}, its field groups, and its fields.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteApplianceMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deleteApplianceMutation.isPending}
              onClick={() => void handleDeleteType()}
            >
              {deleteApplianceMutation.isPending ? "Deleting…" : "Delete type"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog
        open={Boolean(fieldToDelete)}
        onOpenChange={(open) => !open && setFieldToDelete(undefined)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete field?</DialogTitle>
            <DialogDescription>
              {fieldToDelete
                ? `This will permanently remove “${fieldToDelete.field.label}” from this appliance type.`
                : "This field will be removed from the appliance type."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="neutral"
              disabled={deleteFieldMutation.isPending}
              onClick={() => setFieldToDelete(undefined)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteFieldMutation.isPending}
              onClick={() => void handleConfirmDeleteField()}
            >
              {deleteFieldMutation.isPending ? "Deleting…" : "Delete field"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  );
}
