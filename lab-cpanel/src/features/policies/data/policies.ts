import type { Policy } from '../domain/policy'

export const policyFixtures: Policy[] = [
  {
    id: 'pol-remake',
    key: 'remake_policy',
    title: 'Remake & Clinical Adjustment Policy',
    shortName: 'Remakes & Adjustments',
    summary:
      'Defines the qualification rules, timelines, warranty coverage, and documentation required when requesting a remake or modification for fabricated appliances.',
    category: 'remakes_adjustments',
    status: 'published',
    version: 'v2.4',
    effectiveDate: '2026-01-01',
    lastUpdated: '2026-09-15',
    lastUpdatedBy: 'Dr. Sarah Mitchell (Quality Lead)',
    enforcementLevel: 'Strict',
    applicableAppliances: ['Aligner', 'Retainer', 'Splint / Guard', 'Indirect Bonding'],
    applicableAccounts: ['All Clinics', 'Partner Labs', 'Direct Doctor Accounts'],
    acknowledgementRequired: true,
    stats: {
      acknowledgedClinicsCount: 48,
      totalEligibleClinicsCount: 52,
      activeCasesCovered: 342,
    },
    sections: [
      {
        id: 'sec-eligibility',
        key: 'eligibility_criteria',
        clauseNumber: '1.0',
        title: 'Eligibility & Qualification Criteria',
        description:
          'Conditions under which a remake request is eligible for no-charge warranty fabrication or discounted reprocessing.',
        callout: {
          type: 'info',
          title: '30-Day Notification Window',
          message:
            'All remake claims must be submitted within 30 calendar days from the appliance delivery date. Claims received after 30 days will be billed at standard refinement rates.',
        },
        rules: [
          {
            id: 'rule-original-link',
            code: 'REM-101',
            title: 'Mandatory Original Case Association',
            description:
              'Every remake case submission must reference the original Case Number (e.g. OR-4821) in the creation form to retain tracking continuity and billing history.',
            type: 'requirement',
            highlight: 'Must link original Case ID',
            tags: ['Workflow', 'Case Creation'],
          },
          {
            id: 'rule-scan-verification',
            code: 'REM-102',
            title: 'New Digital Impression / Intraoral Scan',
            description:
              'If the remake is requested due to poor seating, anatomical changes, or restorative alterations, a fresh intraoral scan or impression taken within 7 days is mandatory.',
            type: 'requirement',
            highlight: 'New scan required if fit issue',
            tags: ['Clinical Data', 'Scans'],
          },
          {
            id: 'rule-return-original',
            code: 'REM-103',
            title: 'Appliance Return Requirement',
            description:
              'For physical defect or fit dispute evaluations, the original appliance must be returned to the lab within 14 business days or verified via photographic documentation.',
            type: 'condition',
            highlight: 'Appliance return or photographic proof',
            tags: ['Logistics', 'Inspection'],
          },
        ],
      },
      {
        id: 'sec-coverage-tiers',
        key: 'coverage_tiers',
        clauseNumber: '2.0',
        title: 'Remake Coverage & Fee Schedule',
        description:
          'Determines the financial responsibility and pricing rule applied based on the underlying root cause of the remake.',
        rules: [
          {
            id: 'rule-lab-fault',
            code: 'REM-201',
            title: 'Lab Fabrication Defect (100% Covered)',
            description:
              'Defects resulting from lab manufacturing, trimming discrepancy, material delamination, or processing errors are fabricated at 100% zero charge with Rush priority.',
            type: 'condition',
            highlight: '0% charge · Free Warranty',
            tags: ['Warranty', 'Lab Error'],
          },
          {
            id: 'rule-mid-treatment-change',
            code: 'REM-202',
            title: 'Clinical Treatment Plan Change (50% Discount)',
            description:
              'If the doctor alters bracket prescription, tooth movement goals, or undergoes unplanned restorative work mid-treatment, remakes are charged at 50% standard unit price.',
            type: 'fee',
            highlight: '50% Discounted Rate',
            tags: ['Billing', 'Prescription Change'],
          },
          {
            id: 'rule-patient-loss',
            code: 'REM-203',
            title: 'Patient Loss or Accidental Breakage (Standard Rate)',
            description:
              'Appliances lost, damaged by patient mishandling, or chewed by pets are classified as Duplicates / Replacements and billed at the agreed account rate.',
            type: 'exclusion',
            highlight: 'Full Price Replacement',
            tags: ['Billable', 'Patient Cause'],
          },
        ],
        table: {
          title: 'Remake Reason & Fee Decision Matrix',
          headers: ['Remake Reason', 'Financial Rule', 'Turnaround Priority', 'Original Link Required'],
          rows: [
            {
              values: ['Manufacturing defect / margin error', '100% Free (Warranty)', 'Rush (3 Business Days)', 'Yes'],
              highlight: true,
            },
            {
              values: ['Fit issue with matching scan', '100% Free (Warranty)', 'Rush (3 Business Days)', 'Yes'],
              highlight: true,
            },
            {
              values: ['New restoration / tooth anatomy changed', '50% Discounted Rate', 'Standard (5 Business Days)', 'Yes'],
            },
            {
              values: ['Doctor changed treatment prescription', '50% Discounted Rate', 'Standard (5 Business Days)', 'Yes'],
            },
            {
              values: ['Patient lost or broke appliance', 'Full Price (Duplicate)', 'Standard / Rush on request', 'Optional'],
            },
          ],
        },
      },
      {
        id: 'sec-turnaround-workflow',
        key: 'remake_turnaround',
        clauseNumber: '3.0',
        title: 'Priority & Expedited Turnaround',
        description:
          'Standard and rush turnaround schedules dedicated to resolving remake cases quickly to minimize patient chairside delay.',
        callout: {
          type: 'warning',
          title: 'Rush Queue Prioritization',
          message:
            'Warranty remakes automatically bypass standard queue delays and receive top priority in digital staging and 3D printing batches.',
        },
        rules: [
          {
            id: 'rule-turnaround-warranty',
            code: 'REM-301',
            title: 'Warranty Remake Turnaround: 3 Business Days',
            description:
              'From digital scan approval to dispatch, all verified warranty remakes are completed within 3 lab working days.',
            type: 'timeline',
            highlight: '3 Business Days Target',
            tags: ['Turnaround', 'SLA'],
          },
          {
            id: 'rule-shipping-expedited',
            code: 'REM-302',
            title: 'Complimentary Express Courier',
            description:
              'For lab-attributed remakes, the lab covers express next-morning courier delivery directly to the clinic.',
            type: 'condition',
            tags: ['Shipping', 'Logistics'],
          },
        ],
      },
      {
        id: 'sec-exclusions',
        key: 'exclusions_limitations',
        clauseNumber: '4.0',
        title: 'Exclusions & Warranty Limitations',
        description:
          'Situations where the lab warranty is void or where additional review by the Chief Technical Officer is required.',
        rules: [
          {
            id: 'rule-expired-time',
            code: 'REM-401',
            title: 'Claims Past 30 Days',
            description:
              'Any request initiated beyond 30 calendar days of receipt without prior written extension is ineligible for zero-cost warranty.',
            type: 'exclusion',
            highlight: 'Void after 30 days',
            tags: ['Warranty Void'],
          },
          {
            id: 'rule-compromised-scan',
            code: 'REM-402',
            title: 'Scans Flagged as Inadequate Upon Submission',
            description:
              'If the clinic was warned of distorted scan margins or severe distortion but instructed the lab to "proceed anyway", warranty coverage is forfeited.',
            type: 'exclusion',
            highlight: 'Forfeited if warned in advance',
            tags: ['Clinical Risk', 'Doctor Authorization'],
          },
        ],
      },
    ],
    revisions: [
      {
        version: 'v2.4',
        date: '2026-09-15',
        author: 'Dr. Sarah Mitchell',
        changeSummary: 'Added explicit clause REM-402 regarding scans flagged as inadequate.',
        changes: [
          'Clarified 30-day submission calendar window vs lab business days.',
          'Added scan adequacy waiver terms in section 4.0.',
          'Updated decision matrix fee schedule layout.',
        ],
      },
      {
        version: 'v2.3',
        date: '2026-04-10',
        author: 'Youssef Nabil (Ops Director)',
        changeSummary: 'Integrated automated Original Case ID validation in portal.',
        changes: [
          'Mandated original Case ID linkage for all remake and refinement categories.',
          'Standardized 3-day express turnaround for warranty remakes.',
        ],
      },
      {
        version: 'v2.0',
        date: '2025-11-01',
        author: 'Quality Committee',
        changeSummary: 'Complete overhaul of clinical remake policy and warranty tiers.',
        changes: ['Initial baseline policy release for NovaDontic lab platform.'],
      },
    ],
  },
  {
    id: 'pol-warranty',
    key: 'warranty_guarantee',
    title: 'Appliance Warranty & Quality Guarantee',
    shortName: 'Warranty & Guarantee',
    summary:
      'Covers product durability guarantees, material certifications, fracture protection periods, and fit guarantees across all manufactured appliances.',
    category: 'warranty_guarantee',
    status: 'published',
    version: 'v3.1',
    effectiveDate: '2026-01-01',
    lastUpdated: '2026-08-20',
    lastUpdatedBy: 'Quality Assurance Department',
    enforcementLevel: 'Contractual',
    applicableAppliances: ['Aligner', 'Retainer', 'Splint / Guard', 'Sleep Apnea Appliance'],
    applicableAccounts: ['All Clinics'],
    acknowledgementRequired: true,
    stats: {
      acknowledgedClinicsCount: 50,
      totalEligibleClinicsCount: 52,
      activeCasesCovered: 410,
    },
    sections: [
      {
        id: 'sec-warranty-periods',
        key: 'warranty_periods',
        clauseNumber: '1.0',
        title: 'Warranty Protection Periods by Appliance Type',
        description: 'Duration of material integrity and fit guarantee from the date of final delivery.',
        rules: [
          {
            id: 'war-retainers',
            code: 'WAR-101',
            title: 'Essix & Hawley Retainers: 90-Day Guarantee',
            description:
              'Guaranteed against spontaneous material fracture, wire de-bonding, or acrylic delamination for 90 days under normal usage.',
            type: 'timeline',
            highlight: '90 Days Protection',
            tags: ['Retainers', 'Material'],
          },
          {
            id: 'war-aligners',
            code: 'WAR-102',
            title: 'Clear Aligners: Active Stage Protection',
            description:
              'Aligners are guaranteed against micro-cracking and laser-trim delamination throughout the prescribed wear interval (7–14 days per stage).',
            type: 'condition',
            highlight: 'Wear interval guarantee',
            tags: ['Aligner'],
          },
          {
            id: 'war-splints',
            code: 'WAR-103',
            title: 'Night Guards & Splints: 1-Year Guarantee',
            description:
              'Premium 3D printed and milled bite splints carry a 12-month warranty against catastrophic structural failure.',
            type: 'timeline',
            highlight: '1 Year Full Warranty',
            tags: ['Splints', 'Durability'],
          },
        ],
        table: {
          title: 'Appliance Warranty Terms Matrix',
          headers: ['Appliance Family', 'Warranty Duration', 'Covered Issues', 'Exclusions'],
          rows: [
            { values: ['Clear Aligners', 'Active Stage (14 Days)', 'Trim edge defect, fit issue', 'Bite through, hot water deformation'], highlight: true },
            { values: ['Essix Retainers', '90 Days', 'Material cracking, delamination', 'Bruxism destruction, loss'], highlight: true },
            { values: ['Hawley Retainers', '180 Days', 'Wire weld failure, acrylic break', 'Physical abuse, adjustment strain'] },
            { values: ['Night Guards / Splints', '12 Months (1 Year)', 'Fracture, layer separation', 'Normal occlusal wear over time'] },
          ],
        },
      },
    ],
    revisions: [
      {
        version: 'v3.1',
        date: '2026-08-20',
        author: 'Quality Assurance Department',
        changeSummary: 'Extended Night Guard warranty to 1 full year for 3D printed resin series.',
        changes: ['Updated splint durability clauses.', 'Added biocompatibility certification reference.'],
      },
    ],
  },
  {
    id: 'pol-turnaround',
    key: 'turnaround_rush',
    title: 'Production Turnaround Times & Rush Order Policy',
    shortName: 'Turnaround & Rush Policy',
    summary:
      'Specifies standard manufacturing days, cutoff hours for digital file approvals, rush fee structures, and guaranteed delivery commitments.',
    category: 'turnaround_rush',
    status: 'published',
    version: 'v2.0',
    effectiveDate: '2026-02-01',
    lastUpdated: '2026-07-11',
    lastUpdatedBy: 'Production Management',
    enforcementLevel: 'Contractual',
    applicableAppliances: ['All Appliances'],
    applicableAccounts: ['All Clinics', 'Partner Labs'],
    acknowledgementRequired: false,
    stats: {
      acknowledgedClinicsCount: 46,
      totalEligibleClinicsCount: 52,
      activeCasesCovered: 520,
    },
    sections: [
      {
        id: 'sec-turnaround-schedule',
        key: 'standard_schedule',
        clauseNumber: '1.0',
        title: 'Standard Turnaround Schedule (Business Days)',
        description: 'Working days required from file acceptance and prescription clearance to courier dispatch.',
        callout: {
          type: 'info',
          title: 'Daily Submission Cutoff Time',
          message:
            'Cases submitted and approved before 12:00 PM (Noon) begin Day 1 production on the same calendar day. Submissions after 12:00 PM start Day 1 on the following business day.',
        },
        rules: [
          {
            id: 'tat-aligner',
            code: 'TAT-101',
            title: 'Clear Aligners: 5 to 7 Business Days',
            description:
              'Comprehensive aligner series fabrication including automated laser trimming, polishing, and staging quality checks.',
            type: 'timeline',
            highlight: '5–7 Business Days',
            tags: ['Aligners'],
          },
          {
            id: 'tat-retainer',
            code: 'TAT-102',
            title: 'Retainers & Single Stage: 3 to 4 Business Days',
            description: 'Fast-track fabrication for retention appliances and simple tooth positioning appliances.',
            type: 'timeline',
            highlight: '3–4 Business Days',
            tags: ['Retainers'],
          },
          {
            id: 'tat-rush',
            code: 'TAT-103',
            title: 'Rush Service Surcharge: +25% Fee (2–3 Days)',
            description:
              'Selecting Rush Priority on case creation accelerates production queue placement with guaranteed dispatch within 48 to 72 hours.',
            type: 'fee',
            highlight: '2–3 Days (+25% fee)',
            tags: ['Rush', 'Priority'],
          },
        ],
        table: {
          title: 'Turnaround Times by Appliance Type',
          headers: ['Appliance', 'Standard Lab Days', 'Rush Lab Days', 'Rush Surcharge'],
          rows: [
            { values: ['Clear Aligners (Full Set)', '7 Days', '3 Days', '+25%'] },
            { values: ['Clear Aligners (Express ≤5)', '4 Days', '2 Days', '+25%'] },
            { values: ['Essix Retainer', '3 Days', '24 Hours', '+30%'], highlight: true },
            { values: ['Hawley Retainer', '5 Days', '3 Days', '+25%'] },
            { values: ['Night Guard / Splint', '5 Days', '2 Days', '+25%'] },
          ],
        },
      },
    ],
    revisions: [
      {
        version: 'v2.0',
        date: '2026-02-01',
        author: 'Production Management',
        changeSummary: 'Refined 24-hour turnaround option for single Essix retainers.',
        changes: ['Added noon cutoff rule.', 'Standardized rush pricing multiplier.'],
      },
    ],
  },
  {
    id: 'pol-scans',
    key: 'scan_impression_standards',
    title: 'Digital Scan & Impression Quality Standards',
    shortName: 'Scan & Impression Standards',
    summary:
      'Clinical guidelines for intraoral scan resolution, marginal fit criteria, bite registration accuracy, and physical impression requirements.',
    category: 'quality_scans',
    status: 'published',
    version: 'v1.8',
    effectiveDate: '2026-01-15',
    lastUpdated: '2026-06-30',
    lastUpdatedBy: 'Digital Dentistry Team',
    enforcementLevel: 'Strict',
    applicableAppliances: ['All Appliances'],
    applicableAccounts: ['All Clinics'],
    acknowledgementRequired: false,
    stats: {
      acknowledgedClinicsCount: 49,
      totalEligibleClinicsCount: 52,
      activeCasesCovered: 480,
    },
    sections: [
      {
        id: 'sec-scan-standards',
        key: 'scan_requirements',
        clauseNumber: '1.0',
        title: 'Intraoral Scan Quality & Geometry',
        description: 'Acceptance benchmarks for digital STL, PLY, and OBJ dental scans.',
        rules: [
          {
            id: 'scan-gingival-margin',
            code: 'SCN-101',
            title: '3mm–4mm Gingival Cuff Inclusion',
            description:
              'Scans must capture at least 3mm to 4mm of undisturbed attached gingival tissue beyond the clinical crown margins for accurate retention indexing.',
            type: 'requirement',
            highlight: 'Minimum 3mm gingiva',
            tags: ['Scan Margin'],
          },
          {
            id: 'scan-bite-registration',
            code: 'SCN-102',
            title: 'Bilateral Buccal Bite Alignment',
            description:
              'Dual buccal bite scans in maximum intercuspation (MIC) are mandatory for all multi-unit aligner and splint cases.',
            type: 'requirement',
            highlight: 'Bilateral bite required',
            tags: ['Occlusion'],
          },
        ],
      },
    ],
    revisions: [
      {
        version: 'v1.8',
        date: '2026-06-30',
        author: 'Digital Dentistry Team',
        changeSummary: 'Updated color PLY file compatibility guidelines.',
        changes: ['Added instructions for 3Shape, iTero, Medit scanners.'],
      },
    ],
  },
  {
    id: 'pol-billing',
    key: 'billing_payment_terms',
    title: 'Billing, Invoicing & Cancellation Terms',
    shortName: 'Billing & Cancellation Terms',
    summary:
      'Terms of payment, monthly consolidation schedules, cancellation stage penalties, and account standing policies for dental practices.',
    category: 'pricing_billing',
    status: 'published',
    version: 'v2.2',
    effectiveDate: '2026-01-01',
    lastUpdated: '2026-08-01',
    lastUpdatedBy: 'Finance & Accounts',
    enforcementLevel: 'Contractual',
    applicableAppliances: ['All Appliances'],
    applicableAccounts: ['All Clinics'],
    acknowledgementRequired: true,
    stats: {
      acknowledgedClinicsCount: 51,
      totalEligibleClinicsCount: 52,
      activeCasesCovered: 520,
    },
    sections: [
      {
        id: 'sec-payment-terms',
        key: 'payment_terms',
        clauseNumber: '1.0',
        title: 'Invoicing Cycles & Settlement Terms',
        description: 'Standard monthly billing cycles and credit terms.',
        rules: [
          {
            id: 'bil-net30',
            code: 'BIL-101',
            title: 'Net 30 Days Standard Credit',
            description:
              'Invoices are compiled at the end of each calendar month and are due within 30 days of the invoice generation date.',
            type: 'condition',
            highlight: 'Net 30 Payment',
            tags: ['Payment'],
          },
          {
            id: 'bil-cancellation',
            code: 'BIL-102',
            title: 'Case Cancellation Scale by Production Stage',
            description:
              'Cases cancelled before design are charged $0; cancelled during 3D printing/fabrication incur a 50% material fee; completed cases are non-refundable.',
            type: 'fee',
            highlight: 'Stage-dependent penalty',
            tags: ['Cancellation'],
          },
        ],
      },
    ],
    revisions: [
      {
        version: 'v2.2',
        date: '2026-08-01',
        author: 'Finance & Accounts',
        changeSummary: 'Updated stage cancellation penalty schedule.',
        changes: ['Introduced automated credit memo generation.'],
      },
    ],
  },
]
