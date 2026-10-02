import { Columns3 } from 'lucide-react'

import { Button } from '../Button'
import { Checkbox } from '../Checkbox'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '../Popover'
import { useDataTableColumns } from './useDataTableColumns'

export function DataTableColumnVisualizer() {
  const { columns, visibleColumnIds, setVisibleColumnIds } = useDataTableColumns()
  const visualizedColumns = columns.filter((column) => column.showInColumnVisualizer !== false)
  const visibleColumns = new Set(visibleColumnIds)

  function toggleColumn(columnId: string, visible: boolean) {
    const nextVisibleColumns = visible
      ? [...new Set([...visibleColumns, columnId])]
      : [...visibleColumns].filter((id) => id !== columnId)
    setVisibleColumnIds(nextVisibleColumns)
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Show or hide table columns"
            title="Show or hide columns"
          />
        }
      >
        <Columns3 aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <PopoverHeader>
          <PopoverTitle>Table columns</PopoverTitle>
          <PopoverDescription>Choose which columns are visible.</PopoverDescription>
        </PopoverHeader>
        <div className="grid gap-1">
          {visualizedColumns.map((column) => {
            const isVisible = visibleColumns.has(column.id)
            return (
              <label
                key={column.id}
                className="flex min-h-control-sm items-center gap-2 rounded-sm px-1.5 text-sm text-text-primary hover:bg-surface-muted"
              >
                <Checkbox
                  checked={isVisible}
                  disabled={
                    isVisible
                    && visualizedColumns.filter((item) => visibleColumns.has(item.id)).length === 1
                  }
                  onCheckedChange={(checked) => toggleColumn(column.id, checked === true)}
                />
                <span className="sr-only">Show </span>
                <span className="truncate">{column.label}</span>
              </label>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
