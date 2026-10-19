import { PrismaClient } from '@prisma/client'
import { getConversionMetrics } from '../services/metrics.js'

const prisma = new PrismaClient()

export async function getDashboardData() {
  const [
    totalContacts,
    totalLeads,
    mqlCount,
    sqlCount,
    openDeals,
    openPipelineValue,
    closedWonRevenue,
    closedLostValue,
    leadsBySource,
    leadsByStatus,
    dealsByStage,
    recentLeads,
    recentActivities,
    leadsOverTime,
    conversionRate,
  ] = await Promise.all([
    prisma.contact.count(),
    prisma.lead.count(),
    prisma.lead.count({ where: { type: 'mql' } }),
    prisma.lead.count({ where: { type: 'sql' } }),
    prisma.deal.count({ where: { status: 'open' } }),
    prisma.deal.aggregate({ where: { status: 'open' }, _sum: { amount: true } }),
    prisma.deal.aggregate({ where: { status: 'won' }, _sum: { amount: true } }),
    prisma.deal.aggregate({ where: { status: 'lost' }, _sum: { amount: true } }),
    prisma.lead.groupBy({ by: ['source'], _count: { _all: true } }),
    prisma.lead.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.deal.groupBy({ by: ['stageId'], where: { status: 'open' }, _sum: { amount: true } }),
    prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { contact: true } }),
    prisma.activity.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { contact: true, lead: true, deal: true } }),
    getLeadsOverTime(prisma),
    getConversionMetrics(),
  ])

  return {
    totalContacts, totalLeads, mqlCount, sqlCount, openDeals,
    openPipelineValue: openPipelineValue._sum.amount || 0,
    closedWonRevenue: closedWonRevenue._sum.amount || 0,
    closedLostValue: closedLostValue._sum.amount || 0,
    leadsBySource, leadsByStatus, dealsByStage,
    recentLeads, recentActivities, leadsOverTime, conversionRate,
  }
}

async function getLeadsOverTime(prisma) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const leads = await prisma.lead.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
  const grouped = {}
  leads.forEach(l => {
    const key = l.createdAt.toISOString().split('T')[0]
    grouped[key] = (grouped[key] || 0) + 1
  })
  return Object.entries(grouped).map(([date, count]) => ({ date, count }))
}
