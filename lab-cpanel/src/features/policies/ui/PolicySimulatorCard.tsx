import { Calculator, CheckCircle2, AlertTriangle, XCircle, Sparkles } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '../../../shared/ui/Badge'
import { Card, CardHeader, CardTitle } from '../../../shared/ui/Card'
import { Label } from '../../../shared/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/ui/Select'
import type { Policy } from '../domain/policy'

type PolicySimulatorCardProps = {
  policy: Policy
}

export function PolicySimulatorCard({ policy }: PolicySimulatorCardProps) {
  const [appliance, setAppliance] = useState('aligner')
  const [daysSinceDelivery, setDaysSinceDelivery] = useState('14')
  const [reason, setReason] = useState('defect')
  const [hasNewScan, setHasNewScan] = useState('yes')

  // Calculate result based on rules
  const days = Number(daysSinceDelivery)
  const isPast30Days = days > 30

  let coverageTone: 'success' | 'warning' | 'destructive' = 'success'
  let coverageLabel = '100% Free Warranty'
  let priorityLabel = 'Rush (3 Business Days)'
  let notes = 'Lab manufacturing defect covered under full warranty.'
  let requiresOriginalCase = true

  if (isPast30Days) {
    coverageTone = 'destructive'
    coverageLabel = 'Expired (Full Price)'
    priorityLabel = 'Standard Turnaround'
    notes = 'Claim submitted after the 30-day warranty window.'
  } else if (reason === 'defect') {
    coverageTone = 'success'
    coverageLabel = '100% Free (Warranty)'
    priorityLabel = 'Rush (3 Days)'
    notes = 'Manufacturing or trimming defect fully covered by lab.'
  } else if (reason === 'fit_issue') {
    if (hasNewScan === 'yes') {
      coverageTone = 'success'
      coverageLabel = '100% Free (Warranty)'
      priorityLabel = 'Rush (3 Days)'
      notes = 'Fit issue verified with fresh intraoral scan.'
    } else {
      coverageTone = 'warning'
      coverageLabel = 'Pending Scan Verification'
      priorityLabel = 'Standard'
      notes = 'New intraoral scan required before warranty clearance.'
    }
  } else if (reason === 'rx_change' || reason === 'restoration') {
    coverageTone = 'warning'
    coverageLabel = '50% Discounted Rate'
    priorityLabel = 'Standard (5 Days)'
    notes = 'Clinical prescription modification or new dental restoration.'
  } else if (reason === 'loss_breakage') {
    coverageTone = 'destructive'
    coverageLabel = 'Full Price (Duplicate)'
    priorityLabel = 'Standard (Rush optional)'
    notes = 'Patient loss or accidental breakage outside warranty.'
    requiresOriginalCase = false
  }

  if (policy.key !== 'remake_policy') {
    return (
      <Card className="gap-2.5 bg-neutral-50/70 border-border text-xs">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-primary" />
          <span className="font-semibold text-text">Policy Rule Checker</span>
        </div>
        <p className="text-text-muted text-2xs leading-relaxed">
          This policy governs {policy.applicableAppliances.join(', ')} with {policy.enforcementLevel.toLowerCase()} enforcement across all {policy.applicableAccounts.join(', ')}.
        </p>
        <div className="flex items-center justify-between pt-1 border-t border-border-soft text-2xs">
          <span className="text-text-muted">Unique Key:</span>
          <code className="font-mono text-primary font-medium">{policy.key}</code>
        </div>
      </Card>
    )
  }

  return (
    <Card className="gap-3 border-primary/20 bg-neutral-50/50">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-1.5 text-xs font-semibold">
            <Calculator size={14} className="text-primary" />
            <span>Remake Rule Simulator</span>
          </CardTitle>
          <Badge tone="accent">Interactive</Badge>
        </div>
        <p className="text-2xs text-text-muted">
          Simulate qualification, fee tier, and turnaround SLA.
        </p>
      </CardHeader>

      <div className="grid gap-2 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-2xs font-medium mb-1 block">Appliance</Label>
            <Select
              items={[
                { value: 'aligner', label: 'Aligner' },
                { value: 'retainer', label: 'Retainer' },
                { value: 'splint', label: 'Splint / Guard' },
              ]}
              value={appliance}
              onValueChange={(val) => setAppliance(val ?? 'aligner')}
            >
              <SelectTrigger size="sm" className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aligner">Aligner</SelectItem>
                <SelectItem value="retainer">Retainer</SelectItem>
                <SelectItem value="splint">Splint / Guard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-2xs font-medium mb-1 block">Remake Reason</Label>
            <Select
              items={[
                { value: 'defect', label: 'Lab defect' },
                { value: 'fit_issue', label: 'Fit issue' },
                { value: 'rx_change', label: 'Rx changed' },
                { value: 'restoration', label: 'New anatomy' },
                { value: 'loss_breakage', label: 'Patient lost' },
              ]}
              value={reason}
              onValueChange={(val) => setReason(val ?? 'defect')}
            >
              <SelectTrigger size="sm" className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="defect">Lab defect</SelectItem>
                <SelectItem value="fit_issue">Fit issue</SelectItem>
                <SelectItem value="rx_change">Rx changed</SelectItem>
                <SelectItem value="restoration">New anatomy</SelectItem>
                <SelectItem value="loss_breakage">Patient lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-2xs font-medium mb-1 block">Days Since Delivery</Label>
            <Select
              items={[
                { value: '7', label: '7 days (Within 30d)' },
                { value: '14', label: '14 days (Within 30d)' },
                { value: '28', label: '28 days (Within 30d)' },
                { value: '45', label: '45 days (>30d window)' },
                { value: '60', label: '60 days (>30d window)' },
              ]}
              value={daysSinceDelivery}
              onValueChange={(val) => setDaysSinceDelivery(val ?? '14')}
            >
              <SelectTrigger size="sm" className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="28">28 days</SelectItem>
                <SelectItem value="45">45 days (Expired)</SelectItem>
                <SelectItem value="60">60 days (Expired)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-2xs font-medium mb-1 block">New Scan Provided?</Label>
            <Select
              items={[
                { value: 'yes', label: 'Yes (Recent)' },
                { value: 'no', label: 'No (Same scan)' },
              ]}
              value={hasNewScan}
              onValueChange={(val) => setHasNewScan(val ?? 'yes')}
            >
              <SelectTrigger size="sm" className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes (Recent)</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Calculated Result Card */}
        <div className="mt-1 rounded-sm border border-border bg-surface p-2.5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-medium text-text-muted">Calculated Tier:</span>
            <Badge tone={coverageTone} className="font-medium">
              {coverageLabel}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-2xs pt-1.5 border-t border-border-soft">
            <div>
              <span className="text-text-muted">Priority SLA:</span>
              <p className="font-medium text-text">{priorityLabel}</p>
            </div>
            <div>
              <span className="text-text-muted">Original Case ID:</span>
              <p className="font-medium text-text">{requiresOriginalCase ? 'Required' : 'Optional'}</p>
            </div>
          </div>

          <p className="text-2xs text-text-muted pt-1 border-t border-border-soft leading-relaxed flex items-start gap-1">
            {coverageTone === 'success' ? (
              <CheckCircle2 size={12} className="text-success shrink-0 mt-0.5" />
            ) : coverageTone === 'warning' ? (
              <AlertTriangle size={12} className="text-warning shrink-0 mt-0.5" />
            ) : (
              <XCircle size={12} className="text-destructive shrink-0 mt-0.5" />
            )}
            <span>{notes}</span>
          </p>
        </div>
      </div>
    </Card>
  )
}
