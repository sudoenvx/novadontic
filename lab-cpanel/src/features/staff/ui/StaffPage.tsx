import { Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/apiError'
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../shared/ui/AlertDialog'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../../../shared/ui/InputGroup'
import { Skeleton } from '../../../shared/ui/Skeleton'
import { Page } from '../../../shared/ui/Page'
import { PageHeader, PageHeaderActions } from '../../../shared/ui/PageHeader'
import { toast } from '../../../shared/ui/Toast'
import { filterStaff, isOwner, type Staff } from '../domain/staff'
import {
  useAssignableStaffRoles,
  useCreateStaff,
  useDeleteStaff,
  useSetStaffActive,
  useStaff,
  useUpdateStaff,
} from '../queries/staff.queries'
import { StaffFormDialog, type StaffFormValues } from './StaffFormDialog'
import { StaffTable } from './StaffTable'

export function StaffPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff>()
  const [staffToDelete, setStaffToDelete] = useState<Staff>()
  const staffQuery = useStaff()
  const rolesQuery = useAssignableStaffRoles()
  const createMutation = useCreateStaff()
  const updateMutation = useUpdateStaff()
  const statusMutation = useSetStaffActive()
  const deleteMutation = useDeleteStaff()
  const visibleStaff = useMemo(
    () => filterStaff(staffQuery.data?.data ?? [], searchTerm),
    [staffQuery.data?.data, searchTerm],
  )
  const staff = staffQuery.data?.data ?? []
  const activeCount = staff.filter((member) => member.isActive).length
  const suspendedCount = staff.length - activeCount
  const isSaving = createMutation.isPending || updateMutation.isPending
  const rolesError = rolesQuery.isError
    ? getApiErrorMessage(rolesQuery.error, 'Unable to load assignable roles.')
    : undefined

  function handleSubmit(values: StaffFormValues) {
    if (editingStaff) {
      updateMutation.mutate(
        {
          staffId: editingStaff.id,
          input: {
            fullName: values.fullName,
            email: values.email,
            phone: values.phone || null,
            roleIds: values.roleIds,
          },
        },
        {
          onSuccess: (member) => {
            setEditingStaff(undefined)
            toast.add({
              title: 'Staff profile updated',
              description: `${member.fullName}’s account was updated.`,
              type: 'success',
            })
          },
          onError: (error) => showMutationError('Unable to update staff member', error),
        },
      )
      return
    }

    createMutation.mutate(
      {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phone: values.phone || null,
        roleIds: values.roleIds,
      },
      {
        onSuccess: (member) => {
          setIsFormOpen(false)
          toast.add({
            title: 'Staff member added',
            description: `${member.fullName} now has access to the lab workspace.`,
            type: 'success',
          })
        },
        onError: (error) => showMutationError('Unable to create staff account', error),
      },
    )
  }

  function handleStatusChange(member: Staff, isActive: boolean) {
    statusMutation.mutate(
      { staffId: member.id, isActive },
      {
        onSuccess: (updatedMember) =>
          toast.add({
            title: isActive ? 'Staff access restored' : 'Staff access suspended',
            description: updatedMember.fullName,
            type: 'success',
          }),
        onError: (error) => showMutationError('Unable to update staff access', error),
      },
    )
  }

  function handleDelete() {
    if (!staffToDelete || isOwner(staffToDelete)) return
    deleteMutation.mutate(staffToDelete.id, {
      onSuccess: () => {
        toast.add({
          title: 'Staff account deleted',
          description: `${staffToDelete.fullName} was removed.`,
          type: 'success',
        })
        setStaffToDelete(undefined)
      },
      onError: (error) => showMutationError('Unable to delete staff account', error),
    })
  }

  function showMutationError(title: string, error: unknown) {
    toast.add({
      title,
      description: getApiErrorMessage(error, 'Please try again.'),
      type: 'error',
    })
  }

  return (
    <Page size="full">
      <PageHeader title="Staff" description="Manage user accounts and access to your lab workspace.">
        <PageHeaderActions>
          <InputGroup className="w-64" variant="outline">
            <InputGroupAddon><Search /></InputGroupAddon>
            <InputGroupInput
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.currentTarget.value)}
              placeholder="Search staff"
              aria-label="Search staff"
            />
          </InputGroup>
          <Button
            onClick={() => {
              setEditingStaff(undefined)
              setIsFormOpen(true)
            }}
            disabled={rolesQuery.isPending || rolesQuery.isError || !rolesQuery.data?.length}
          >
            <Plus /> Add staff
          </Button>
        </PageHeaderActions>
      </PageHeader>

      {staffQuery.isError && (
        <p role="alert" className="text-sm text-destructive">
          Could not load staff: {getApiErrorMessage(staffQuery.error, 'Please try again.')}
        </p>
      )}
      {rolesQuery.isError && (
        <p role="alert" className="text-sm text-destructive">
          Could not load role options: {rolesError}
        </p>
      )}

      {(staffQuery.data || staffQuery.isPending) && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {staffQuery.isPending ? (
              <>
                <StaffMetricLoading />
                <StaffMetricLoading />
              </>
            ) : (
              <>
                <StaffMetric label="Active staff" value={activeCount} tone="text-primary" />
                <StaffMetric label="Suspended access" value={suspendedCount} tone="text-secondary" />
              </>
            )}
          </div>
          <StaffTable
            staff={visibleStaff}
            loading={staffQuery.isPending}
            onEdit={setEditingStaff}
            onDelete={setStaffToDelete}
            onStatusChange={handleStatusChange}
            title={staffQuery.data ? `All staff (${visibleStaff.length})` : 'All staff'}
          />
        </>
      )}

      <StaffFormDialog
        key={editingStaff?.id ?? 'new-staff-form'}
        mode={editingStaff ? 'edit' : 'create'}
        open={isFormOpen || editingStaff !== undefined}
        staff={editingStaff}
        roles={rolesQuery.data ?? []}
        rolesError={rolesError}
        isPending={isSaving}
        onOpenChange={(open) => {
          if (!open) {
            setIsFormOpen(false)
            setEditingStaff(undefined)
          }
        }}
        onSubmit={handleSubmit}
      />

      <AlertDialog
        open={staffToDelete !== undefined}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setStaffToDelete(undefined)
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete staff account?</AlertDialogTitle>
            <AlertDialogDescription>
              {staffToDelete?.fullName} will lose access to the workspace. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={handleDelete}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete account'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  )
}

function StaffMetric({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: string
}) {
  return (
    <Card className="gap-0">
      <p className={`text-lg font-semibold ${tone}`}>{value}</p>
      <p className="text-2xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
    </Card>
  )
}

function StaffMetricLoading() {
  return (
    <Card className="gap-1" role="status" aria-label="Loading staff metrics">
      <Skeleton className="h-6 w-12" />
      <Skeleton className="h-3 w-28" />
    </Card>
  )
}
