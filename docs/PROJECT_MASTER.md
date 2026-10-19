# Project Master Document — Nexus CRM

## 1. Project Overview

**Name:** Nexus CRM
**Type:** Full-stack CRM web application
**Purpose:** Semester 1 project + personal mega project
**Timeline:** ~14 days, 3-4 hours/day

## 2. Product Workflow

```
Lead Sources → New Lead / MQL → Contact Association → Qualification → SQL
    → Deal Creation → Sales Pipeline → Closed Won / Closed Lost
    → Dashboard & Analytics
```

### Lead Sources
- Google Ads (simulated)
- Meta Ads (simulated)
- Website Forms (simulated)
- Inbound Calls (simulated)
- Referrals (manual entry)
- Manual Entry

### Lead Lifecycle
| Status | Type | Description |
|--------|------|-------------|
| New | MQL | Fresh lead, no contact yet |
| Attempting Contact | MQL | Trying to reach |
| Connected | MQL | Contact established |
| Qualified | SQL | Ready for sales |
| Converted | Deal | Became an opportunity |

## 3. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React | 19.2.8 |
| Build Tool | Vite | 8.3.0 |
| Styling | Tailwind CSS | 4.3.3 |
| Charts | Recharts | 3.10.1 |
| Icons | Lucide React | 1.51.0 |
| Routing | React Router DOM | 7.18.4 |
| Backend | Express.js | 5.3.0 |
| Database | SQLite + Prisma | 6.8.0 |
| Notifications | React Hot Toast | — |

## 4. Application Modules

### A. Application Shell
- Responsive sidebar with navigation
- Top header with search, notifications, user profile
- Breadcrumbs
- React Router navigation
- Collapsible sidebar

### B. Dashboard (8 KPI Cards + 4 Charts)
- Total Contacts, Total Leads, MQLs, SQLs
- Open Deals, Open Pipeline Value, Closed Won Revenue, Conversion Rate
- Lead Acquisition Over Time (Line Chart)
- Leads by Source (Pie Chart)
- Lead Status Distribution (Bar Chart)
- Revenue Overview (Pipeline vs Won vs Lost)
- Recent Leads, Recent Activities

### C. Contacts
- Full CRUD operations
- Search, sort, lifecycle stage filter
- Duplicate email prevention
- Contact detail view with associated leads/deals/activities
- Form validation

### D. Leads
- List with search, status/source/type filters
- MQL/SQL/Deal type badges
- Contact association (create or link existing)
- Qualification workflow (MQL → SQL → Deal)
- Status progression
- Activity history

### E. Deals & Pipeline
- Kanban board with pipeline stages
- Move deals forward/backward between stages
- Deal amount, probability, expected close date
- Create/edit/delete deals
- Pipeline selector filter
- Stage totals and deal counts

### F. Customizable Pipelines
- Create/rename pipelines
- Add/rename/delete stages
- Configure stage colors
- Mark stages as Closed Won/Closed Lost
- Safe deletion (reassign deals first)

### G. Lead Sources
- 4 simulated source cards (Google Ads, Meta Ads, Website Form, Inbound Call)
- Each creates realistic records with contact association
- Clear simulation labels
- Success feedback with toast notifications

### H. Activities & Follow-ups
- Create calls, emails, meetings, notes, tasks
- Due dates and priority levels
- Mark activities complete
- Filter by type

### I. Reports
- Leads by source, status, over time
- Deals by stage
- Pipeline value
- Won/lost distribution
- CSV export

## 5. Database Schema Summary

```
User (id, email, name, role)
  └─→ Lead (createdById)
  └─→ Deal (createdById)
  └─→ Activity (createdById)

Contact (id, firstName, lastName, email, phone, company, jobTitle, location, leadSource, lifecycleStage, notes)
  ├─→ Lead (contactId) — optional
  ├─→ Deal (contactId)
  └─→ Activity (contactId) — optional

Lead (id, leadNumber, status, type, source, company, notes, qualificationNotes, contactId)
  ├─→ Contact (contactId)
  ├─→ Activity (leadId) — optional
  └─→ User (createdById)

Pipeline (id, name, description, isDefault)
  └─→ Stage (pipelineId)
  └─→ Deal (pipelineId)

Stage (id, name, position, color, isClosedWon, isClosedLost)
  └─→ Deal (stageId)

Deal (id, dealName, amount, probability, expectedCloseDate, actualCloseDate, status, lostReason, notes)
  ├─→ Contact (contactId)
  ├─→ Stage (stageId)
  ├─→ Pipeline (pipelineId)
  ├─→ User (createdById)
  └─→ Activity (dealId) — optional

Activity (id, type, subject, description, dueDate, completed, priority)
  ├─→ Contact (contactId) — optional
  ├─→ Lead (leadId) — optional
  ├─→ Deal (dealId) — optional
  └─→ User (createdById)
```

## 6. API Routes

### Contacts
- `GET /api/contacts` — List with search/sort/filter
- `GET /api/contacts/:id` — Get one
- `POST /api/contacts` — Create
- `PUT /api/contacts/:id` — Update
- `DELETE /api/contacts/:id` — Delete

### Leads
- `GET /api/leads` — List with filters
- `GET /api/leads/:id` — Get one
- `POST /api/leads` — Create
- `PUT /api/leads/:id` — Update
- `DELETE /api/leads/:id` — Delete
- `POST /api/leads/:id/qualify` — Qualify (MQL→SQL→Deal)
- `POST /api/leads/:id/convert` — Convert to deal

### Deals
- `GET /api/deals` — List
- `GET /api/deals/:id` — Get one
- `POST /api/deals` — Create
- `PUT /api/deals/:id` — Update
- `DELETE /api/deals/:id` — Delete
- `PATCH /api/deals/:id/stage` — Move to stage

### Pipelines
- `GET /api/pipelines` — List all
- `GET /api/pipelines/:id` — Get one
- `POST /api/pipelines` — Create
- `PUT /api/pipelines/:id` — Update
- `DELETE /api/pipelines/:id` — Delete
- `POST /api/pipelines/:id/stages` — Add stage
- `PUT /api/pipelines/stages/:id` — Update stage
- `DELETE /api/pipelines/stages/:id` — Delete stage

### Dashboard
- `GET /api/dashboard` — All dashboard metrics

### Activities
- `GET /api/activities` — List with filters
- `GET /api/activities/:id` — Get one
- `POST /api/activities` — Create
- `PUT /api/activities/:id` — Update
- `DELETE /api/activities/:id` — Delete

### Sources
- `POST /api/sources/google-ads` — Simulate Google Ads lead
- `POST /api/sources/meta-ads` — Simulate Meta Ads lead
- `POST /api/sources/website-form` — Simulate website lead
- `POST /api/sources/inbound-call` — Simulate inbound call lead

### Reports
- `GET /api/reports` — Aggregated analytics data

### Health
- `GET /api/health` — Server health check
