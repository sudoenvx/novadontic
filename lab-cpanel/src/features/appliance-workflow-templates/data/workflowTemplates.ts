import { mapWorkflowTemplateResponse, type WorkflowTemplateResponse } from './workflowTemplateResponses'

const workflowTemplateResponses: WorkflowTemplateResponse[] = [
  {
    id: 'clear-aligners-standard',
    appliance_id: 'clear-aligners',
    name: 'Standard clear aligner flow',
    is_default: true,
    is_active: true,
    steps: [
      { id: 'clear-received', name: 'Case received', kind: 'production', estimated_days: 1, requires_approval: false },
      { id: 'clear-design', name: 'STL design', description: 'Prepare the digital design and review the setup.', kind: 'production', estimated_days: 2, requires_approval: true },
      { id: 'clear-printing', name: 'Printing', kind: 'production', estimated_days: 2, requires_approval: false },
      { id: 'clear-finishing', name: 'Finishing', kind: 'production', estimated_days: 1, requires_approval: false },
      { id: 'clear-quality', name: 'Quality check', kind: 'quality', estimated_days: 1, requires_approval: true },
      { id: 'clear-packaging', name: 'Packaging', kind: 'shipping', estimated_days: 1, requires_approval: false },
      { id: 'clear-delivered', name: 'Delivered', kind: 'shipping', estimated_days: 1, requires_approval: false },
    ],
  },
  {
    id: 'clear-aligners-rush',
    appliance_id: 'clear-aligners',
    name: 'Rush clear aligner flow',
    is_default: false,
    is_active: true,
    steps: [
      { id: 'rush-design', name: 'Priority design', kind: 'production', estimated_days: 1, requires_approval: true },
      { id: 'rush-printing', name: 'Printing', kind: 'production', estimated_days: 1, requires_approval: false },
      { id: 'rush-quality', name: 'Quality check', kind: 'quality', estimated_days: 1, requires_approval: true },
      { id: 'rush-delivery', name: 'Packaging & delivery', kind: 'shipping', estimated_days: 1, requires_approval: false },
    ],
  },
  {
    id: 'retainer-standard',
    appliance_id: 'retainer',
    name: 'Standard retainer flow',
    is_default: true,
    is_active: true,
    steps: [
      { id: 'retainer-design', name: 'Design', kind: 'production', estimated_days: 1, requires_approval: true },
      { id: 'retainer-production', name: 'Production', kind: 'production', estimated_days: 2, requires_approval: false },
      { id: 'retainer-quality', name: 'Quality check', kind: 'quality', estimated_days: 1, requires_approval: true },
      { id: 'retainer-delivered', name: 'Delivered', kind: 'shipping', estimated_days: 1, requires_approval: false },
    ],
  },
  {
    id: 'hawley-standard',
    appliance_id: 'hawley',
    name: 'Standard Hawley flow',
    is_default: true,
    is_active: true,
    steps: [
      { id: 'hawley-setup', name: 'Setup', kind: 'production', estimated_days: 1, requires_approval: true },
      { id: 'hawley-assembling', name: 'Assembling', kind: 'production', estimated_days: 2, requires_approval: false },
      { id: 'hawley-finishing', name: 'Finishing', kind: 'production', estimated_days: 1, requires_approval: false },
      { id: 'hawley-quality', name: 'Quality check', kind: 'quality', estimated_days: 1, requires_approval: true },
      { id: 'hawley-packaging', name: 'Packaging', kind: 'shipping', estimated_days: 1, requires_approval: false },
    ],
  },
]

export const workflowTemplateFixtures = workflowTemplateResponses.map(mapWorkflowTemplateResponse)
