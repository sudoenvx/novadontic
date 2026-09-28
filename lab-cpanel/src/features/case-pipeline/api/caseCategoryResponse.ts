import type { CaseBillingRule } from '../domain/caseCategory'
import type { CasePipelinePriority } from '../domain/casePipeline'

export type CaseCategoryResponse = {
  id: string
  name: string
  description: string
  appliance_id?: string | null
  requires_original_case: boolean
  requires_reason: boolean
  default_billable: boolean
  default_price_rule: CaseBillingRule
  default_priority: CasePipelinePriority
}
