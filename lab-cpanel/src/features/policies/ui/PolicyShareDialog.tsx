import { Check, Copy, Link as LinkIcon, Mail, ShieldCheck } from 'lucide-react'
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
import { toast } from '../../../shared/ui/Toast'
import type { Policy } from '../domain/policy'

type PolicyShareDialogProps = {
  policy: Policy
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PolicyShareDialog({
  policy,
  open,
  onOpenChange,
}: PolicyShareDialogProps) {
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)

  const shareUrl = `${window.location.origin}/policies/${policy.key}`

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl)
    setCopiedLink(true)
    toast.add({
      title: 'Link copied',
      description: 'Policy URL copied to clipboard.',
      type: 'success',
    })
    setTimeout(() => setCopiedLink(false), 2000)
  }

  function handleCopyKey() {
    navigator.clipboard.writeText(policy.key)
    setCopiedKey(true)
    toast.add({
      title: 'Key copied',
      description: `Policy unique key "${policy.key}" copied to clipboard.`,
      type: 'success',
    })
    setTimeout(() => setCopiedKey(false), 2000)
  }

  function handleSendBroadcast() {
    toast.add({
      title: 'Acknowledgement notice queued',
      description: `Policy update notification sent to all ${policy.stats.totalEligibleClinicsCount} affiliated clinics.`,
      type: 'success',
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            <span>Share & Broadcast Policy</span>
          </DialogTitle>
          <DialogDescription>
            Distribute this policy to doctor accounts, or copy the direct API/database key.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2 text-xs">
          <div className="grid gap-1">
            <Label className="text-2xs font-semibold">Unique Key</Label>
            <div className="flex items-center gap-1.5">
              <Input
                readOnly
                value={policy.key}
                className="bg-surface-soft font-mono text-xs"
              />
              <Button
                type="button"
                variant="neutral"
                size="sm"
                onClick={handleCopyKey}
                className="shrink-0 gap-1"
              >
                {copiedKey ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                <span>{copiedKey ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>
          </div>

          <div className="grid gap-1">
            <Label className="text-2xs font-semibold">Direct Policy Link</Label>
            <div className="flex items-center gap-1.5">
              <Input
                readOnly
                value={shareUrl}
                className="bg-surface-soft text-xs"
              />
              <Button
                type="button"
                variant="neutral"
                size="sm"
                onClick={handleCopyLink}
                className="shrink-0 gap-1"
              >
                {copiedLink ? <Check size={13} className="text-success" /> : <LinkIcon size={13} />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>
          </div>

          <div className="space-y-1 rounded-sm border border-border bg-surface-soft p-2.5">
            <div className="flex items-center justify-between text-2xs">
              <span className="font-semibold text-text">Clinic Acknowledgements</span>
              <span className="font-mono font-medium text-text">
                {policy.stats.acknowledgedClinicsCount} / {policy.stats.totalEligibleClinicsCount} Clinics
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{
                  width: `${(policy.stats.acknowledgedClinicsCount / policy.stats.totalEligibleClinicsCount) * 100}%`,
                }}
              />
            </div>
            <p className="text-3xs text-text-muted">
              Clinics are prompted to review and acknowledge whenever a new major version is released.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="neutral"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button type="button" onClick={handleSendBroadcast} className="gap-1.5">
            <Mail size={13} />
            <span>Notify Clinics</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
