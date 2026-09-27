import { TableBody, TableCell, TableRow } from '../Table'

type DataTableLoadingProps = {
  columnCount: number
  rowCount: number
}

export function DataTableLoading({ columnCount, rowCount }: DataTableLoadingProps) {
  return (
    <TableBody>
      {Array.from({ length: rowCount }, (_, rowIndex) => (
        <TableRow key={`loading-row-${rowIndex}`}>
          {Array.from({ length: columnCount }, (_, columnIndex) => (
            <TableCell key={`loading-cell-${rowIndex}-${columnIndex}`}>
              <span className="block h-4 w-full max-w-full animate-pulse rounded-xs bg-surface-muted" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  )
}
