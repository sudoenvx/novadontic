import type {
  Appliance,
  ApplianceField,
  ApplianceFieldGroup,
  ApplianceFieldInput,
  ApplianceFieldGroupInput,
  ApplianceTypeInput,
} from '../domain/appliance'
import type {
  ApplianceFieldGroupResponseDto,
  ApplianceFieldResponseDto,
  ApplianceResponseDto,
} from './appliance.dto'

export function mapApplianceResponseDtoToAppliance(
  response: ApplianceResponseDto,
): Appliance {
  return {
    id: response.id,
    code: response.code,
    name: response.name,
    source: response.source,
    color: response.color,
    isActive: response.isActive,
    casesUsing: null,
    groups: response.fieldGroups.map(mapApplianceFieldGroupResponseDto),
  }
}

export function mapApplianceFieldGroupResponseDto(
  response: ApplianceFieldGroupResponseDto,
): ApplianceFieldGroup {
  return {
    id: response.id,
    name: response.name,
    sortOrder: response.sortOrder,
    fields: response.fields.map(mapApplianceFieldResponseDto),
  }
}

export function mapApplianceFieldResponseDto(
  response: ApplianceFieldResponseDto,
): ApplianceField {
  return {
    ...response,
  }
}

export function mapApplianceTypeInputToDto(
  input: Partial<ApplianceTypeInput>,
) {
  return {
    name: input.name,
    color: input.color,
  }
}

export function mapApplianceGroupInputToDto(
  input: ApplianceFieldGroupInput,
) {
  return {
    name: input.name,
    sortOrder: input.sortOrder,
  }
}

export function mapApplianceFieldInputToDto(input: ApplianceFieldInput) {
  return {
    key: input.key,
    label: input.label,
    type: input.type,
    options: input.options,
    defaultValue: input.defaultValue,
    dependsOn: input.dependsOn,
    dependsOnValue: input.dependsOnValue,
    required: input.required,
    sortOrder: input.sortOrder,
    helpText: input.helpText,
  }
}
