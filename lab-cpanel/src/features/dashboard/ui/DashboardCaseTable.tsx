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
import { applianceFixtures } from "../data/appliances";
import { filterCasesByType } from "../domain/case";
import type { CaseStatus, CaseType, DashboardCase } from "../domain/case";

const caseTypeColor: Record<
  CaseType,
  { color: string; foregroundColor: string }
> = {
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
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {dashboardCase.assignee}
        </span>
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
    sortable: true,
    pinnable: true,
    accessorKey: "caseType",
    cell: (dashboardCase) => (
      <Badge
        color={caseTypeColor[dashboardCase.caseType].color}
        foregroundColor={caseTypeColor[dashboardCase.caseType].foregroundColor}
      >
        {dashboardCase.caseType}
      </Badge>
    ),
  },
  {
    id: "category",
    header: "Category",
    sortable: true,
    pinnable: true,
    accessorKey: "category",
    cell: (dashboardCase) => (
      <Badge tone="accent">{dashboardCase.category}</Badge>
    ),
  },
  {
    id: "stage",
    header: "Stage",
    sortable: true,
    pinnable: true,
    accessorKey: "stage",
    className: "text-secondary",
  },
  {
    id: "due-date",
    header: "Due",
    sortable: true,
    pinnable: true,
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
    pinnable: true,
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
            variant="neutral"
            className="w-36"
            aria-label="Filter cases by appliance"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All appliances</SelectItem>
            {applianceFixtures.map((appliance) => (
              <SelectItem key={appliance.name} value={appliance.name}>
                {appliance.name}
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
