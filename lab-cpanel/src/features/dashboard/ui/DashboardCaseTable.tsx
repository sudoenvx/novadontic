import { cn } from "cn";
import { List, Plus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Badge, type BadgeTone } from "../../../shared/ui/Badge";
import { Button } from "../../../shared/ui/Button";
import {
  DataTable,
  DataTableActions,
  type DataTableColumn,
} from "../../../shared/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared/ui/Select";
import { filterCasesByType } from "../domain/case";
import type { CaseStatus, CaseType, DashboardCase } from "../domain/case";

const caseTypeColor: Partial<Record<
  CaseType,
  { color: string; foregroundColor: string }
>> = {
  Aligner: {
    color: "var(--color-primary-soft)",
    foregroundColor: "var(--color-primary-soft-foreground)",
  },
  Retainer: {
    color: "var(--color-accent-soft)",
    foregroundColor: "var(--color-text)",
  },
};

const statusTone: Record<CaseStatus, BadgeTone> = {
  "On track": "success",
  "Due today": "warning",
  "Needs attention": "destructive",
};

const columns: DataTableColumn<DashboardCase>[] = [
  {
    id: "case",
    header: "Case",
    sortable: true,
    pinnable: true,
    sortValue: (row) => row.id,
    cell: (dashboardCase) => (
      <Link
        to={`/cases/${dashboardCase.id}`}
        className="flex items-center gap-2.5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <div>
          <p className="font-semibold text-text">{dashboardCase.id}</p>
          <p className="text-sm text-text-muted">
            {dashboardCase.patientName} · {dashboardCase.clinic}
          </p>
        </div>
      </Link>
    ),
  },
  {
    id: "case-type",
    header: "Case type",
    accessorKey: "caseType",
    cell: (dashboardCase) => (
      <Badge
        color={caseTypeColor[dashboardCase.caseType]?.color}
        foregroundColor={caseTypeColor[dashboardCase.caseType]?.foregroundColor}
        tone={caseTypeColor[dashboardCase.caseType] ? undefined : "neutral"}
      >
        {dashboardCase.caseType}
      </Badge>
    ),
  },
  {
    id: "category",
    header: "Category",
    accessorKey: "category",
    cell: (dashboardCase) => (
      <Badge tone="accent">{dashboardCase.category}</Badge>
    ),
  },
  {
    id: "stage",
    header: "Stage",
    accessorKey: "stage",
    className: "text-secondary",
  },
  {
    id: "due-date",
    header: "Due",
    sortable: true,
    accessorKey: "dueDate",
    className: "text-secondary",
    cell: (dashboardCase) => (
      <span
        className={cn(
          dashboardCase.dueDate === "Today" && "font-semibold text-warning",
        )}
      >
        {dashboardCase.dueDate}
      </span>
    ),
  },
  {
    id: "status",
    header: "Status",
    sortable: true,
    accessorKey: "status",
    cell: (dashboardCase) => (
      <Badge tone={statusTone[dashboardCase.status]}>
        {dashboardCase.status}
      </Badge>
    ),
  },
];

type DashboardCaseTableProps = {
  cases: DashboardCase[];
};

export function DashboardCaseTable({ cases }: DashboardCaseTableProps) {
  const navigate = useNavigate();
  const [selectedAppliance, setSelectedAppliance] = useState("all");
  const visibleCases = filterCasesByType(cases, selectedAppliance);

  return (
    <DataTable
      columns={columns}
      data={visibleCases}
      persistenceKey="dashboard-cases"
      emptyMessage="No cases for this appliance yet."
      getRowId={(dashboardCase) => dashboardCase.id}
      title="Orthodontic cases"
      description="Track active lab cases by appliance type and stage."
    >
      <DataTableActions>
        <Select
          value={selectedAppliance}
          onValueChange={(value) => setSelectedAppliance(value ?? "all")}
        >
          <SelectTrigger
            className="w-28"
            aria-label="Filter cases by appliance"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All appliances</SelectItem>
            {[...new Set(cases.map((caseItem) => caseItem.caseType))].map((caseType) => (
              <SelectItem key={caseType} value={caseType}>
                {caseType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="neutral" onClick={() => navigate("/cases")}>
          <List /> View all cases
        </Button>
        <Button onClick={() => navigate("/cases/new")}>
          <Plus /> Create case
        </Button>
      </DataTableActions>
    </DataTable>
  );
}
