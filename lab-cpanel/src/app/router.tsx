import { createBrowserRouter, Navigate } from 'react-router-dom'

import { DashboardPage } from '../features/dashboard'
import { CasePipelinePage, CreateCasePage } from '../features/case-pipeline'
import { CasesPage } from '../features/cases'
import { DoctorDetailsPage } from '../features/doctors-clinics'
import { DoctorsPage } from '../features/doctors'
import { ClinicsPage } from '../features/clinics'
import { ApplianceDetailsPage, AppliancesPage } from '../features/appliances'
import { ApplianceWorkflowTemplatesPage } from '../features/appliance-workflow-templates'
import { LabSettingsPage } from '../features/lab-settings'
import { LabTenantProfilePage } from '../features/lab-profile'
import { StaffPage } from '../features/staff'
import { RolesPermissionsPage } from '../features/roles-permissions'
import { PoliciesPage, PolicyDetailsPage } from '../features/policies'
import { DataTablePlaygroundPage } from '../features/data-table-playground'
import { ForgotPasswordPage, SignInPage } from '../features/auth'
import { AppLayout } from './layout/AppLayout'
import { NotFoundPage } from './pages/NotFoundPage'
import { ModelViewerRoute } from './routes/ModelViewerRoute'
// import { RequireAuth } from './guards/RequireAuth'

export const router = createBrowserRouter([
  { path: 'sign-in', element: <SignInPage /> },
  { path: 'forgot-password', element: <ForgotPasswordPage /> },
  { path: 'model-viewer', element: <ModelViewerRoute /> },
  { path: 'stl-viewer', element: <ModelViewerRoute /> },
  {
    path: '/',
    element: (
      <AppLayout />
      // <RequireAuth>
      // </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'appliances', element: <AppliancesPage /> },
      { path: 'appliances/:applianceId', element: <ApplianceDetailsPage /> },
      { path: 'appliance-workflow-templates', element: <ApplianceWorkflowTemplatesPage /> },
      { path: 'policies', element: <PoliciesPage /> },
      { path: 'policies/:policyKey', element: <PolicyDetailsPage /> },
      { path: 'settings', element: <LabSettingsPage /> },
      { path: 'lab-profile', element: <LabTenantProfilePage /> },
      { path: 'staff', element: <StaffPage /> },
      { path: 'roles-permissions', element: <RolesPermissionsPage /> },
      { path: 'cases', element: <CasesPage /> },
      { path: 'cases/new', element: <CreateCasePage /> },
      { path: 'cases/:caseNumberCode', element: <CasePipelinePage /> },
      { path: 'doctors-clinics', element: <Navigate to="/doctors" replace /> },
      { path: 'doctors', element: <DoctorsPage /> },
      { path: 'clinics', element: <ClinicsPage /> },
      { path: 'doctors/:doctorId', element: <DoctorDetailsPage /> },
      { path: 'doctors-clinics/doctors/:doctorId', element: <DoctorDetailsPage /> },
      ...(import.meta.env.DEV ? [{ path: 'dev/data-table', element: <DataTablePlaygroundPage /> }] : []),
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
