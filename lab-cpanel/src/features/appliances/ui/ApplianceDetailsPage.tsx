import { Collapsible } from "@base-ui/react/collapsible";
import {
  ArrowLeft,
  Boxes,
  ChevronDown,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { Badge } from "../../../shared/ui/Badge";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../shared/ui/Dialog";
import { Input } from "../../../shared/ui/Input";
import { Page } from "../../../shared/ui/Page";
import { Switch } from "../../../shared/ui/Switch";
import { toast } from "../../../shared/ui/Toast";
import { appliances } from "../data/appliances";
import {
  getApplianceFieldCount,
  getApplianceGroupCount,
  isApplianceNameAvailable,
  type Appliance,
  type ApplianceField,
  type ApplianceFieldGroup,
} from "../domain/appliance";
import { ApplianceFieldFormCard } from "./ApplianceFieldFormCard";
import { FieldGroupDialog } from "./FieldGroupDialog";
import { FieldTypeBadge } from "./FieldTypeBadge";

type ApplianceLocationState = { appliance?: Appliance };
type FieldFormState = { groupId: string; field?: ApplianceField };
type FieldDeleteState = { groupId: string; field: ApplianceField };

function createId(prefix: string) {
  return `${prefix}-${Date.now()}`;
}

export function ApplianceDetailsPage() {
  const navigate = useNavigate();
  const { applianceId } = useParams();
  const location = useLocation();
  const locationState = location.state as ApplianceLocationState | null;
  const initialAppliance =
    locationState?.appliance ??
    appliances.find((item) => item.id === applianceId);
  const [appliance, setAppliance] = useState<Appliance | undefined>(
    initialAppliance,
  );
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<ApplianceFieldGroup>();
  const [fieldForm, setFieldForm] = useState<FieldFormState>();
  const [fieldToDelete, setFieldToDelete] = useState<FieldDeleteState>();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      (initialAppliance?.groups ?? []).map((group) => [group.id, true]),
    ),
  );
  const [isRenaming, setIsRenaming] = useState(false);
  const [name, setName] = useState(initialAppliance?.name ?? "");

  if (!appliance) {
    return (
      <Page size="full">
        <Card className="items-start gap-3">
          <p className="font-medium text-text">Appliance type not found</p>
          <Button onClick={() => navigate("/appliances")}>
            <ArrowLeft /> Back to appliances
          </Button>
        </Card>
      </Page>
    );
  }

  const selectedAppliance = appliance;

  function updateAppliance(update: (current: Appliance) => Appliance) {
    setAppliance((current) => (current ? update(current) : current));
  }

  function handleAddGroup(groupName: string) {
    const groupId = createId("group");
    updateAppliance((current) => ({
      ...current,
      groups: [...current.groups, { id: groupId, name: groupName, fields: [] }],
    }));
    setOpenGroups((current) => ({ ...current, [groupId]: true }));
    toast.add({ title: "Field group added", type: "success" });
  }

  function handleSaveGroup(groupName: string) {
    if (groupToEdit) {
      updateAppliance((current) => ({
        ...current,
        groups: current.groups.map((group) => group.id === groupToEdit.id ? { ...group, name: groupName } : group),
      }))
      setGroupToEdit(undefined)
      toast.add({ title: 'Field group renamed', type: 'success' })
      return
    }

    handleAddGroup(groupName)
  }

  function handleSaveField(groupId: string, field: ApplianceField) {
    const isEditing = Boolean(fieldForm?.field);
    updateAppliance((current) => ({
      ...current,
      groups: current.groups.map((group) => {
        const fields = isEditing
          ? group.fields.filter((item) => item.id !== field.id)
          : group.fields;
        return group.id === groupId
          ? { ...group, fields: [...fields, field] }
          : { ...group, fields };
      }),
    }));
    setFieldForm(undefined);
    toast.add({
      title: isEditing ? "Field updated" : "Field added",
      description: `${field.label} is now part of the appliance.`,
      type: "success",
    });
  }

  function handleConfirmDeleteField() {
    if (!fieldToDelete) return;
    const { groupId, field } = fieldToDelete;
    updateAppliance((current) => ({
      ...current,
      groups: current.groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              fields: group.fields.filter((item) => item.id !== field.id),
            }
          : group,
      ),
    }));
    setFieldToDelete(undefined);
    toast.add({
      title: "Field removed",
      description: field.label,
      type: "success",
    });
  }

  function handleDeleteGroup(groupId: string) {
    const group = selectedAppliance.groups.find((item) => item.id === groupId);
    updateAppliance((current) => ({
      ...current,
      groups: current.groups.filter((item) => item.id !== groupId),
    }));
    setOpenGroups((current) => ({ ...current, [groupId]: false }));
    toast.add({
      title: "Field group removed",
      description: group?.name,
      type: "success",
    });
  }

  function handleRename(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = name.trim();
    if (
      !nextName ||
      !isApplianceNameAvailable(appliances, nextName, selectedAppliance.id)
    ) {
      toast.add({
        title: "Name is not available",
        description: "Choose a unique appliance name.",
        type: "error",
      });
      return;
    }
    updateAppliance((current) => ({ ...current, name: nextName }));
    setIsRenaming(false);
    toast.add({ title: "Appliance renamed", type: "success" });
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
              className="grid size-14 shrink-0 place-items-center rounded-md bg-neutral-100 text-text-muted"
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
                    Save
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
              aria-label={`${appliance.isActive ? "Deactivate" : "Activate"} ${appliance.name}`}
              onCheckedChange={() =>
                updateAppliance((current) => ({
                  ...current,
                  isActive: !current.isActive,
                }))
              }
            />
            {!isRenaming && (
              <Button variant="neutral" onClick={() => setIsRenaming(true)}>
                Rename
              </Button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{getApplianceGroupCount(appliance)} field groups</Badge>
          <Badge>{getApplianceFieldCount(appliance)} fields</Badge>
          <Badge>{appliance.casesUsing} cases using this type</Badge>
        </div>
      </Card>

      {fieldForm && (
        <ApplianceFieldFormCard
          appliance={appliance}
          initialGroupId={fieldForm.groupId}
          field={fieldForm.field}
          onSave={handleSaveField}
          onCancel={() => setFieldForm(undefined)}
        />
      )}

      <Card className="gap-3">
        {appliance.groups.map((group) => {
          const isOpen = openGroups[group.id] ?? true;
          return (
            <Collapsible.Root
              key={group.id}
              open={isOpen}
              onOpenChange={(open) =>
                setOpenGroups((current) => ({ ...current, [group.id]: open }))
              }
              className="overflow-hidden rounded-[calc(var(--radius-md)-2px)] border border-border"
            >
              <div className="flex flex-wrap items-center gap-2 bg-neutral-50 px-2 py-1">
                <Collapsible.Trigger className="group flex min-w-0 flex-1 items-center gap-2 rounded-sm px-1 py-1 text-left  focus-visible:outline-2 focus-visible:outline-primary">
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
                </Collapsible.Trigger>
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
                    onClick={() => handleDeleteGroup(group.id)}
                  >
                    <Trash2 /> Delete
                  </Button>
                </div>
              </div>
              <Collapsible.Panel className="overflow-hidden transition-[height] duration-150 data-ending-style:h-0 data-starting-style:h-0">
                {group.fields.length > 0 ? (
                  group.fields.map((field) => (
                    <div
                      key={field.id}
                      role="button"
                      tabIndex={0}
                      className="group/field flex cursor-pointer flex-wrap items-center justify-between gap-3 border-t border-border px-2 py-2 transition-colors hover:bg-neutral-50 focus-visible:bg-neutral-50 focus-visible:outline-none"
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
                  <p className="px-4 py-6 text-sm text-text-muted">
                    No fields yet. Add the first field to this group.
                  </p>
                )}
              </Collapsible.Panel>
            </Collapsible.Root>
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
        isNameAvailable={(groupName) =>
          !appliance.groups.some(
            (group) =>
              group.id !== groupToEdit?.id &&
              group.name.toLowerCase() === groupName.trim().toLowerCase(),
          )
        }
      />
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
              onClick={() => setFieldToDelete(undefined)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDeleteField}
            >
              Delete field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  );
}
