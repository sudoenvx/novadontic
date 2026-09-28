import { Check, ChevronDown, Search } from 'lucide-react'
import { useState } from 'react'

import { Button } from '../../../shared/ui/Button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../../shared/ui/Command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../shared/ui/Popover'
import type { CasePipelineCase } from '../domain/casePipeline'

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
            variant="neutral"
            // size={"sm"}
            className="w-full justify-between text-left font-normal"
            id={id}
            aria-label="Select original case"
          />
        }
      >
        <span className="min-w-0 truncate">
          {selectedCase
            ? `${selectedCase.id} · ${selectedCase.patientName}`
            : 'Search and select an original case'}
        </span>
        <ChevronDown className="size-3.5 shrink-0 text-text-muted" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--anchor-width) p-1">
        <Command>
          <CommandInput placeholder="Search case or patient..." />
          <CommandList>
            <CommandEmpty>No matching cases.</CommandEmpty>
            <CommandGroup>
              {cases.map((caseItem) => (
                <CommandItem
                  key={caseItem.id}
                  value={`${caseItem.id} ${caseItem.patientName} ${caseItem.patientCode}`}
                  onSelect={() => {
                    onValueChange(caseItem.id)
                    setOpen(false)
                  }}
                >
                  <Search className="text-text-muted" />
                  <span className="grid min-w-0 gap-0.5">
                    <span className="font-medium text-text">{caseItem.id}</span>
                    <span className="truncate text-xs text-text-muted">
                      {caseItem.patientName} · {caseItem.patientCode}
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
