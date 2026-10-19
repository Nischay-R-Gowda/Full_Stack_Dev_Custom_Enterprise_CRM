import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { getConversionMetrics, getConversionBySource, getMonthlyRevenue } from '../services/metrics.js'

const prisma = new PrismaClient()

const router = Router()

router.get('/', async (req, res) => {
  try {
    const [leadsBySource, leadsByStatus, dealsByStage, wonLost, monthlyRevenue, conversionRate, conversionBySource] = await Promise.all([
      prisma.lead.groupBy({ by: ['source'], _count: { _all: true } }),
      prisma.lead.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.deal.groupBy({ by: ['stageId'], _count: { _all: true }, _sum: { amount: true } }),
      prisma.deal.groupBy({ by: ['status'], _count: { _all: true }, _sum: { amount: true } }),
      getMonthlyRevenue(),
      getConversionMetrics(),
      getConversionBySource(),
    ])

    res.json({
      leadsBySource,
      leadsByStatus,
      dealsByStage,
      wonLost,
      monthlyRevenue,
      conversionRate,
      conversionBySource,
    })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
