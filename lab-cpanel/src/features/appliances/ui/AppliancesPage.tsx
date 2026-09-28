import { Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '../../../shared/ui/Button'
import { AppHeader, AppHeaderActions } from '../../../shared/ui/AppHeader'
import { Card } from '../../../shared/ui/Card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../../../shared/ui/InputGroup'
import { Page } from '../../../shared/ui/Page'
import { toast } from '../../../shared/ui/Toast'
import { appliances as applianceFixtures } from '../data/appliances'
import { filterAppliances, isApplianceNameAvailable, type Appliance } from '../domain/appliance'
import { ApplianceCard } from './ApplianceCard'
import { CreateApplianceTypeDialog } from './CreateApplianceTypeDialog'

export function AppliancesPage() {
  const navigate = useNavigate()
  const [appliances, setAppliances] = useState<Appliance[]>(applianceFixtures)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const visibleAppliances = useMemo(() => filterAppliances(appliances, searchTerm), [appliances, searchTerm])

  function handleCreate(appliance: Appliance) {
    setAppliances((current) => [...current, appliance])
    toast.add({ title: 'Appliance type created', description: `${appliance.name} is ready for field setup.`, type: 'success' })
    navigate(`/appliances/${appliance.id}`, { state: { appliance } })
  }

  function handleToggle(applianceId: string) {
    setAppliances((current) => current.map((appliance) => appliance.id === applianceId ? { ...appliance, isActive: !appliance.isActive } : appliance))
    const appliance = appliances.find((item) => item.id === applianceId)
    if (appliance) {
      toast.add({ title: `${appliance.name} ${appliance.isActive ? 'deactivated' : 'activated'}`, type: 'success' })
    }
  }

  return (
    <Page size="full">
      <AppHeader title="Appliances & fields" description="Groups let you organize related fields; each field controls its own type, default, and options.">
        <AppHeaderActions>
          <InputGroup className="w-64" variant="neutral">
            <InputGroupAddon><Search /></InputGroupAddon>
            <InputGroupInput value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search appliances" aria-label="Search appliances" />
          </InputGroup>
          <Button onClick={() => setIsCreateOpen(true)}><Plus /> Add appliance type</Button>
        </AppHeaderActions>
      </AppHeader>

      {visibleAppliances.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleAppliances.map((appliance) => (
            <ApplianceCard
              key={appliance.id}
              appliance={appliance}
              onOpen={() => navigate(`/appliances/${appliance.id}`, { state: { appliance } })}
              onToggle={() => handleToggle(appliance.id)}
            />
          ))}
        </div>
      ) : (
        <Card className="min-h-40 items-center justify-center text-center">
          <p className="font-medium text-text">No appliance types found</p>
          <p className="text-sm text-text-muted">Try another search or add a custom appliance type.</p>
        </Card>
      )}

      <CreateApplianceTypeDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreate={handleCreate}
        isNameAvailable={(name) => isApplianceNameAvailable(appliances, name)}
      />
    </Page>
  )
}
