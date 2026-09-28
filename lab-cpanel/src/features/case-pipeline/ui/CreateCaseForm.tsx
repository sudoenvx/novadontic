import { useMemo, useState, type FormEvent, type ReactNode } from "react";

import { Badge } from "../../../shared/ui/Badge";
import { Button } from "../../../shared/ui/Button";
import { Card, CardHeader, CardTitle } from "../../../shared/ui/Card";
import { Input } from "../../../shared/ui/Input";
import { Label } from "../../../shared/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared/ui/Select";
import { Textarea } from "../../../shared/ui/Textarea";
import { clinicFixtures } from "../../clinics/data/clinics";
import { doctorFixtures } from "../../doctors/data/doctors";
import { appliances } from "../../appliances/data/appliances";
import {
  getCaseCategoriesForAppliance,
  getCaseBillingRuleLabel,
  type CaseBillingRule,
} from "../domain/caseCategory";
import type {
  CasePipelineCase,
  CasePipelinePriority,
} from "../domain/casePipeline";
import { caseCategoryFixtures } from "../data/caseCategories";
import { workflowTemplateFixtures } from "../../appliance-workflow-templates/data/workflowTemplates";
import { OriginalCaseSelect } from "./OriginalCaseSelect";

export type CreateCaseValues = {
  patientName: string;
  patientCode: string;
  clinicId: string;
  doctorId: string;
  applianceId: string;
  categoryId: string;
  workflowTemplateId: string;
  turnaroundDays?: number;
  priority: CasePipelinePriority;
  priceRule: CaseBillingRule;
  billable: boolean;
  originalCaseId?: string;
  remakeReason?: string;
};

type CreateCaseFormProps = {
  cases: CasePipelineCase[];
  defaultTurnaroundDays: number;
  onCancel: () => void;
  onSubmit: (values: CreateCaseValues) => void;
};

const activeAppliances = appliances.filter((appliance) => appliance.isActive);
const firstAppliance = activeAppliances[0];
const firstCategories = firstAppliance
  ? getCaseCategoriesForAppliance(caseCategoryFixtures, firstAppliance.id)
  : [];
const firstCategory = firstCategories[0];
const firstWorkflow =
  workflowTemplateFixtures.find(
    (workflow) =>
      workflow.applianceId === firstAppliance?.id && workflow.isDefault,
  ) ??
  workflowTemplateFixtures.find(
    (workflow) => workflow.applianceId === firstAppliance?.id,
  );

function getInitialValues(defaultTurnaroundDays: number): CreateCaseValues {
  return {
    patientName: "",
    patientCode: "",
    clinicId: "",
    doctorId: "",
    applianceId: firstAppliance?.id ?? "",
    categoryId: firstCategory?.id ?? "",
    workflowTemplateId: firstWorkflow?.id ?? "",
    turnaroundDays: defaultTurnaroundDays,
    priority: firstCategory?.defaultPriority ?? "Normal",
    priceRule: firstCategory?.defaultPriceRule ?? "full",
    billable: firstCategory?.defaultBillable ?? true,
  };
}

const NO_CLINIC = "__no_clinic__";

export function CreateCaseForm({
  cases,
  defaultTurnaroundDays,
  onCancel,
  onSubmit,
}: CreateCaseFormProps) {
  const [values, setValues] = useState(() =>
    getInitialValues(defaultTurnaroundDays),
  );
  const [error, setError] = useState("");
  const categories = useMemo(
    () =>
      getCaseCategoriesForAppliance(caseCategoryFixtures, values.applianceId),
    [values.applianceId],
  );
  const category = categories.find((item) => item.id === values.categoryId);
  const workflows = workflowTemplateFixtures.filter(
    (workflow) =>
      workflow.applianceId === values.applianceId && workflow.isActive,
  );
  const availableDoctors = useMemo(
    () =>
      values.clinicId
        ? doctorFixtures.filter((doctor) => doctor.clinicId === values.clinicId)
        : doctorFixtures,
    [values.clinicId],
  );

  function updateValue<Key extends keyof CreateCaseValues>(
    key: Key,
    value: CreateCaseValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function handleApplianceChange(applianceId: string) {
    const nextAppliance = appliances.find((item) => item.id === applianceId);
    if (!nextAppliance) return;

    const nextCategories = getCaseCategoriesForAppliance(
      caseCategoryFixtures,
      applianceId,
    );
    const nextCategory = nextCategories[0];
    const nextWorkflow =
      workflowTemplateFixtures.find(
        (workflow) =>
          workflow.applianceId === applianceId && workflow.isDefault,
      ) ??
      workflowTemplateFixtures.find(
        (workflow) => workflow.applianceId === applianceId,
      );

    setValues((current) => ({
      ...current,
      applianceId,
      categoryId: nextCategory?.id ?? "",
      workflowTemplateId: nextWorkflow?.id ?? "",
      priority: nextCategory?.defaultPriority ?? "Normal",
      priceRule: nextCategory?.defaultPriceRule ?? "full",
      billable: nextCategory?.defaultBillable ?? true,
      originalCaseId: undefined,
      remakeReason: undefined,
    }));
    setError("");
  }

  function handleCategoryChange(categoryId: string) {
    const nextCategory = categories.find((item) => item.id === categoryId);
    if (!nextCategory) return;

    setValues((current) => ({
      ...current,
      categoryId,
      priority: nextCategory.defaultPriority,
      priceRule: nextCategory.defaultPriceRule,
      billable: nextCategory.defaultBillable,
      originalCaseId: nextCategory.requiresOriginalCase
        ? current.originalCaseId
        : undefined,
      remakeReason: nextCategory.requiresReason
        ? current.remakeReason
        : undefined,
    }));
    setError("");
  }

  function handleClinicChange(clinicId: string) {
    const nextDoctors = clinicId
      ? doctorFixtures.filter((doctor) => doctor.clinicId === clinicId)
      : doctorFixtures;
    const hasCurrentDoctor = nextDoctors.some(
      (doctor) => doctor.id === values.doctorId,
    );

    setValues((current) => ({
      ...current,
      clinicId,
      doctorId: hasCurrentDoctor
        ? current.doctorId
        : (nextDoctors[0]?.id ?? ""),
    }));
    setError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !values.patientName.trim() ||
      !values.doctorId ||
      !values.applianceId ||
      !values.categoryId ||
      !values.workflowTemplateId
    ) {
      setError("Complete the patient, practice, and case setup details.");
      return;
    }
    if (category?.requiresOriginalCase && !values.originalCaseId) {
      setError("Select the original case for this category.");
      return;
    }
    if (category?.requiresReason && !values.remakeReason?.trim()) {
      setError("Add a reason for the remake.");
      return;
    }
    onSubmit({
      ...values,
      patientName: values.patientName.trim(),
      patientCode: values.patientCode.trim(),
      originalCaseId: values.originalCaseId || undefined,
      remakeReason: values.remakeReason?.trim() || undefined,
    });
  }

  return (
    <form
      id="create-case-form"
      className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_18rem]"
      onSubmit={handleSubmit}
    >
      <div className="grid min-w-0 gap-3">
        <Card>
          <CardHeader>
            <CardTitle>Patient & practice</CardTitle>
            <p className="text-sm text-text-muted">
              Identify the patient and the doctor requesting this case.
            </p>
          </CardHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field htmlFor="case-patient-name" label="Patient name" required>
              <Input
                id="case-patient-name"
                value={values.patientName}
                onChange={(event) =>
                  updateValue("patientName", event.currentTarget.value)
                }
                placeholder="e.g. Yassin Farouk"
                autoFocus
              />
            </Field>
            <Field htmlFor="case-patient-code" label="Patient code (optional)">
              <Input
                id="case-patient-code"
                value={values.patientCode}
                onChange={(event) =>
                  updateValue("patientCode", event.currentTarget.value)
                }
                placeholder="e.g. PT-1040"
              />
            </Field>
            <Field htmlFor="case-clinic" label="Clinic (optional)">
              <Select
                items={[
                  { value: NO_CLINIC, label: "All clinics / portal" },
                  ...clinicFixtures.map((clinic) => ({
                    value: clinic.id,
                    label: clinic.name,
                  })),
                ]}
                value={values.clinicId || NO_CLINIC}
                onValueChange={(value) =>
                  handleClinicChange(value === NO_CLINIC ? "" : (value ?? ""))
                }
              >
                <SelectTrigger id="case-clinic" className="w-full">
                  <SelectValue placeholder="All clinics / portal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CLINIC}>
                    All clinics / portal
                  </SelectItem>
                  {clinicFixtures.map((clinic) => (
                    <SelectItem key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field htmlFor="case-doctor" label="Doctor" required>
              <Select
                items={availableDoctors.map((doctor) => ({
                  value: doctor.id,
                  label: doctor.name,
                }))}
                value={values.doctorId}
                onValueChange={(value) => updateValue("doctorId", value ?? "")}
              >
                <SelectTrigger id="case-doctor" className="w-full">
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {availableDoctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Case setup</CardTitle>
            <p className="text-sm text-text-muted">
              Choose the appliance, category, and workflow that will control
              production.
            </p>
          </CardHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field htmlFor="case-appliance" label="Appliance type" required>
              <Select
                items={activeAppliances.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                value={values.applianceId}
                onValueChange={(value) => handleApplianceChange(value ?? "")}
              >
                <SelectTrigger id="case-appliance" className="w-full">
                  <SelectValue placeholder="Select appliance" />
                </SelectTrigger>
                <SelectContent>
                  {activeAppliances.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field htmlFor="case-category" label="Case category" required>
              <Select
                items={categories.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                value={values.categoryId}
                onValueChange={(value) => handleCategoryChange(value ?? "")}
              >
                <SelectTrigger id="case-category" className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {category && (
                <p className="text-xs text-text-muted">
                  {category.description}
                </p>
              )}
            </Field>
            <Field htmlFor="case-workflow" label="Workflow template" required>
              <Select
                items={workflows.map((workflow) => ({
                  value: workflow.id,
                  label: `${workflow.name}${workflow.isDefault ? " · Default" : ""}`,
                }))}
                value={values.workflowTemplateId}
                onValueChange={(value) =>
                  updateValue("workflowTemplateId", value ?? "")
                }
              >
                <SelectTrigger id="case-workflow" className="w-full">
                  <SelectValue placeholder="Select workflow" />
                </SelectTrigger>
                <SelectContent>
                  {workflows.map((workflow) => (
                    <SelectItem key={workflow.id} value={workflow.id}>
                      {workflow.name}
                      {workflow.isDefault ? " · Default" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </Card>

        {category?.requiresOriginalCase && (
          <Card>
            <CardHeader>
              <CardTitle>Original case</CardTitle>
              <p className="text-sm text-text-muted">
                This category must be linked to the case it revises.
              </p>
            </CardHeader>
            <Field htmlFor="case-original" label="Original case" required>
              <OriginalCaseSelect
                id="case-original"
                cases={cases}
                value={values.originalCaseId}
                onValueChange={(value) => updateValue("originalCaseId", value)}
              />
            </Field>
            {category.requiresReason && (
              <Field
                htmlFor="case-remake-reason"
                label="Reason for remake"
                required
              >
                <Textarea
                  id="case-remake-reason"
                  value={values.remakeReason ?? ""}
                  onChange={(event) =>
                    updateValue("remakeReason", event.currentTarget.value)
                  }
                  placeholder="Explain why this case needs a remake."
                  rows={3}
                />
              </Field>
            )}
          </Card>
        )}

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 lg:hidden">
          <Button type="button" variant="neutral" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Create case</Button>
        </div>
      </div>

      <aside className="grid content-start gap-3">
        <Card className="lg:sticky lg:top-3">
          <CardHeader>
            <CardTitle>Case options</CardTitle>
            <p className="text-sm text-text-muted">
              Set timing and billing before sending the case into production.
            </p>
          </CardHeader>
          <div className="grid gap-3">
            <Field
              htmlFor="case-turnaround-days"
              label="Turnaround days (optional)"
            >
              <Input
                id="case-turnaround-days"
                type="number"
                min={0}
                value={values.turnaroundDays ?? ""}
                onChange={(event) =>
                  updateValue(
                    "turnaroundDays",
                    event.currentTarget.value === ""
                      ? undefined
                      : Math.max(0, Number(event.currentTarget.value)),
                  )
                }
                placeholder="7"
              />
              <p className="text-xs text-text-muted">
                Defaults to your lab setting when left unchanged.
              </p>
            </Field>
            <Field htmlFor="case-priority" label="Priority">
              <Select
                items={[
                  { value: "Normal", label: "Normal" },
                  { value: "Rush", label: "Rush" },
                ]}
                value={values.priority}
                onValueChange={(value) =>
                  updateValue(
                    "priority",
                    (value ?? "Normal") as CasePipelinePriority,
                  )
                }
              >
                <SelectTrigger id="case-priority" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Rush">Rush</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </Card>
        <Card className="gap-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Selected setup details</CardTitle>

          </CardHeader>
          <div className="grid gap-2.5 text-xs">
            <div className="rounded-sm border border-border bg-neutral-50 p-2.5">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-semibold text-text">
                  {appliances.find((item) => item.id === values.applianceId)?.name ?? "Appliance"}
                </span>
                <Badge tone="info">Appliance</Badge>
              </div>
              <p className="text-text-muted text-2xs leading-relaxed">
                {values.applianceId === "aligner"
                  ? "Sequential clear aligners engineered for orthodontic tooth movement and staged progress tracking."
                  : values.applianceId === "retainer"
                  ? "Post-treatment retention appliance with arch specification, material selection, and total set controls."
                  : "Standard dental appliance with customized fabrication steps according to selected template."}
              </p>
            </div>

            {category && (
              <div className="rounded-sm border border-border bg-neutral-50 p-2.5">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-semibold text-text">{category.name}</span>
                  <Badge tone={category.requiresOriginalCase ? "accent" : "neutral"}>
                    {category.requiresOriginalCase ? "Linked revision" : "Standard"}
                  </Badge>
                </div>
                <p className="text-text-muted text-2xs leading-relaxed mb-2">
                  {category.description}
                </p>
                <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-border-soft text-2xs">
                  <div>
                    <span className="text-text-muted">Billing: </span>
                    <span className="font-medium text-text">
                      {category.defaultBillable ? getCaseBillingRuleLabel(category.defaultPriceRule) : "Warranty (No charge)"}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted">Original case: </span>
                    <span className="font-medium text-text">
                      {category.requiresOriginalCase ? "Required" : "None"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </aside>
    </form>
  );
}

function Field({
  children,
  className,
  htmlFor,
  label,
  required = false,
}: {
  children: ReactNode;
  className?: string;
  htmlFor: string;
  label: string;
  required?: boolean;
}) {
  return (
    <div className={`grid gap-1.5 ${className ?? ""}`}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}
