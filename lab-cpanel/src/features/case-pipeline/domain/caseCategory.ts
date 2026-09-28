import type { CasePipelinePriority } from './casePipeline'

export type CaseBillingRule = 'full' | 'discounted' | 'free' | 'warranty'

export type CaseCategory = {
  id: string
  name: string
  description: string
  applianceId?: string
  requiresOriginalCase: boolean
  requiresReason: boolean
  defaultBillable: boolean
  defaultPriceRule: CaseBillingRule
  defaultPriority: CasePipelinePriority
}

export function getCaseCategoriesForAppliance(
  categories: CaseCategory[],
  applianceId: string,
) {
  return categories.filter(
    (category) => !category.applianceId || category.applianceId === applianceId,
  )
}

export function getCaseBillingRuleLabel(rule: CaseBillingRule) {
  return {
    full: 'Full price',
    discounted: 'Discounted',
    free: 'Free',
    warranty: 'Warranty',
  }[rule]
}

export function isCasePriceRuleBillable(rule: CaseBillingRule) {
  return rule === 'full' || rule === 'discounted'
}
