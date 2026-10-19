import { Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Dashboard from './components/dashboard/Dashboard'
import Contacts from './components/contacts/Contacts'
import Leads from './components/leads/Leads'
import Deals from './components/deals/Deals'
import Pipelines from './components/pipelines/Pipelines'
import Sources from './components/sources/Sources'
import Activities from './components/activities/Activities'
import Reports from './components/reports/Reports'
import NotFound from './components/common/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell breadcrumbs={['Dashboard']}><Dashboard /></AppShell>} />
      <Route path="/contacts" element={<AppShell breadcrumbs={['Contacts']}><Contacts /></AppShell>} />
      <Route path="/leads" element={<AppShell breadcrumbs={['Leads']}><Leads /></AppShell>} />
      <Route path="/deals" element={<AppShell breadcrumbs={['Deals & Pipeline']}><Deals /></AppShell>} />
      <Route path="/pipelines" element={<AppShell breadcrumbs={['Pipelines']}><Pipelines /></AppShell>} />
      <Route path="/sources" element={<AppShell breadcrumbs={['Lead Sources']}><Sources /></AppShell>} />
      <Route path="/activities" element={<AppShell breadcrumbs={['Activities']}><Activities /></AppShell>} />
      <Route path="/reports" element={<AppShell breadcrumbs={['Reports']}><Reports /></AppShell>} />
      <Route path="*" element={<AppShell breadcrumbs={['404']}><NotFound /></AppShell>} />
    </Routes>
  )
}
