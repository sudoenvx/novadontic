import { useMemo, useState, type FormEvent } from "react";

import { Button } from "../../../../shared/ui/Button";
import { Card, CardHeader, CardTitle } from "../../../../shared/ui/Card";
import { Field, FieldContent, FieldLabel } from "../../../../shared/ui/Field";
import { Textarea } from "../../../../shared/ui/Textarea";
import { getApiErrorMessage } from "../../../../shared/api/apiError";
import { useDoctors } from "../../../doctors/queries/doctor.queries";
import type { Appliance } from "../../../appliances/domain/appliance";
import { getCaseCategoriesForAppliance } from "../../domain/caseCategory";
import type {
  CasePipelineCase,
} from "../../domain/casePipeline";
import { caseCategoryFixtures } from "../../data/caseCategories";
import type { WorkflowTemplateOption } from "../../../appliance-workflow-templates/domain/workflowTemplate";
import { OriginalCaseSelect } from "./OriginalCaseSelect";
import { CreateCaseOptions } from "./CreateCaseOptions";
import { CreateCasePatientFields } from "./CreateCasePatientFields";
import { CreateCaseSetupFields } from "./CreateCaseSetupFields";
import type { CreateCaseValues } from "./createCase.types";

export type { CreateCaseValues } from "./createCase.types";

type CreateCaseFormProps = {
  cases: CasePipelineCase[];
  appliances: Appliance[];
  workflows: WorkflowTemplateOption[];
  defaultTurnaroundDays: number;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateCaseValues) => Promise<void>;
};

const unavailableCategoryIds = new Set([
  'duplicate',
  'remake',
  'clear-aligner-refinement',
])
function getInitialValues(
  appliances: Appliance[],
  workflows: WorkflowTemplateOption[],
  defaultTurnaroundDays: number,
): CreateCaseValues {
  const firstAppliance = appliances[0];
  const firstCategory = firstAppliance
    ? getCreateCaseCategories(firstAppliance.id)[0]
    : undefined;
  const applianceWorkflows = workflows.filter(
    (workflow) => workflow.applianceId === firstAppliance?.id || workflow.applianceId === null,
  );
  const firstWorkflow = applianceWorkflows.find((workflow) => workflow.isDefault) ?? applianceWorkflows[0];
  return {
    patientName: "",
    patientCode: "",
    clinicId: "",
    doctorId: "",
    applianceId: firstAppliance?.id ?? "",
    categoryId: firstCategory?.id ?? "",
    workflowTemplateId: firstWorkflow?.id ?? "",
    dueDate: getDueDateAfterDays(defaultTurnaroundDays),
    priority: firstCategory?.defaultPriority ?? "Normal",
    priceRule: firstCategory?.defaultPriceRule ?? "full",
    billable: firstCategory?.defaultBillable ?? true,
  };
}

function getCreateCaseCategories(applianceId: string) {
  return getCaseCategoriesForAppliance(caseCategoryFixtures, applianceId).filter(
    (category) => !unavailableCategoryIds.has(category.id),
  )
}

function getDueDateAfterDays(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function CreateCaseForm({
  cases,
  appliances,
  workflows: workflowOptions,
  defaultTurnaroundDays,
  isSubmitting,
  onCancel,
  onSubmit,
}: CreateCaseFormProps) {
  const doctorsQuery = useDoctors()
  const doctors = useMemo(
    () => doctorsQuery.data?.data ?? [],
    [doctorsQuery.data?.data],
  )
  const [values, setValues] = useState(() =>
    getInitialValues(appliances, workflowOptions, defaultTurnaroundDays),
  );
  const [error, setError] = useState("");
  const categories = useMemo(
    () => getCreateCaseCategories(values.applianceId),
    [values.applianceId],
  );
  const category = categories.find((item) => item.id === values.categoryId);
  const workflows = workflowOptions.filter(
    (workflow) =>
      workflow.applianceId === values.applianceId || workflow.applianceId === null,
  );
  const availableDoctors = useMemo(
    () =>
      values.clinicId
        ? doctors.filter((doctor) =>
            doctor.clinics.some((clinic) => clinic.id === values.clinicId),
          )
        : doctors,
    [doctors, values.clinicId],
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

    const nextCategories = getCreateCaseCategories(applianceId);
    const nextCategory = nextCategories[0];
    const nextWorkflow =
      workflowOptions.find(
        (workflow) =>
          workflow.applianceId === applianceId && workflow.isDefault,
      ) ??
      workflowOptions.find(
        (workflow) => workflow.applianceId === applianceId && workflow.applianceId !== null,
      ) ??
      workflowOptions.find(
        (workflow) => workflow.applianceId === null && workflow.isDefault,
      ) ??
      workflowOptions.find(
        (workflow) => workflow.applianceId === null,
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
      ? doctors.filter((doctor) =>
          doctor.clinics.some((clinic) => clinic.id === clinicId),
        )
      : doctors;
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
    try {
      await onSubmit({
        ...values,
        categoryName: category?.name,
        patientName: values.patientName.trim(),
        patientCode: values.patientCode.trim(),
        originalCaseId: values.originalCaseId || undefined,
        remakeReason: values.remakeReason?.trim() || undefined,
      });
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "Could not create case. Please try again."));
    }
  }

  return (
    <form
      id="create-case-form"
      className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1fr)_18rem]"
      onSubmit={handleSubmit}
    >
      <div className="grid min-w-0 gap-3">
        {doctorsQuery.isError && (
          <p role="alert" className="text-sm text-destructive">
            Could not load doctors: {getApiErrorMessage(doctorsQuery.error, 'Please try again.')}
          </p>
        )}
        <CreateCasePatientFields
          values={values}
          doctors={availableDoctors}
          doctorsLoading={doctorsQuery.isPending}
          onClinicChange={handleClinicChange}
          onUpdateValue={updateValue}
        />

        <CreateCaseSetupFields
          values={values}
          appliances={appliances}
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
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating…' : 'Create case'}</Button>
        </div>
      </div>

      <CreateCaseOptions
        values={values}
        onUpdateValue={updateValue}
      />
    </form>
  );
}
