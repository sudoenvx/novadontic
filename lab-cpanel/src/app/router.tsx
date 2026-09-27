import { createBrowserRouter } from 'react-router-dom'

import { DashboardPage } from '../features/dashboard'
import { CasePipelinePage } from '../features/case-pipeline'
import { DoctorDetailsPage, DoctorsClinicsPage } from '../features/doctors-clinics'
import { ApplianceDetailsPage, AppliancesPage } from '../features/appliances'
import { ApplianceWorkflowTemplatesPage } from '../features/appliance-workflow-templates'
import { AppLayout } from './layout/AppLayout'
import { NotFoundPage } from './pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'appliances', element: <AppliancesPage /> },
      { path: 'appliances/:applianceId', element: <ApplianceDetailsPage /> },
      { path: 'appliance-workflow-templates', element: <ApplianceWorkflowTemplatesPage /> },
      { path: 'cases', element: <CasePipelinePage /> },
      { path: 'doctors-clinics', element: <DoctorsClinicsPage /> },
      { path: 'doctors-clinics/doctors/:doctorId', element: <DoctorDetailsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
