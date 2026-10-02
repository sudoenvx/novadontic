import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getApiErrorMessage } from '../../../shared/api/apiError'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../../../shared/ui/InputGroup'
import { Page } from '../../../shared/ui/Page'
import { PageHeader, PageHeaderActions } from '../../../shared/ui/PageHeader'
import { Skeleton } from '../../../shared/ui/Skeleton'
import { toast } from '../../../shared/ui/Toast'
import {
  isApplianceNameAvailable,
  type ApplianceTypeInput,
} from '../domain/appliance'
import {
  useAppliances,
  useCreateAppliance,
  useSetApplianceActive,
} from '../queries/appliance.queries'
import { ApplianceCard } from './ApplianceCard'
import { CreateApplianceTypeDialog } from './CreateApplianceTypeDialog'

export function AppliancesPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const appliancesQuery = useAppliances(searchTerm)
  const createApplianceMutation = useCreateAppliance()
  const setApplianceActiveMutation = useSetApplianceActive()
  const appliances = appliancesQuery.data ?? []

  async function handleCreate(input: ApplianceTypeInput) {
    const appliance = await createApplianceMutation.mutateAsync(input)
    toast.add({
      title: 'Appliance type created',
      description: `${appliance.name} is ready for field setup.`,
      type: 'success',
    })
    setIsCreateOpen(false)
    navigate(`/appliances/${appliance.id}`)
  }

  async function handleToggle(applianceId: string) {
    const appliance = appliances.find((item) => item.id === applianceId)
    if (!appliance) return

    try {
      const updatedAppliance = await setApplianceActiveMutation.mutateAsync({
        applianceTypeId: appliance.id,
        isActive: !appliance.isActive,
      })
      toast.add({
        title: `${updatedAppliance.name} ${updatedAppliance.isActive ? 'activated' : 'deactivated'}`,
        type: 'success',
      })
    } catch (error) {
      toast.add({
        title: 'Could not update appliance status',
        description: getApiErrorMessage(error, 'Please try again.'),
        type: 'error',
      })
    }
  }

  return (
    <Page size="full">
      <PageHeader title="Appliances & fields" description="Groups let you organize related fields; each field controls its own type, default, and options.">
        <PageHeaderActions>
          <InputGroup className="w-64" variant="neutral">
            <InputGroupAddon><Search /></InputGroupAddon>
            <InputGroupInput value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search appliances" aria-label="Search appliances" />
          </InputGroup>
          <Button onClick={() => setIsCreateOpen(true)}><Plus /> Add appliance type</Button>
        </PageHeaderActions>
      </PageHeader>

      {appliancesQuery.isError && (
        <p role="alert" className="text-destructive">
          Could not load appliance types: {getApiErrorMessage(appliancesQuery.error, 'Please try again.')}
        </p>
      )}
      {appliancesQuery.isPending ? (
        <ApplianceCardsLoading />
      ) : appliancesQuery.data && appliances.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {appliances.map((appliance) => (
            <ApplianceCard
              key={appliance.id}
              appliance={appliance}
              onOpen={() => navigate(`/appliances/${appliance.id}`)}
              onToggle={() => void handleToggle(appliance.id)}
              isPending={setApplianceActiveMutation.isPending}
            />
          ))}
        </div>
      ) : appliancesQuery.data && (
        <Card className="min-h-40 items-center justify-center text-center">
          <p className="font-medium text-text">No appliance types found</p>
          <p className="text-sm text-text-muted">Try another search or add a custom appliance type.</p>
        </Card>
      )}

      <CreateApplianceTypeDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreate={handleCreate}
        isPending={createApplianceMutation.isPending}
        isNameAvailable={(name) => isApplianceNameAvailable(appliances, name)}
      />
    </Page>
  )
}

function ApplianceCardsLoading() {
  return (
    <div
      role="status"
      aria-label="Loading appliance types"
      aria-busy="true"
      className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: 8 }, (_, index) => (
        <Card key={index} className="gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Skeleton className="size-8 shrink-0" />
              <div className="grid min-w-0 gap-2">
                <Skeleton className="h-4 w-32 max-w-full" />
                <Skeleton className="h-3 w-24 max-w-full" />
              </div>
            </div>
            <Skeleton className="h-5 w-9 rounded-full" />
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }, (_, badgeIndex) => (
              <Skeleton key={badgeIndex} className="h-5 w-16 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-4 w-28 max-w-full" />
        </Card>
      ))}
    </div>
  )
}
