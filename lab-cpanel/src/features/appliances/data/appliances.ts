import { toAppliance, type ApplianceResponse } from './applianceResponses'

const applianceResponses: ApplianceResponse[] = [
  {
    id: 'aligner',
    name: 'Aligner',
    source: 'Platform default',
    isActive: true,
    casesUsing: 0,
    fieldGroups: [
      {
        id: 'aligner-specification',
        name: 'Aligner specification',
        fields: [
          {
            id: 'upper-aligner-count',
            label: 'Upper aligner count',
            key: 'upper_aligner_count',
            type: 'text',
            required: false,
            options: [],
          },
          {
            id: 'lower-aligner-count',
            label: 'Lower aligner count',
            key: 'lower_aligner_count',
            type: 'text',
            required: false,
            options: [],
          },
        ],
      },
      {
        id: 'aligner-material',
        name: 'Aligner material',
        fields: [
          {
            id: 'material',
            label: 'Material',
            key: 'material',
            type: 'select',
            required: false,
            options: [
              { label: 'Essix', value: 'essix' },
              { label: 'Clear Aligner', value: 'clear_aligner' },
              { label: 'Durasoft', value: 'durasoft' },
              { label: 'Durasoft Plus', value: 'durasoft_plus' },
              { label: 'Durasoft Ultra', value: 'durasoft_ultra' },
            ],
          },
        ],
      }
    ],
  },
  {
    id: 'retainer',
    name: 'Retainer',
    source: 'Platform default',
    isActive: true,
    casesUsing: 0,
    fieldGroups: [
      {
        id: 'retainer-specification',
        name: 'Retainer specification',
        fields: [
          {
            id: 'retainer-arch',
            label: 'Arch type',
            key: 'arch_type',
            type: 'select',
            required: false,
            options: [
              { label: 'Upper', value: 'upper' },
              { label: 'Lower', value: 'lower' },
              { label: 'Both', value: 'both' },
            ],
          },
          {
            id: 'total-sets-ordered',
            label: 'Total sets ordered',
            key: 'total_sets_ordered',
            type: 'number',
            required: false,
            options: [],
          },
          {
            id: 'retainer-material',
            label: 'Material',
            key: 'material',
            type: 'select',
            required: false,
            options: [
              { label: 'Acrylic', value: 'acrylic' },
              { label: 'Essix', value: 'essix' },
              { label: 'Hawley', value: 'hawley' },
            ],
          },
        ],
      },
    ],
  },
]

export const appliances = applianceResponses.map(toAppliance)
