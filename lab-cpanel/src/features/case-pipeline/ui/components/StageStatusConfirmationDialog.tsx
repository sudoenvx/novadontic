import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../../shared/ui/AlertDialog'

type StageStatusConfirmationDialogProps = {
  open: boolean
  stepName?: string
  status?: 'active' | 'completed'
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function StageStatusConfirmationDialog({
  open,
  stepName,
  status,
  onOpenChange,
  onConfirm,
}: StageStatusConfirmationDialogProps) {
  if (!status) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {status === 'completed' ? 'Mark stage as done?' : 'Reopen this stage?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {status === 'completed'
              ? `Mark ${stepName} as complete and move the workflow forward?`
              : `Reopen ${stepName} and make it the active stage?`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="solid" onClick={onConfirm}>
            {status === 'completed' ? 'Mark done' : 'Reopen stage'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
