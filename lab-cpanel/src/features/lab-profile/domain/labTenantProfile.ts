export type LabTenantMetric = {
  label: string
  value: string
}

export type LabComplianceRequirement = {
  id: string
  name: string
  description: string
  isProvided: boolean
  fileName?: string
  uploadedAt?: string
  expiresAt?: string
}

export type LabTenantActivity = {
  action: string
  actor: string
  date: string
}

export type LabTenantProfile = {
  labName: string
  planName: string
  planStatus: string
  planRenewal: string
  planPrice: string
  planInterval: string
  planSummary: string
  planFeatures: string[]
  storageUsedGb: number
  storageRate: string
  legalName: string
  licenseNumber: string
  taxId: string
  phoneNumber: string
  registeredAddress: string
  email: string
  website: string
  tenantId: string
  createdAt: string
  subdomain: string
  customDomain: string
  accountOwner: { name: string; email: string; initials: string }
  metrics: LabTenantMetric[]
  complianceRequirements: LabComplianceRequirement[]
  activity: LabTenantActivity[]
}
