import { Badge, type BadgeTone } from '../../../shared/ui/Badge'
import { Card, CardHeader, CardTitle } from '../../../shared/ui/Card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../shared/ui/Table'
import type { DoctorCaseHistory as DoctorCase } from '../domain/doctorDetails'

const caseStatusTone: Record<DoctorCase['status'], BadgeTone> = {
  'In production': 'info',
  'Quality check': 'warning',
  Delivered: 'success',
  'Needs attention': 'destructive',
}

export function DoctorCaseHistory({ cases }: { cases: DoctorCase[] }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Cases history</CardTitle>
      </CardHeader>
      {cases.length > 0 ? (
        <div className="overflow-x-auto">
          <Table className="min-w-[620px]">
            <TableHeader>
              <TableRow>
                <TableHead>Case</TableHead>
                <TableHead>Appliance</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((doctorCase) => (
                <TableRow key={doctorCase.id}>
                  <TableCell>
                    <p className="font-semibold text-text">{doctorCase.id}</p>
                    <p className="text-text-muted">{doctorCase.patientName}</p>
                  </TableCell>
                  <TableCell className="text-secondary">{doctorCase.applianceType}</TableCell>
                  <TableCell className="text-secondary">{doctorCase.stage}</TableCell>
                  <TableCell>
                    <Badge tone={caseStatusTone[doctorCase.status]}>{doctorCase.status}</Badge>
                  </TableCell>
                  <TableCell className="text-secondary">{doctorCase.updatedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="px-2 py-6 text-center text-sm text-text-muted">No case history yet.</p>
      )}
    </Card>
  )
}
