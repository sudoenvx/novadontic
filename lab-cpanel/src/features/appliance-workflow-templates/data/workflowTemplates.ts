import { mapWorkflowTemplateResponse, type WorkflowTemplateResponse } from './workflowTemplateResponses'

const workflowTemplateResponses: WorkflowTemplateResponse[] = [
  {
    id: 'aligner-standard',
    appliance_id: 'aligner',
    name: 'Standard aligner flow',
    is_default: true,
    is_active: true,
    steps: [
      { id: 'aligner-received', name: 'Received', kind: 'production', estimated_days: 1, requires_approval: false },
      { id: 'aligner-design', name: 'Design', description: 'Prepare the digital design and review the setup.', kind: 'production', estimated_days: 2, requires_approval: true },
      { id: 'aligner-printing', name: 'Printing', kind: 'production', estimated_days: 2, requires_approval: false },
      { id: 'aligner-assembling', name: 'Assembling', kind: 'production', estimated_days: 1, requires_approval: false },
      { id: 'aligner-finishing', name: 'Finishing', kind: 'production', estimated_days: 1, requires_approval: false },
      { id: 'aligner-packaging', name: 'Packaging', kind: 'shipping', estimated_days: 1, requires_approval: false },
      { id: 'aligner-delivered', name: 'Delivered', kind: 'shipping', estimated_days: 1, requires_approval: false },
    ],
  },
  {
    id: 'retainer-standard',
    appliance_id: 'retainer',
    name: 'Standard retainer flow',
    is_default: true,
    is_active: true,
    steps: [
      { id: 'retainer-received', name: 'Received', kind: 'production', estimated_days: 1, requires_approval: false },
      { id: 'retainer-design', name: 'Design', kind: 'production', estimated_days: 1, requires_approval: true },
      { id: 'retainer-production', name: 'Production', kind: 'production', estimated_days: 2, requires_approval: false },
      { id: 'retainer-finishing', name: 'Finishing', kind: 'production', estimated_days: 1, requires_approval: false },
      { id: 'retainer-quality', name: 'Quality check', kind: 'quality', estimated_days: 1, requires_approval: true },
      { id: 'retainer-packaging', name: 'Packaging', kind: 'shipping', estimated_days: 1, requires_approval: false },
      { id: 'retainer-delivered', name: 'Delivered', kind: 'shipping', estimated_days: 1, requires_approval: false },
    ],
  },
]

export const workflowTemplateFixtures = workflowTemplateResponses.map(mapWorkflowTemplateResponse)
