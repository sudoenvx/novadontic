import type { DoctorDetails } from '../domain/doctorDetails'

export const doctorDetailsFixtures: DoctorDetails[] = [
  {
    doctorId: 'nour-hassan',
    memberSince: 'Mar 2024',
    totalCases: 142,
    onTimeRate: '96%',
    averageTurnaround: '8.4 days',
    caseHistory: [
      {
        id: 'OR-4821',
        patientName: 'Yasmin Adel',
        applianceType: 'Clear aligners',
        stage: 'Production',
        status: 'In production',
        updatedAt: 'Today',
      },
      {
        id: 'OR-4804',
        patientName: 'Mariam Tarek',
        applianceType: 'Clear aligners',
        stage: 'Production',
        status: 'In production',
        updatedAt: '20 Sep',
      },
    ],
  },
  {
    doctorId: 'yara-sabry',
    memberSince: 'Jun 2024',
    totalCases: 38,
    onTimeRate: '91%',
    averageTurnaround: '10.2 days',
    caseHistory: [
      {
        id: 'OR-4792',
        patientName: 'Laila Mostafa',
        applianceType: 'Retainers',
        stage: 'Quality check',
        status: 'Quality check',
        updatedAt: 'Yesterday',
      },
    ],
  },
  {
    doctorId: 'karim-adel',
    memberSince: 'Jan 2023',
    totalCases: 96,
    onTimeRate: '94%',
    averageTurnaround: '9.1 days',
    caseHistory: [
      {
        id: 'OR-4779',
        patientName: 'Omar Said',
        applianceType: 'Fixed appliances',
        stage: 'Delivered',
        status: 'Delivered',
        updatedAt: '12 Sep',
      },
    ],
  },
  {
    doctorId: 'salma-fathy',
    memberSince: 'Aug 2023',
    totalCases: 74,
    onTimeRate: '95%',
    averageTurnaround: '8.8 days',
    caseHistory: [
      {
        id: 'OR-4764',
        patientName: 'Farah Nabil',
        applianceType: 'Clear aligners',
        stage: 'Delivered',
        status: 'Delivered',
        updatedAt: '9 Sep',
      },
    ],
  },
  {
    doctorId: 'tamer-fouad',
    memberSince: 'Nov 2022',
    totalCases: 52,
    onTimeRate: '88%',
    averageTurnaround: '12.6 days',
    caseHistory: [],
  },
  {
    doctorId: 'mona-ezzat',
    memberSince: 'Feb 2024',
    totalCases: 41,
    onTimeRate: '93%',
    averageTurnaround: '9.7 days',
    caseHistory: [
      {
        id: 'OR-4748',
        patientName: 'Hany Adel',
        applianceType: 'Expanders',
        stage: 'Quality check',
        status: 'Needs attention',
        updatedAt: '6 Sep',
      },
    ],
  },
]
