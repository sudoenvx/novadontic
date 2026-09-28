import { TableBody, TableCell, TableRow } from '../Table'

type DataTableLoadingProps = {
  columnCount: number
  rowCount: number
}

/**
 * DataTableLoading
 * ---------------------------------------------------------------------------
 * Skeleton pulse rows shown while data is fetching.
 * Uses the design system's surface-muted background and h-row cell height.
 */
export function DataTableLoading({ columnCount, rowCount }: DataTableLoadingProps) {
  return (
    <TableBody>
      {Array.from({ length: rowCount }, (_, rowIndex) => (
        <TableRow key={`loading-row-${rowIndex}`}>
          {Array.from({ length: columnCount }, (_, columnIndex) => (
            <TableCell key={`loading-cell-${rowIndex}-${columnIndex}`}>
              <span className="block h-3.5 w-full max-w-[14rem] animate-pulse rounded-xs bg-surface-muted" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  )
}
