import { prisma, getSystemUserId } from '../utils/db.js'

function toNumberOrNull(value) {
  if (value === '' || value === null || value === undefined) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function toDateOrNull(value) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

const dealInclude = {
  contact: true,
  stage: true,
  pipeline: true,
  activities: { orderBy: { createdAt: 'desc' }, take: 10 },
}

const DEAL_STATUSES = ['open', 'won', 'lost']

function pickDealFields(data) {
  const fields = {}
  if (data.dealName !== undefined) fields.dealName = String(data.dealName).trim()
  if (data.amount !== undefined) fields.amount = toNumberOrNull(data.amount) ?? 0
  if (data.probability !== undefined) fields.probability = toNumberOrNull(data.probability) ?? 50
  if (data.expectedCloseDate !== undefined) fields.expectedCloseDate = toDateOrNull(data.expectedCloseDate)
  if (data.actualCloseDate !== undefined) fields.actualCloseDate = toDateOrNull(data.actualCloseDate)
  if (data.status !== undefined) fields.status = data.status
  if (data.lostReason !== undefined) fields.lostReason = data.lostReason || null
  if (data.notes !== undefined) fields.notes = data.notes ? String(data.notes).trim() : null
  if (data.contactId !== undefined) fields.contactId = toNumberOrNull(data.contactId)
  if (data.stageId !== undefined) fields.stageId = toNumberOrNull(data.stageId)
  if (data.pipelineId !== undefined) fields.pipelineId = toNumberOrNull(data.pipelineId)
  return fields
}

function validateDeal(fields, { partial = false } = {}) {
  if (!partial && !fields.dealName) throw new Error('Deal name is required.')
  if (fields.status !== undefined && !DEAL_STATUSES.includes(fields.status)) {
    throw new Error(`Deal status must be one of: ${DEAL_STATUSES.join(', ')}.`)
  }
  if (fields.probability !== undefined && (fields.probability < 0 || fields.probability > 100)) {
    throw new Error('Probability must be between 0 and 100.')
  }
}

export async function getDeals({ search = '', status = '', stageId = '', pipelineId = '' } = {}) {
  const where = {
    ...(search ? { dealName: { contains: search } } : {}),
    ...(status ? { status } : {}),
    ...(stageId ? { stageId: Number(stageId) } : {}),
    ...(pipelineId ? { pipelineId: Number(pipelineId) } : {}),
  }
  return prisma.deal.findMany({ where, orderBy: { createdAt: 'desc' }, include: dealInclude })
}

export async function getDeal(id) {
  return prisma.deal.findUnique({ where: { id }, include: dealInclude })
}

export async function createDeal(data) {
  const fields = pickDealFields(data)
  validateDeal(fields)

  if (!fields.contactId) throw new Error('A contact must be associated with the deal.')
  if (!fields.stageId) throw new Error('A pipeline stage must be selected.')

  // Derive the pipeline from the stage when the client does not send one, so a
  // deal can never end up attached to a stage from a different pipeline.
  let pipelineId = fields.pipelineId
  if (!pipelineId) {
    const stage = await prisma.stage.findUnique({ where: { id: fields.stageId } })
    if (!stage) throw new Error('Selected stage does not exist.')
    pipelineId = stage.pipelineId
  } else {
    const stage = await prisma.stage.findFirst({ where: { id: fields.stageId, pipelineId } })
    if (!stage) throw new Error('The selected stage does not belong to the selected pipeline.')
  }

  const contact = await prisma.contact.findUnique({ where: { id: fields.contactId } })
  if (!contact) throw new Error('The associated contact does not exist.')

  return prisma.deal.create({
    data: { ...fields, pipelineId, createdById: await getSystemUserId() },
    include: dealInclude,
  })
}

export async function updateDeal(id, data) {
  const deal = await prisma.deal.findUnique({ where: { id } })
  if (!deal) throw new Error('Deal not found.')

  const fields = pickDealFields(data)
  validateDeal(fields, { partial: true })

  // Same stage/pipeline consistency guard as create.
  if (fields.stageId) {
    const pipelineId = fields.pipelineId ?? deal.pipelineId
    const stage = await prisma.stage.findFirst({ where: { id: fields.stageId, pipelineId } })
    if (!stage) throw new Error('The selected stage does not belong to the deal pipeline.')
  }

  if (fields.contactId) {
    const contact = await prisma.contact.findUnique({ where: { id: fields.contactId } })
    if (!contact) throw new Error('The associated contact does not exist.')
  }

  return prisma.deal.update({ where: { id }, data: fields, include: dealInclude })
}

export async function deleteDeal(id) {
  const deal = await prisma.deal.findUnique({ where: { id } })
  if (!deal) throw new Error('Deal not found.')
  return prisma.deal.delete({ where: { id } })
}

/**
 * Move a deal to another stage.
 *
 * Status is derived from the stage flags (isClosedWon / isClosedLost) so the
 * dashboard can correctly separate open pipeline value from closed-won
 * revenue and closed-lost value.
 */
export async function moveDealStage(id, stageId) {
  const numericStageId = Number(stageId)
  if (!Number.isInteger(numericStageId)) throw new Error('A valid stage id is required.')

  const stage = await prisma.stage.findUnique({ where: { id: numericStageId } })
  if (!stage) throw new Error('Stage not found.')

  const deal = await prisma.deal.findUnique({ where: { id } })
  if (!deal) throw new Error('Deal not found.')

  let dealStatus = 'open'
  if (stage.isClosedWon) dealStatus = 'won'
  else if (stage.isClosedLost) dealStatus = 'lost'

  const isClosing = stage.isClosedWon || stage.isClosedLost

  return prisma.deal.update({
    where: { id },
    data: {
      stageId: numericStageId,
      pipelineId: stage.pipelineId,
      status: dealStatus,
      actualCloseDate: isClosing ? new Date() : null,
    },
    include: dealInclude,
  })
}
