import { useMemo, useState, type FormEvent } from "react";

import { Button } from "../../../../shared/ui/Button";
import { Card, CardHeader, CardTitle } from "../../../../shared/ui/Card";
import { Field, FieldContent, FieldLabel } from "../../../../shared/ui/Field";
import { Textarea } from "../../../../shared/ui/Textarea";
import { doctorFixtures } from "../../../doctors/data/doctors";
import { appliances } from "../../../appliances/data/appliances";
import { getCaseCategoriesForAppliance } from "../../domain/caseCategory";
import type {
  CasePipelineCase,
} from "../../domain/casePipeline";
import { caseCategoryFixtures } from "../../data/caseCategories";
import { workflowTemplateFixtures } from "../../../appliance-workflow-templates/data/workflowTemplates";
import { OriginalCaseSelect } from "./OriginalCaseSelect";
import { CreateCaseOptions } from "./CreateCaseOptions";
import { CreateCasePatientFields } from "./CreateCasePatientFields";
import { CreateCaseSetupFields } from "./CreateCaseSetupFields";
import type { CreateCaseValues } from "./createCase.types";

export type { CreateCaseValues } from "./createCase.types";

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
      className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1fr)_18rem]"
      onSubmit={handleSubmit}
    >
      <div className="grid min-w-0 gap-3">
        <CreateCasePatientFields
          values={values}
          doctors={availableDoctors}
          onClinicChange={handleClinicChange}
          onUpdateValue={updateValue}
        />

        <CreateCaseSetupFields
          values={values}
          appliances={activeAppliances}
          categories={categories}
          workflows={workflows}
          onApplianceChange={handleApplianceChange}
          onCategoryChange={handleCategoryChange}
          onUpdateValue={updateValue}
        />

        {category?.requiresOriginalCase && (
          <Card>
            <CardHeader>
              <CardTitle>Original case</CardTitle>
              <p className="text-sm text-text-muted">
                This category must be linked to the case it revises.
              </p>
            </CardHeader>
            <Field>
              <FieldLabel htmlFor="case-original">Original case <span aria-hidden="true" className="text-destructive">*</span></FieldLabel>
              <FieldContent>
                <OriginalCaseSelect
                  id="case-original"
                  cases={cases}
                  value={values.originalCaseId}
                  onValueChange={(value) => updateValue("originalCaseId", value)}
                />
              </FieldContent>
            </Field>
            {category.requiresReason && (
              <Field>
                <FieldLabel htmlFor="case-remake-reason">Reason for remake <span aria-hidden="true" className="text-destructive">*</span></FieldLabel>
                <FieldContent>
                  <Textarea
                    id="case-remake-reason"
                    value={values.remakeReason ?? ""}
                    onChange={(event) => updateValue("remakeReason", event.currentTarget.value)}
                    placeholder="Explain why this case needs a remake."
                    rows={3}
                  />
                </FieldContent>
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

      <CreateCaseOptions
        values={values}
        applianceName={appliances.find((item) => item.id === values.applianceId)?.name ?? 'Appliance'}
        category={category}
        onUpdateValue={updateValue}
      />
    </form>
  );
}

