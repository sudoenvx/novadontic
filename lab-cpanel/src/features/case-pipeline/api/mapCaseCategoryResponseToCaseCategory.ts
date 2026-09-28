import type { CaseCategoryResponse } from './caseCategoryResponse'
import type { CaseCategory } from '../domain/caseCategory'

export function mapCaseCategoryResponseToCaseCategory(
  response: CaseCategoryResponse,
): CaseCategory {
  return {
    id: response.id,
    name: response.name,
    description: response.description,
    applianceId: response.appliance_id ?? undefined,
    requiresOriginalCase: response.requires_original_case,
    requiresReason: response.requires_reason,
    defaultBillable: response.default_billable,
    defaultPriceRule: response.default_price_rule,
    defaultPriority: response.default_priority,
  }
}
