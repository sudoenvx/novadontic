import { useContext } from 'react'
import { useStore } from 'zustand'

import { DataTableColumnStoreContext } from './dataTableColumnStore'

export function useDataTableColumns() {
  const store = useContext(DataTableColumnStoreContext)
  if (!store) {
    throw new Error('DataTableColumnVisualizer must be rendered inside a DataTable.')
  }

  return {
    columns: useStore(store, (state) => state.columns),
    visibleColumnIds: useStore(store, (state) => state.visibleColumnIds),
    setVisibleColumnIds: useStore(store, (state) => state.setVisibleColumnIds),
  }
}
