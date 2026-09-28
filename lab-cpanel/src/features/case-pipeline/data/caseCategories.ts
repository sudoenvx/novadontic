import type { CaseCategoryResponse } from '../api/caseCategoryResponse'
import { mapCaseCategoryResponseToCaseCategory } from '../api/mapCaseCategoryResponseToCaseCategory'

const caseCategoryResponses: CaseCategoryResponse[] = [
  {
    id: 'new',
    name: 'New case',
    description: 'A new appliance request for a patient.',
    requires_original_case: false,
    requires_reason: false,
    default_billable: true,
    default_price_rule: 'full',
    default_priority: 'Normal',
  },
  {
    id: 'refinement',
    name: 'Refinement',
    description: 'Continue or adjust an existing treatment case.',
    requires_original_case: true,
    requires_reason: false,
    default_billable: true,
    default_price_rule: 'full',
    default_priority: 'Normal',
  },
  {
    id: 'duplicate',
    name: 'Duplicate',
    description: 'Repeat an appliance request using the same prescription.',
    requires_original_case: false,
    requires_reason: false,
    default_billable: true,
    default_price_rule: 'discounted',
    default_priority: 'Normal',
  },
  {
    id: 'remake',
    name: 'Remake',
    description: 'Rebuild an existing case because the original needs replacement.',
    requires_original_case: true,
    requires_reason: true,
    default_billable: false,
    default_price_rule: 'warranty',
    default_priority: 'Rush',
  },
  {
    id: 'clear-aligner-refinement',
    name: 'Additional aligner refinement',
    description: 'A refinement set for a clear aligner treatment.',
    appliance_id: 'aligner',
    requires_original_case: true,
    requires_reason: false,
    default_billable: true,
    default_price_rule: 'discounted',
    default_priority: 'Normal',
  },
]

export const caseCategoryFixtures = caseCategoryResponses.map(mapCaseCategoryResponseToCaseCategory)
