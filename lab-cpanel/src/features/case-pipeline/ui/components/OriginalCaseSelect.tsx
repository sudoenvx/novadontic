import { Check, ChevronDown, FileText } from 'lucide-react'
import { useState } from 'react'

import { Button } from '../../../../shared/ui/Button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../../../shared/ui/Command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../../shared/ui/Popover'
import type { CasePipelineCase } from '../../domain/casePipeline'

type OriginalCaseSelectProps = {
  cases: CasePipelineCase[]
  id?: string
  value?: string
  onValueChange: (caseId: string | undefined) => void
}

export function OriginalCaseSelect({
  cases,
  id,
  onValueChange,
  value,
}: OriginalCaseSelectProps) {
  const [open, setOpen] = useState(false)
  const selectedCase = cases.find((caseItem) => caseItem.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="h-auto min-h-control-md w-full justify-between gap-3 px-3 py-2 text-left font-medium"
            id={id}
            aria-label={selectedCase ? `Original case ${selectedCase.id}` : 'Select original case'}
            aria-haspopup="listbox"
            aria-expanded={open}
          />
        }
      >
        <span className="grid min-w-0 flex-1 grid-cols-[auto_minmax(0,1fr)] items-center gap-2.5 text-start">
          <span className="grid size-7 place-items-center rounded-sm bg-primary-soft text-primary">
            <FileText size={16} aria-hidden="true" />
          </span>
          <span className="grid min-w-0 gap-0.5">
            <span className="truncate text-sm font-semibold text-text-primary">
              {selectedCase?.patientName ?? 'Choose an original case'}
            </span>
            <span className="truncate text-xs font-normal text-text-muted">
              {selectedCase
                ? `${selectedCase.id} · ${selectedCase.patientCode}`
                : 'Search by case number, patient, or code'}
            </span>
          </span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--anchor-width) overflow-hidden p-0">
        <Command>
          <CommandInput placeholder="Search cases or patients..." />
          <CommandList>
            <CommandEmpty className="px-4">No matching cases.</CommandEmpty>
            <CommandGroup heading="Cases">
              {cases.map((caseItem) => (
                <CommandItem
                  key={caseItem.id}
                  value={`${caseItem.id} ${caseItem.patientName} ${caseItem.patientCode}`}
                  onSelect={() => {
                    onValueChange(caseItem.id)
                    setOpen(false)
                  }}
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-xs bg-primary-soft text-primary">
                    <FileText size={14} aria-hidden="true" />
                  </span>
                  <span className="grid min-w-0 flex-1 gap-0.5">
                    <span className="flex items-center gap-2">
                      <span className="font-semibold text-text-primary">{caseItem.id}</span>
                      <span className="truncate text-xs text-text-muted">{caseItem.patientName}</span>
                    </span>
                    <span className="truncate text-xs text-text-muted">
                      {caseItem.clinicName} · {caseItem.doctorName} · {caseItem.patientCode}
                    </span>
                  </span>
                  {caseItem.id === value && <Check className="ml-auto text-primary" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
