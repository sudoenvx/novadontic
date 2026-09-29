import {
  ArrowLeft,
  Check,
  ChevronRight,
  Copy,
  Edit3,
  History,
  Key,
  Layers,
  Printer,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Tag,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Badge } from '../../../shared/ui/Badge'
import { Button } from '../../../shared/ui/Button'
import { Card, CardHeader, CardTitle } from '../../../shared/ui/Card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../shared/ui/DropdownMenu'
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
  getPolicyCategoryLabel,
  getPolicyStatusLabel,
  getPolicyStatusTone,
  getRuleTypeTone,
  type Policy,
  type PolicySection,
} from '../domain/policy'
import { PolicyEditDialog } from './PolicyEditDialog'
import { PolicyShareDialog } from './PolicyShareDialog'
import { PolicySimulatorCard } from './PolicySimulatorCard'

export function PolicyDetailsPage() {
  const navigate = useNavigate()
  const { policyKey } = useParams()

  const [policiesList, setPoliciesList] = useState<Policy[]>(policyFixtures)
  const currentKey = policyKey ?? 'remake_policy'

  const currentPolicy = useMemo(() => {
    return (
      policiesList.find(
        (p) =>
          p.key.toLowerCase() === currentKey.toLowerCase() ||
          p.id.toLowerCase() === currentKey.toLowerCase(),
      ) ?? policiesList[0]
    )
  }, [policiesList, currentKey])

  const [copiedKey, setCopiedKey] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [activeSectionId, setActiveSectionId] = useState<string>('')

  function handleCopyKey() {
    navigator.clipboard.writeText(currentPolicy.key)
    setCopiedKey(true)
    toast.add({
      title: 'Unique key copied',
      description: `"${currentPolicy.key}" copied to clipboard.`,
      type: 'success',
    })
    setTimeout(() => setCopiedKey(false), 2000)
  }

  function handlePrint() {
    window.print()
  }

  function handleSavePolicy(updated: Policy) {
    setPoliciesList((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    )
    if (updated.key !== currentPolicy.key) {
      navigate(`/policies/${updated.key}`, { replace: true })
    }
  }

  function scrollToSection(sectionId: string) {
    setActiveSectionId(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Filter sections and rules based on search query
  const filteredSections = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return currentPolicy.sections

    return currentPolicy.sections
      .map((section) => {
        const matchesSectionTitle = section.title.toLowerCase().includes(query)
        const matchingRules = section.rules.filter(
          (rule) =>
            rule.title.toLowerCase().includes(query) ||
            rule.description.toLowerCase().includes(query) ||
            rule.code?.toLowerCase().includes(query) ||
            rule.tags?.some((t) => t.toLowerCase().includes(query)),
        )

        if (matchesSectionTitle || matchingRules.length > 0) {
          return {
            ...section,
            rules: matchesSectionTitle ? section.rules : matchingRules,
          }
        }
        return null
      })
      .filter(Boolean) as PolicySection[]
  }, [currentPolicy, searchTerm])

  return (
    <Page size="full" className="gap-3.5 max-w-7xl mx-auto print:p-0">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 print:hidden">
        <div className="flex items-center gap-2 text-xs">
          <Link
            to="/policies"
            className="flex items-center gap-1 font-medium text-text-muted hover:text-text transition-colors"
          >
            <ArrowLeft size={13} />
            <span>All Policies</span>
          </Link>
          <span className="text-text-muted">/</span>
          <span className="font-semibold text-text">{currentPolicy.shortName}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Policy Switcher Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="neutral" size="sm" className="gap-1 text-xs">
                  <Layers size={13} />
                  <span>Switch Policy</span>
                  <ChevronRight size={12} className="rotate-90 text-text-muted" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-64">
              {policiesList.map((pol) => (
                <DropdownMenuItem
                  key={pol.id}
                  onClick={() => navigate(`/policies/${pol.key}`)}
                  className={`flex flex-col items-start gap-0.5 py-1.5 ${
                    pol.id === currentPolicy.id ? 'bg-surface-muted font-medium' : 'hover:bg-surface-muted'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-text">{pol.shortName}</span>
                    <span className="font-mono text-3xs text-text-muted">{pol.key}</span>
                  </div>
                  <span className="text-3xs text-text-muted truncate w-full">
                    {getPolicyCategoryLabel(pol.category)} · {pol.version}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="neutral"
            size="sm"
            onClick={handleCopyKey}
            className="gap-1.5 text-xs font-mono"
            title="Copy unique key for database and API references"
          >
            {copiedKey ? <Check size={13} className="text-success" /> : <Key size={13} />}
            <span>{copiedKey ? 'Key Copied' : `key: ${currentPolicy.key}`}</span>
          </Button>

          <Button
            variant="neutral"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 text-xs"
            title="Print or export as PDF"
          >
            <Printer size={13} />
            <span>Print PDF</span>
          </Button>

          <Button
            variant="neutral"
            size="sm"
            onClick={() => setIsShareDialogOpen(true)}
            className="gap-1.5 text-xs"
          >
            <Share2 size={13} />
            <span>Share</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
            className="gap-1.5 text-xs"
          >
            <Edit3 size={13} />
            <span>Edit Policy</span>
          </Button>
        </div>
      </div>

      {/* Main Policy Header & Hero */}
      <Card className="gap-3.5 bg-surface border-border shadow-2xs">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={getPolicyStatusTone(currentPolicy.status)}>
                {getPolicyStatusLabel(currentPolicy.status)}
              </Badge>
              <Badge tone="neutral" className="font-mono">
                {currentPolicy.version}
              </Badge>
              <Badge tone="accent">
                {getPolicyCategoryLabel(currentPolicy.category)}
              </Badge>
              <Badge tone={getEnforcementTone(currentPolicy.enforcementLevel)}>
                {currentPolicy.enforcementLevel} Enforcement
              </Badge>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-text">
              {currentPolicy.title}
            </h1>
            <p className="text-xs text-text-muted leading-relaxed">
              {currentPolicy.summary}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1 text-2xs text-text-muted">
            <div className="flex items-center gap-1 font-mono">
              <Key size={12} className="text-primary" />
              <span className="font-semibold text-text">Unique Key:</span>
              <code className="rounded-xs bg-primary-soft px-1 py-0.5 text-primary-soft-foreground">
                {currentPolicy.key}
              </code>
            </div>
            <span>Effective: {currentPolicy.effectiveDate}</span>
            <span>Last revised: {currentPolicy.lastUpdated}</span>
          </div>
        </div>

        {/* Metadata Badges Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border-soft text-2xs">
          <div className="rounded-sm border border-border bg-surface-soft p-2">
            <span className="text-text-muted block text-3xs font-medium uppercase tracking-wider">
              Applicable Appliances
            </span>
            <span className="font-semibold text-text truncate block mt-0.5">
              {currentPolicy.applicableAppliances.join(', ')}
            </span>
          </div>
          <div className="rounded-sm border border-border bg-surface-soft p-2">
            <span className="text-text-muted block text-3xs font-medium uppercase tracking-wider">
              Target Accounts
            </span>
            <span className="font-semibold text-text truncate block mt-0.5">
              {currentPolicy.applicableAccounts.join(', ')}
            </span>
          </div>
          <div className="rounded-sm border border-border bg-surface-soft p-2">
            <span className="text-text-muted block text-3xs font-medium uppercase tracking-wider">
              Clinic Acknowledgement
            </span>
            <span className="font-semibold text-text truncate block mt-0.5">
              {currentPolicy.stats.acknowledgedClinicsCount} /{' '}
              {currentPolicy.stats.totalEligibleClinicsCount} Clinics (
              {Math.round(
                (currentPolicy.stats.acknowledgedClinicsCount /
                  currentPolicy.stats.totalEligibleClinicsCount) *
                  100,
              )}
              %)
            </span>
          </div>
          <div className="rounded-sm border border-border bg-surface-soft p-2">
            <span className="text-text-muted block text-3xs font-medium uppercase tracking-wider">
              Active Cases Covered
            </span>
            <span className="font-semibold text-text truncate block mt-0.5">
              {currentPolicy.stats.activeCasesCovered} Cases
            </span>
          </div>
        </div>
      </Card>

      {/* Main 2-Column Layout */}
      <div className="grid min-w-0 gap-4 xl:grid-cols-[18rem_minmax(0,1fr)] items-start">
        {/* Left Sticky Sidebar */}
        <aside className="grid gap-3 xl:sticky xl:top-[calc(var(--navbar-height)+var(--page-gap))] print:hidden">
          {/* Table of Contents / Quick Jump */}
          <Card className="gap-2.5">
            <CardHeader className="pb-0">
              <CardTitle className="text-xs font-semibold flex items-center justify-between">
                <span>Policy Outline</span>
                <span className="text-3xs text-text-muted font-normal">
                  {currentPolicy.sections.length} Clauses
                </span>
              </CardTitle>
            </CardHeader>

            {/* In-page clause search */}
            <InputGroup size="xs" variant="outline" className="mt-1">
              <InputGroupAddon align="inline-start">
                <Search size={12} className="text-text-muted" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Filter rules & clauses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs"
              />
            </InputGroup>

            <nav className="grid gap-1 pt-1" aria-label="Policy sections">
              {currentPolicy.sections.map((section) => {
                const isActive = activeSectionId === section.key
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => scrollToSection(section.key)}
                    className={`flex items-center justify-between text-left text-xs py-1.5 px-2 rounded-sm transition-colors ${
                      isActive
                        ? 'bg-primary-soft text-primary-soft-foreground font-medium'
                        : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-mono text-2xs text-text-muted">
                        § {section.clauseNumber}
                      </span>
                      <span className="truncate">{section.title}</span>
                    </div>
                    <span className="text-3xs text-text-muted font-mono shrink-0 ml-1">
                      {section.rules.length}
                    </span>
                  </button>
                )
              })}
            </nav>
          </Card>

          {/* Interactive Policy Simulator / Rule Checker */}
          <PolicySimulatorCard policy={currentPolicy} />

          {/* Version History Card */}
          <Card className="gap-2 text-xs">
            <button
              type="button"
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="flex items-center justify-between font-semibold text-text text-left w-full"
            >
              <span className="flex items-center gap-1.5 text-xs">
                <History size={14} className="text-text-muted" />
                <span>Revision Changelog ({currentPolicy.revisions.length})</span>
              </span>
              <ChevronRight
                size={14}
                className={`text-text-muted transition-transform ${
                  isHistoryOpen ? 'rotate-90' : ''
                }`}
              />
            </button>

            {isHistoryOpen && (
              <div className="grid gap-2.5 pt-2 border-t border-border-soft text-2xs">
                {currentPolicy.revisions.map((rev) => (
                  <div key={rev.version} className="space-y-1">
                    <div className="flex items-center justify-between font-mono">
                      <Badge tone="neutral" className="text-3xs px-1">
                        {rev.version}
                      </Badge>
                      <span className="text-text-muted text-3xs">{rev.date}</span>
                    </div>
                    <p className="font-medium text-text">{rev.changeSummary}</p>
                    <p className="text-3xs text-text-muted">Author: {rev.author}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </aside>

        {/* Right Main Policy Content */}
        <main className="grid min-w-0 gap-3.5">
          {filteredSections.length === 0 ? (
            <Card className="py-10 text-center text-text-muted text-xs">
              <p>No clauses match "{searchTerm}".</p>
              <Button
                variant="neutral"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="mt-2"
              >
                Clear Search
              </Button>
            </Card>
          ) : (
            filteredSections.map((section) => (
              <section
                key={section.id}
                id={section.key}
                className="scroll-mt-6 grid gap-2.5"
              >
                <Card className="gap-3">
                  {/* Section Title & Clause Header */}
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center size-6 rounded-xs bg-primary/10 text-primary font-mono text-xs font-bold">
                        {section.clauseNumber}
                      </span>
                      <h2 className="text-sm font-bold text-text">
                        {section.title}
                      </h2>
                    </div>

                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        const url = `${window.location.origin}/policies/${currentPolicy.key}#${section.key}`
                        navigator.clipboard.writeText(url)
                        toast.add({
                          title: 'Section link copied',
                          type: 'success',
                        })
                      }}
                      className="text-text-muted hover:text-text h-6 gap-1 text-2xs print:hidden"
                    >
                      <Copy size={11} />
                      <span>Copy Clause Link</span>
                    </Button>
                  </div>

                  {section.description && (
                    <p className="text-xs text-text-muted leading-relaxed">
                      {section.description}
                    </p>
                  )}

                  {/* Callout Notice if present */}
                  {section.callout && (
                    <div
                      className={`rounded-sm p-3 text-xs border ${
                        section.callout.type === 'info'
                          ? 'bg-info-soft border-info-soft-foreground/20 text-info-soft-foreground'
                          : section.callout.type === 'warning'
                          ? 'bg-warning-soft border-warning-soft-foreground/20 text-warning-soft-foreground'
                          : section.callout.type === 'destructive'
                          ? 'bg-destructive-soft border-destructive-soft-foreground/20 text-destructive-soft-foreground'
                          : 'bg-surface-muted border-border text-text-primary'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-semibold mb-1">
                        <Sparkles size={13} />
                        <span>{section.callout.title}</span>
                      </div>
                      <p className="text-2xs leading-relaxed">
                        {section.callout.message}
                      </p>
                    </div>
                  )}

                  {/* Rules & Clauses Grid */}
                  <div className="grid gap-2 text-xs pt-1">
                    {section.rules.map((rule) => (
                      <div
                        key={rule.id}
                        className="group/rule rounded-sm border border-border bg-surface-soft/60 p-2.5 transition-colors hover:bg-surface-muted"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            {rule.code && (
                              <code className="rounded-xs bg-surface-muted px-1 py-0.2 font-mono text-3xs font-semibold text-text-primary">
                                {rule.code}
                              </code>
                            )}
                            <h3 className="font-semibold text-text text-xs">
                              {rule.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {rule.highlight && (
                              <Badge tone="accent" className="text-3xs font-medium">
                                {rule.highlight}
                              </Badge>
                            )}
                            {rule.type && (
                              <Badge tone={getRuleTypeTone(rule.type)} className="text-3xs">
                                {rule.type}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-2xs text-text-muted leading-relaxed">
                          {rule.description}
                        </p>

                        {rule.tags && rule.tags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 pt-1.5 mt-1.5 border-t border-border-soft">
                            <Tag size={10} className="text-text-muted" />
                            {rule.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-xs bg-surface-muted px-1 text-3xs text-text-muted"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Structured Decision Table if present */}
                  {section.table && (
                    <div className="mt-2 overflow-hidden rounded-sm border border-border bg-surface text-xs">
                      {section.table.title && (
                        <div className="border-b border-border bg-surface-muted px-3 py-1.5 text-2xs font-semibold text-text-primary">
                          {section.table.title}
                        </div>
                      )}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-2xs">
                          <thead className="border-b border-border bg-surface-soft text-3xs font-semibold uppercase text-text-muted">
                            <tr>
                              {section.table.headers.map((header, idx) => (
                                <th key={idx} className="px-3 py-2">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border-soft">
                            {section.table.rows.map((row, rowIdx) => (
                              <tr
                                key={rowIdx}
                                className={
                                  row.highlight
                                    ? 'bg-accent-soft/30 font-medium'
                                    : 'hover:bg-surface-muted'
                                }
                              >
                                {row.values.map((val, cellIdx) => (
                                  <td key={cellIdx} className="px-3 py-2 text-text">
                                    {val}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </Card>
              </section>
            ))
          )}

          {/* Policy Document Footer / Compliance Sign-off */}
          <Card className="gap-2 border-dashed bg-surface-soft text-2xs text-text-muted">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-text flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-success" />
                <span>NovaDontic Dental Laboratory Compliance Standard</span>
              </span>
              <span className="font-mono text-3xs">Doc Key: {currentPolicy.key}</span>
            </div>
            <p className="text-3xs leading-relaxed">
              This document represents the official lab operating policy. Registered dental clinics
              and ordering doctors are bound by these terms upon case submission. Revision history
              is archived and immutably timestamped in the lab platform.
            </p>
          </Card>
        </main>
      </div>

      {/* Edit Policy Dialog */}
      <PolicyEditDialog
        policy={currentPolicy}
        allPolicies={policiesList}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSavePolicy}
      />

      {/* Share Policy Dialog */}
      <PolicyShareDialog
        policy={currentPolicy}
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
      />
    </Page>
  )
}
