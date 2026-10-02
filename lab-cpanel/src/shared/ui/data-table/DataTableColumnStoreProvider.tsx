import type { ReactNode } from 'react'

import { DataTableColumnStoreContext, type DataTableColumnStore } from './dataTableColumnStore'

export function DataTableColumnStoreProvider({
  children,
  store,
}: {
  children: ReactNode
  store: DataTableColumnStore
}) {
  return (
    <DataTableColumnStoreContext.Provider value={store}>
      {children}
    </DataTableColumnStoreContext.Provider>
  )
}
