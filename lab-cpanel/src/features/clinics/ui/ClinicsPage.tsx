import { Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '../../../shared/ui/Button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../shared/ui/AlertDialog'
import { getApiErrorMessage } from '../../../shared/api/apiError'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../../../shared/ui/InputGroup'
import { Page } from '../../../shared/ui/Page'
import { PageHeader, PageHeaderActions } from '../../../shared/ui/PageHeader'
import { toast } from '../../../shared/ui/Toast'
import type { Clinic, ClinicInput } from '../domain/clinic'
import { filterClinics } from '../domain/clinic'
import {
  useCreateClinic,
  useClinics,
  useDeactivateClinic,
  useUpdateClinic,
} from '../queries/clinic.queries'
import { CreateClinicDialog } from './CreateClinicDialog'
import { ClinicTable } from './ClinicTable'

const EMPTY_CLINICS: Clinic[] = []

export function ClinicsPage() {
  const clinicsQuery = useClinics()
  const createClinicMutation = useCreateClinic()
  const updateClinicMutation = useUpdateClinic()
  const deactivateClinicMutation = useDeactivateClinic()
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null)
  const [clinicToDeactivate, setClinicToDeactivate] = useState<Clinic | null>(null)
  const clinics = clinicsQuery.data ?? EMPTY_CLINICS
  const visibleClinics = useMemo(
    () => filterClinics(clinics, searchTerm),
    [clinics, searchTerm],
  )
  const isSaving = createClinicMutation.isPending || updateClinicMutation.isPending

  async function handleSubmitClinic(input: ClinicInput) {
    try {
      if (editingClinic) {
        await updateClinicMutation.mutateAsync({
          clinicId: editingClinic.id,
          input,
        })
        toast.add({ title: 'Clinic updated', type: 'success' })
        setEditingClinic(null)
      } else {
        const clinic = await createClinicMutation.mutateAsync(input)
        toast.add({ title: 'Clinic added', description: `${clinic.name} is ready for doctors.`, type: 'success' })
        setIsCreateOpen(false)
      }
    } catch (error) {
      toast.add({
        title: editingClinic ? 'Could not update clinic' : 'Could not create clinic',
        description: getApiErrorMessage(error, 'Please try again.'),
        type: 'error',
      })
    }
  }

  async function handleSetClinicActive(clinic: Clinic) {
    if (clinic.isActive) {
      setClinicToDeactivate(clinic)
      return
    }

    try {
      await updateClinicMutation.mutateAsync({
        clinicId: clinic.id,
        input: { isActive: true },
      })
      toast.add({ title: 'Clinic reactivated', description: clinic.name, type: 'success' })
    } catch (error) {
      toast.add({
        title: 'Could not reactivate clinic',
        description: getApiErrorMessage(error, 'Please try again.'),
        type: 'error',
      })
    }
  }

  async function handleDeactivateClinic() {
    if (!clinicToDeactivate) return

    try {
      await deactivateClinicMutation.mutateAsync(clinicToDeactivate.id)
      toast.add({ title: 'Clinic deactivated', description: clinicToDeactivate.name, type: 'success' })
      setClinicToDeactivate(null)
    } catch (error) {
      toast.add({
        title: 'Could not deactivate clinic',
        description: getApiErrorMessage(error, 'Please try again.'),
        type: 'error',
      })
    }
  }

  return (
    <Page size="full">
      <PageHeader title="Clinics" description="Manage clinic contacts and the doctors linked to each clinic.">
        <PageHeaderActions>
          <InputGroup className="w-64" variant="outline">
            <InputGroupAddon><Search /></InputGroupAddon>
            <InputGroupInput value={searchTerm} onChange={(event) => setSearchTerm(event.currentTarget.value)} placeholder="Search clinics" aria-label="Search clinics" />
          </InputGroup>
          <Button onClick={() => setIsCreateOpen(true)}><Plus /> Add clinic</Button>
        </PageHeaderActions>
      </PageHeader>

      {clinicsQuery.isPending && <p role="status">Loading clinics…</p>}
      {clinicsQuery.isError && (
        <p role="alert" className="text-destructive">
          Could not load clinics: {getApiErrorMessage(clinicsQuery.error, 'Please try again.')}
        </p>
      )}
      {clinicsQuery.data && (
        <ClinicTable
          clinics={visibleClinics}
          onEdit={setEditingClinic}
          onSetActive={handleSetClinicActive}
          title={`All clinics (${visibleClinics.length})`}
        />
      )}

      {(isCreateOpen || editingClinic !== null) && (
        <CreateClinicDialog
          key={editingClinic?.id ?? 'create-clinic'}
          clinic={editingClinic ?? undefined}
          existingNames={clinics.map((clinic) => clinic.name)}
          isPending={isSaving}
          onSubmit={handleSubmitClinic}
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateOpen(false)
              setEditingClinic(null)
            }
          }}
          open
        />
      )}

      <AlertDialog
        open={clinicToDeactivate !== null}
        onOpenChange={(open) => {
          if (!open && !deactivateClinicMutation.isPending) {
            setClinicToDeactivate(null)
          }
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate clinic?</AlertDialogTitle>
            <AlertDialogDescription>
              {clinicToDeactivate?.name} will be marked inactive. You can reactivate it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deactivateClinicMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deactivateClinicMutation.isPending}
              onClick={handleDeactivateClinic}
            >
              {deactivateClinicMutation.isPending ? 'Deactivating…' : 'Deactivate'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  )
}
