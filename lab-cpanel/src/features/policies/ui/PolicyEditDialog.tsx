import { useState } from 'react'

import { Button } from '../../../shared/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/ui/Dialog'
import { Input } from '../../../shared/ui/Input'
import { Label } from '../../../shared/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/ui/Select'
import { Textarea } from '../../../shared/ui/Textarea'
import { toast } from '../../../shared/ui/Toast'
import {
  isPolicyKeyAvailable,
  type Policy,
  type PolicyCategory,
  type PolicyEnforcement,
  type PolicyStatus,
} from '../domain/policy'

type PolicyEditDialogProps = {
  policy: Policy
  allPolicies: Policy[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updatedPolicy: Policy) => void
}

export function PolicyEditDialog({
  policy,
  allPolicies,
  open,
  onOpenChange,
  onSave,
}: PolicyEditDialogProps) {
  const [title, setTitle] = useState(policy.title)
  const [key, setKey] = useState(policy.key)
  const [shortName, setShortName] = useState(policy.shortName)
  const [summary, setSummary] = useState(policy.summary)
  const [category, setCategory] = useState<PolicyCategory>(policy.category)
  const [status, setStatus] = useState<PolicyStatus>(policy.status)
  const [enforcementLevel, setEnforcementLevel] = useState<PolicyEnforcement>(
    policy.enforcementLevel,
  )
  const [version, setVersion] = useState(policy.version)
  const [error, setError] = useState('')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const trimmedTitle = title.trim()
    const trimmedKey = key.trim().toLowerCase().replace(/\s+/g, '_')

    if (!trimmedTitle) {
      setError('Policy title is required.')
      return
    }
    if (!trimmedKey) {
      setError('Unique key identifier is required.')
      return
    }
    if (!isPolicyKeyAvailable(allPolicies, trimmedKey, policy.id)) {
      setError('This unique key is already in use by another policy.')
      return
    }

    const updated: Policy = {
      ...policy,
      title: trimmedTitle,
      key: trimmedKey,
      shortName: shortName.trim() || trimmedTitle,
      summary: summary.trim(),
      category,
      status,
      enforcementLevel,
      version: version.trim() || policy.version,
      lastUpdated: new Date().toISOString().split('T')[0],
      lastUpdatedBy: 'Current Lab Administrator',
    }

    onSave(updated)
    toast.add({
      title: 'Policy updated',
      description: `Changes to "${updated.title}" have been saved.`,
      type: 'success',
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Policy Details</DialogTitle>
          <DialogDescription>
            Update the policy metadata, key identifier, and enforcement rules.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-3 py-2 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <Label htmlFor="policy-key" className="text-2xs font-semibold">
                Unique Key Identifier <span className="text-destructive">*</span>
              </Label>
              <Input
                id="policy-key"
                value={key}
                onChange={(e) => {
                  setKey(e.target.value)
                  setError('')
                }}
                placeholder="e.g. remake_policy"
                className="font-mono text-xs"
              />
              <p className="text-3xs text-text-muted">Unique database lookup key.</p>
            </div>

            <div className="grid gap-1">
              <Label htmlFor="policy-version" className="text-2xs font-semibold">
                Version
              </Label>
              <Input
                id="policy-version"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="e.g. v2.4"
                className="font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid gap-1">
            <Label htmlFor="policy-title" className="text-2xs font-semibold">
              Policy Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="policy-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setError('')
              }}
              placeholder="e.g. Remake & Clinical Adjustment Policy"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <Label htmlFor="policy-short-name" className="text-2xs font-semibold">
                Short Display Name
              </Label>
              <Input
                id="policy-short-name"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="e.g. Remakes & Adjustments"
              />
            </div>

            <div className="grid gap-1">
              <Label className="text-2xs font-semibold">Policy Category</Label>
              <Select
                items={[
                  { value: 'remakes_adjustments', label: 'Remakes & Adjustments' },
                  { value: 'warranty_guarantee', label: 'Warranty & Guarantee' },
                  { value: 'turnaround_rush', label: 'Turnaround & Rush' },
                  { value: 'quality_scans', label: 'Scan & Impression' },
                  { value: 'pricing_billing', label: 'Billing & Terms' },
                  { value: 'shipping_logistics', label: 'Shipping & Delivery' },
                ]}
                value={category}
                onValueChange={(val) =>
                  setCategory((val ?? 'remakes_adjustments') as PolicyCategory)
                }
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remakes_adjustments">Remakes & Adjustments</SelectItem>
                  <SelectItem value="warranty_guarantee">Warranty & Guarantee</SelectItem>
                  <SelectItem value="turnaround_rush">Turnaround & Rush</SelectItem>
                  <SelectItem value="quality_scans">Scan & Impression</SelectItem>
                  <SelectItem value="pricing_billing">Billing & Terms</SelectItem>
                  <SelectItem value="shipping_logistics">Shipping & Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <Label className="text-2xs font-semibold">Enforcement Level</Label>
              <Select
                items={[
                  { value: 'Strict', label: 'Strict' },
                  { value: 'Contractual', label: 'Contractual' },
                  { value: 'Advisory', label: 'Advisory' },
                ]}
                value={enforcementLevel}
                onValueChange={(val) =>
                  setEnforcementLevel((val ?? 'Strict') as PolicyEnforcement)
                }
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Strict">Strict</SelectItem>
                  <SelectItem value="Contractual">Contractual</SelectItem>
                  <SelectItem value="Advisory">Advisory</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1">
              <Label className="text-2xs font-semibold">Publication Status</Label>
              <Select
                items={[
                  { value: 'published', label: 'Published' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'under_review', label: 'Under review' },
                  { value: 'archived', label: 'Archived' },
                ]}
                value={status}
                onValueChange={(val) =>
                  setStatus((val ?? 'published') as PolicyStatus)
                }
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="under_review">Under review</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1">
            <Label htmlFor="policy-summary" className="text-2xs font-semibold">
              Executive Summary
            </Label>
            <Textarea
              id="policy-summary"
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief summary of policy coverage and expectations..."
            />
          </div>

          {error && (
            <p className="text-2xs text-destructive font-medium" role="alert">
              {error}
            </p>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="neutral"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
