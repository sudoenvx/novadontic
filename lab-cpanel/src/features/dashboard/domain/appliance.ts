export type Appliance = {
  name: string
  color?: string
}

export function isApplianceNameAvailable(
  appliances: Appliance[],
  candidateName: string,
) {
  const normalizedName = candidateName.trim().toLowerCase()

  return normalizedName.length > 0 && !appliances.some(
    (appliance) => appliance.name.toLowerCase() === normalizedName,
  )
}
