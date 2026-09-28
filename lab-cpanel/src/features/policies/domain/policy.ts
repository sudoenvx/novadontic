import type { BadgeTone } from '../../../shared/ui/Badge'

export type PolicyCategory =
  | 'warranty_guarantee'
  | 'remakes_adjustments'
  | 'turnaround_rush'
  | 'quality_scans'
  | 'pricing_billing'
  | 'shipping_logistics'
  | 'compliance_data'

export type PolicyStatus = 'published' | 'draft' | 'under_review' | 'archived'

export type PolicyEnforcement = 'Strict' | 'Advisory' | 'Contractual'

export type PolicyRuleType =
  | 'condition'
  | 'requirement'
  | 'exclusion'
  | 'fee'
  | 'timeline'
  | 'recommendation'

export type PolicyRule = {
  id: string
  code?: string
  title: string
  description: string
  type?: PolicyRuleType
  highlight?: string
  tags?: string[]
}

export type PolicyCallout = {
  type: 'info' | 'warning' | 'tip' | 'destructive'
  title: string
  message: string
}

export type PolicyTable = {
  title?: string
  headers: string[]
  rows: Array<{
    values: string[]
    highlight?: boolean
  }>
}

export type PolicySection = {
  id: string
  key: string
  clauseNumber: string
  title: string
  description?: string
  rules: PolicyRule[]
  callout?: PolicyCallout
  table?: PolicyTable
}

export type PolicyRevision = {
  version: string
  date: string
  author: string
  changeSummary: string
  summary?: string
  changes: string[]
}

export type PolicyStats = {
  acknowledgedClinicsCount: number
  totalEligibleClinicsCount: number
  activeCasesCovered: number
}

export type Policy = {
  id: string
  key: string // Unique identifier key (e.g., 'remake_policy', 'warranty_guarantee')
  title: string
  shortName: string
  summary: string
  category: PolicyCategory
  status: PolicyStatus
  version: string
  effectiveDate: string
  lastUpdated: string
  lastUpdatedBy: string
  enforcementLevel: PolicyEnforcement
  applicableAppliances: string[]
  applicableAccounts: string[]
  sections: PolicySection[]
  revisions: PolicyRevision[]
  acknowledgementRequired: boolean
  stats: PolicyStats
}

export const policyCategoryLabels: Record<PolicyCategory, string> = {
  warranty_guarantee: 'Warranty & Guarantee',
  remakes_adjustments: 'Remakes & Adjustments',
  turnaround_rush: 'Turnaround & Rush Orders',
  quality_scans: 'Scan & Impression Standards',
  pricing_billing: 'Billing & Terms',
  shipping_logistics: 'Shipping & Delivery',
  compliance_data: 'Compliance & Data Privacy',
}

export function getPolicyCategoryLabel(category: PolicyCategory): string {
  return policyCategoryLabels[category] ?? category
}

export function getPolicyStatusTone(status: PolicyStatus): BadgeTone {
  switch (status) {
    case 'published':
      return 'success'
    case 'draft':
      return 'neutral'
    case 'under_review':
      return 'warning'
    case 'archived':
      return 'destructive'
  }
}

export function getPolicyStatusLabel(status: PolicyStatus): string {
  switch (status) {
    case 'published':
      return 'Published'
    case 'draft':
      return 'Draft'
    case 'under_review':
      return 'Under review'
    case 'archived':
      return 'Archived'
  }
}

export function getEnforcementTone(enforcement: PolicyEnforcement): BadgeTone {
  switch (enforcement) {
    case 'Strict':
      return 'destructive'
    case 'Contractual':
      return 'info'
    case 'Advisory':
      return 'neutral'
  }
}

export function getRuleTypeTone(type?: PolicyRuleType): BadgeTone {
  switch (type) {
    case 'requirement':
      return 'info'
    case 'exclusion':
      return 'destructive'
    case 'fee':
      return 'accent'
    case 'timeline':
      return 'warning'
    case 'condition':
      return 'neutral'
    case 'recommendation':
    default:
      return 'neutral'
  }
}

export function getPolicyByKey(policies: Policy[], key: string): Policy | undefined {
  const normalizedKey = key.trim().toLowerCase()
  return policies.find(
    (item) => item.key.toLowerCase() === normalizedKey || item.id.toLowerCase() === normalizedKey,
  )
}

export function isPolicyKeyAvailable(
  policies: Policy[],
  key: string,
  excludePolicyId?: string,
): boolean {
  const normalizedKey = key.trim().toLowerCase()
  if (!normalizedKey) return false
  return !policies.some(
    (item) =>
      item.id !== excludePolicyId && item.key.toLowerCase() === normalizedKey,
  )
}
