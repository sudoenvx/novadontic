import { createContext } from 'react'
import { createStore, type StoreApi } from 'zustand/vanilla'

export type DataTableColumnOption = {
  id: string
  label: string
  showInColumnVisualizer?: boolean
}

type DataTableColumnStoreState = {
  columns: DataTableColumnOption[]
  visibleColumnIds: string[]
  setColumns: (columns: DataTableColumnOption[], visibleColumnIds: string[]) => void
  setVisibleColumnIds: (visibleColumnIds: string[]) => void
}

export type DataTableColumnStore = StoreApi<DataTableColumnStoreState>

export const DataTableColumnStoreContext = createContext<DataTableColumnStore | null>(null)

export function createDataTableColumnStore(
  columns: DataTableColumnOption[],
  visibleColumnIds: string[],
) {
  return createStore<DataTableColumnStoreState>((set) => ({
    columns,
    visibleColumnIds,
    setColumns: (nextColumns, nextVisibleColumnIds) => {
      set((state) => (
        areSameColumns(state.columns, nextColumns)
        && areSameIds(state.visibleColumnIds, nextVisibleColumnIds)
          ? state
          : { columns: nextColumns, visibleColumnIds: nextVisibleColumnIds }
      ))
    },
    setVisibleColumnIds: (nextVisibleColumnIds) => {
      set((state) => {
        const validVisibleColumnIds = nextVisibleColumnIds.filter((id) =>
          state.columns.some((column) => column.id === id),
        )
        return areSameIds(state.visibleColumnIds, validVisibleColumnIds)
          ? state
          : { visibleColumnIds: validVisibleColumnIds }
      })
    },
  }))
}

function areSameColumns(
  currentColumns: DataTableColumnOption[],
  nextColumns: DataTableColumnOption[],
) {
  return currentColumns.length === nextColumns.length
    && currentColumns.every((column, index) => {
      const nextColumn = nextColumns[index]
      return column.id === nextColumn.id
        && column.label === nextColumn.label
        && column.showInColumnVisualizer === nextColumn.showInColumnVisualizer
    })
}

function areSameIds(currentIds: string[], nextIds: string[]) {
  return currentIds.length === nextIds.length
    && currentIds.every((id, index) => id === nextIds[index])
}
