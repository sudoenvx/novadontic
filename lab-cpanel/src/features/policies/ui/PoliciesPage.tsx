import {
  BookOpen,
  ChevronRight,
  FileCheck,
  Key,
  Plus,
  Search,
  Shield,
  ShieldCheck,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { PageHeader, PageHeaderActions } from '../../../shared/ui/PageHeader'
import { Badge } from '../../../shared/ui/Badge'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { FilterTabs, FilterTabsList, FilterTab } from '../../../shared/ui/FilterTabs'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '../../../shared/ui/InputGroup'
import { Page } from '../../../shared/ui/Page'
import { toast } from '../../../shared/ui/Toast'
import { policyFixtures } from '../data/policies'
import {
  getEnforcementTone,
  getPolicyStatusLabel,
  getPolicyStatusTone,
  type Policy,
} from '../domain/policy'
import { PolicyEditDialog } from './PolicyEditDialog'

export function PoliciesPage() {
  const navigate = useNavigate()
  const [policies, setPolicies] = useState<Policy[]>(policyFixtures)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)

  const filteredPolicies = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return policies.filter((policy) => {
      const matchesSearch =
        !query ||
        policy.title.toLowerCase().includes(query) ||
        policy.key.toLowerCase().includes(query) ||
        policy.summary.toLowerCase().includes(query) ||
        policy.applicableAppliances.some((a) => a.toLowerCase().includes(query))

      const matchesCategory =
        selectedCategory === 'all' || policy.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [policies, searchTerm, selectedCategory])

  // Aggregate stats
  const totalPolicies = policies.length
  const publishedCount = policies.filter((p) => p.status === 'published').length
  const totalClauses = policies.reduce((acc, p) => acc + p.sections.length, 0)
  const averageCompliance = Math.round(
    policies.reduce(
      (acc, p) =>
        acc +
        (p.stats.acknowledgedClinicsCount / p.stats.totalEligibleClinicsCount) *
          100,
      0,
    ) / policies.length,
  )

  const newPolicyTemplate: Policy = {
    id: `pol-${Date.now()}`,
    key: `new_policy_${Date.now().toString().slice(-4)}`,
    title: 'New Lab Operating Policy',
    shortName: 'New Policy',
    summary: 'Define operating guidelines and terms for lab cases.',
    category: 'remakes_adjustments',
    status: 'draft',
    version: 'v1.0',
    effectiveDate: new Date().toISOString().split('T')[0],
    lastUpdated: new Date().toISOString().split('T')[0],
    lastUpdatedBy: 'Current Lab Administrator',
    enforcementLevel: 'Contractual',
    applicableAppliances: ['All Appliances'],
    applicableAccounts: ['All Clinics'],
    acknowledgementRequired: true,
    stats: {
      acknowledgedClinicsCount: 0,
      totalEligibleClinicsCount: 52,
      activeCasesCovered: 0,
    },
    sections: [
      {
        id: 'sec-1',
        key: 'general_terms',
        clauseNumber: '1.0',
        title: 'General Terms & Scope',
        description: 'Scope and applicability of this policy.',
        rules: [
          {
            id: 'rule-1',
            code: 'POL-101',
            title: 'Standard Compliance Rule',
            description: 'Cases submitted under this policy adhere to standard operating criteria.',
            type: 'requirement',
          },
        ],
      },
    ],
    revisions: [
      {
        version: 'v1.0',
        date: new Date().toISOString().split('T')[0],
        author: 'Current Lab Administrator',
        changeSummary: 'Initial policy creation.',
        changes: ['Initial draft created.'],
      },
    ],
  }

  function handleCreatePolicy(created: Policy) {
    setPolicies((current) => [created, ...current])
    toast.add({
      title: 'Policy created',
      description: `"${created.title}" is ready.`,
      type: 'success',
    })
    navigate(`/policies/${created.key}`)
  }

  return (
    <Page size="full" className="gap-3.5 max-w-7xl mx-auto">
      <PageHeader
        title="Lab Policies & Terms"
        description="Standard operating policies, warranty terms, remake rules, and turnaround schedules."
      >
        <PageHeaderActions>
          <Button onClick={() => setIsNewDialogOpen(true)} className="gap-1.5">
            <Plus size={14} />
            <span>Create Policy</span>
          </Button>
        </PageHeaderActions>
      </PageHeader>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 bg-surface border-border">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-medium text-text-muted uppercase tracking-wider">
              Total Policies
            </span>
            <BookOpen size={14} className="text-primary" />
          </div>
          <p className="mt-1 text-xl font-bold text-text font-mono">
            {totalPolicies}
          </p>
          <p className="text-3xs text-text-muted mt-0.5">
            {publishedCount} Active & Published
          </p>
        </Card>

        <Card className="p-3 bg-surface border-border">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-medium text-text-muted uppercase tracking-wider">
              Total Clauses
            </span>
            <FileCheck size={14} className="text-accent" />
          </div>
          <p className="mt-1 text-xl font-bold text-text font-mono">
            {totalClauses}
          </p>
          <p className="text-3xs text-text-muted mt-0.5">
            Standardized rules across lab
          </p>
        </Card>

        <Card className="p-3 bg-surface border-border">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-medium text-text-muted uppercase tracking-wider">
              Avg Acknowledgement
            </span>
            <ShieldCheck size={14} className="text-success" />
          </div>
          <p className="mt-1 text-xl font-bold text-text font-mono">
            {averageCompliance}%
          </p>
          <p className="text-3xs text-text-muted mt-0.5">
            Across 52 registered clinics
          </p>
        </Card>

        <Card className="p-3 bg-surface border-border">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-medium text-text-muted uppercase tracking-wider">
              Enforcement Level
            </span>
            <Shield size={14} className="text-warning" />
          </div>
          <p className="mt-1 text-xl font-bold text-text">
            Contractual
          </p>
          <p className="text-3xs text-text-muted mt-0.5">
            Bound upon case submission
          </p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <FilterTabs
          value={selectedCategory}
          onValueChange={(val) => setSelectedCategory(val || 'all')}
        >
          <FilterTabsList>
            <FilterTab value="all">All Policies ({totalPolicies})</FilterTab>
            <FilterTab value="remakes_adjustments">Remakes & Adjustments</FilterTab>
            <FilterTab value="warranty_guarantee">Warranty</FilterTab>
            <FilterTab value="turnaround_rush">Turnaround & Rush</FilterTab>
            <FilterTab value="pricing_billing">Billing</FilterTab>
          </FilterTabsList>
        </FilterTabs>

        <div className="w-full sm:w-72">
          <InputGroup size="sm" variant="outline">
            <InputGroupAddon align="inline-start">
              <Search size={14} className="text-text-muted" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search by title, unique key, appliance..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>
      </div>

      {/* Policy Grid Cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filteredPolicies.map((policy) => (
          <Card
            key={policy.id}
            className="group/pol relative flex flex-col justify-between gap-3 p-4 transition-all hover:border-primary/40 hover:shadow-sm cursor-pointer"
            onClick={() => navigate(`/policies/${policy.key}`)}
          >
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <Badge tone={getPolicyStatusTone(policy.status)}>
                  {getPolicyStatusLabel(policy.status)}
                </Badge>
                <div className="flex items-center gap-1 font-mono text-3xs text-primary font-semibold">
                  <Key size={10} />
                  <span>{policy.key}</span>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-bold text-text group-hover/pol:text-primary transition-colors">
                  {policy.title}
                </h2>
                <p className="mt-1 text-2xs text-text-muted line-clamp-2 leading-relaxed">
                  {policy.summary}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border-soft text-2xs">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Version:</span>
                <span className="font-mono font-medium text-text">{policy.version}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Enforcement:</span>
                <Badge tone={getEnforcementTone(policy.enforcementLevel)} className="text-3xs">
                  {policy.enforcementLevel}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Clauses:</span>
                <span className="font-medium text-text">{policy.sections.length} sections</span>
              </div>

              <div className="flex items-center justify-between pt-1.5 text-primary font-medium text-2xs">
                <span>View Full Policy Document</span>
                <ChevronRight size={13} className="group-hover/pol:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* New Policy Dialog */}
      {isNewDialogOpen && (
        <PolicyEditDialog
          policy={newPolicyTemplate}
          allPolicies={policies}
          open={isNewDialogOpen}
          onOpenChange={setIsNewDialogOpen}
          onSave={handleCreatePolicy}
        />
      )}
    </Page>
  )
}
