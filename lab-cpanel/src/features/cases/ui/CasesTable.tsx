import { Link } from "react-router-dom";
import type { ReactNode } from "react";

import { Badge, type BadgeTone } from "../../../shared/ui/Badge";
import { Button } from "../../../shared/ui/Button";
import { DataTable, DataTableEmptyState, type DataTableColumn } from "../../../shared/ui/data-table";
import type { CaseListItem } from "../domain/case";

const statusTone: Record<CaseListItem["status"], BadgeTone> = {
  "On track": "success",
  "Due today": "warning",
  "Needs attention": "destructive",
};

const columns: DataTableColumn<CaseListItem>[] = [
  {
    id: "case",
    header: "Case",
    sortable: true,
    pinnable: true,
    sortValue: (caseItem) => caseItem.id,
    cell: (caseItem) => (
      <Link
        to={`/cases/${caseItem.id}`}
        className="grid gap-0.5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <span className="flex items-center gap-2 font-semibold text-primary">
          {caseItem.id}
          {caseItem.priority === "Rush" && <Badge tone="destructive">Rush</Badge>}
        </span>
        <span className="text-xs text-text-muted">
          {caseItem.patientName} · {caseItem.patientCode}
        </span>
      </Link>
    ),
  },
  {
    id: "appliance",
    header: "Appliance",
    accessorKey: "applianceType",
    className: "text-secondary",
  },
  {
    id: "category",
    header: "Category",
    accessorKey: "category",
    cell: (caseItem) => <Badge tone="accent">{caseItem.category}</Badge>,
  },
  {
    id: "doctor",
    header: "Doctor",
    accessorKey: "doctorName",
    className: "text-secondary",
  },
  {
    id: "stage",
    header: "Stage",
    accessorKey: "stage",
    cell: (caseItem) => (
      <Badge tone={caseItem.stage === "Delivered" ? "success" : "info"}>
        {caseItem.stage}
      </Badge>
    ),
  },
  {
    id: "due-date",
    header: "Due",
    sortable: true,
    accessorKey: "dueDate",
    className: "text-secondary",
  },
  {
    id: "status",
    header: "Status",
    sortable: true,
    accessorKey: "status",
    cell: (caseItem) => (
      <Badge tone={statusTone[caseItem.status]}>{caseItem.status}</Badge>
    ),
  },
];

export function CasesTable({
  cases,
  footer,
  totalCount,
  onResetFilters,
}: {
  cases: CaseListItem[];
  footer: ReactNode;
  totalCount: number;
  onResetFilters: () => void;
}) {
  return (
    <DataTable
      columns={columns}
      data={cases}
      title="All cases"
      bulkActions={(row) => (
        <>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => console.log("Selected rows:", row.selectedRows)}
          >
            Export selected
          </Button>
        </>
      )}
      // bodyMaxHeight={400}
      description={`${totalCount} case${totalCount === 1 ? "" : "s"} match the current filters.`}
      emptyState={
        <DataTableEmptyState
          title="No cases match these filters"
          description="Try a different search, or clear the filters to see every case."
          action={
            <Button type="button" variant="neutral" size="sm" onClick={onResetFilters}>
              Clear filters
            </Button>
          }
        />
      }
      getRowId={(caseItem) => caseItem.id}
      selectable
      footer={footer}
      compact
    />
  );
}
