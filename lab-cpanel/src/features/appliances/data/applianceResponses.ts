import type { Appliance, ApplianceFieldGroup } from '../domain/appliance'

export type ApplianceFieldGroupResponse = ApplianceFieldGroup

export type ApplianceResponse = Omit<Appliance, 'groups'> & {
  fieldGroups: ApplianceFieldGroupResponse[]
}

export function toAppliance(response: ApplianceResponse): Appliance {
  const { fieldGroups, ...appliance } = response

  return {
    ...appliance,
    groups: fieldGroups.map((group) => ({ ...group })),
  }
}
