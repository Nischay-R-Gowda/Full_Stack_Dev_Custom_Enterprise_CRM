import { prisma } from '../utils/db.js'

// ── Pipelines ──────────────────────────────────────────────────
function pickPipelineFields(data) {
  const fields = {}
  if (data.name !== undefined) fields.name = String(data.name).trim()
  if (data.description !== undefined) fields.description = data.description ? String(data.description).trim() : null
  if (data.isDefault !== undefined) fields.isDefault = Boolean(data.isDefault)
  return fields
}

const pipelineInclude = { stages: { orderBy: { position: 'asc' } } }

// A brand-new pipeline would otherwise appear with no stages, which produced
// an empty Kanban board that the user could not fix from the UI.
const DEFAULT_STAGES = [
  { name: 'New Opportunity', color: '#6366f1' },
  { name: 'Qualified', color: '#8b5cf6' },
  { name: 'Demo Scheduled', color: '#ec4899' },
  { name: 'Proposal', color: '#f59e0b' },
  { name: 'Negotiation', color: '#3b82f6' },
  { name: 'Closed Won', color: '#22c55e', isClosedWon: true },
  { name: 'Closed Lost', color: '#ef4444', isClosedLost: true },
]

export async function getPipelines() {
  return prisma.pipeline.findMany({
    include: { stages: { orderBy: { position: 'asc' }, include: { _count: { select: { deals: true } } } } },
    orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
  })
}

export async function getPipeline(id) {
  return prisma.pipeline.findUnique({ where: { id }, include: pipelineInclude })
}

export async function createPipeline(data) {
  const fields = pickPipelineFields(data)
  if (!fields.name) throw new Error('Pipeline name is required.')

  // Client may supply its own stages; otherwise seed the default ladder.
  const requestedStages = Array.isArray(data.stages) && data.stages.length > 0
    ? data.stages
    : DEFAULT_STAGES

  const stages = requestedStages.map((s, index) => ({
    name: String(s.name).trim(),
    color: s.color || '#6366f1',
    position: Number.isInteger(s.position) ? s.position : index,
    isClosedWon: Boolean(s.isClosedWon),
    isClosedLost: Boolean(s.isClosedLost),
  }))

  if (fields.isDefault) {
    // Only one pipeline may be the default, otherwise the Kanban board picks
    // whichever row Prisma happens to return first.
    await prisma.pipeline.updateMany({ where: { isDefault: true }, data: { isDefault: false } })
  }

  return prisma.pipeline.create({
    data: { ...fields, stages: { create: stages } },
    include: { stages: { orderBy: { position: 'asc' } } },
  })
}

export async function updatePipeline(id, data) {
  const pipeline = await prisma.pipeline.findUnique({ where: { id } })
  if (!pipeline) throw new Error('Pipeline not found.')

  // Only the pipeline's own columns are writable — the previous version passed
  // the whole client object (including `id` and a nested `stages` array) into
  // prisma.pipeline.update(), which Prisma rejects.
  const fields = pickPipelineFields(data)
  if (!Object.keys(fields).length) throw new Error('No updatable fields were provided.')

  if (fields.isDefault) {
    await prisma.pipeline.updateMany({ where: { isDefault: true, id: { not: id } }, data: { isDefault: false } })
  }

  return prisma.pipeline.update({ where: { id }, data: fields, include: { stages: { orderBy: { position: 'asc' } } } })
}

export async function deletePipeline(id) {
  const pipeline = await prisma.pipeline.findUnique({ where: { id } })
  if (!pipeline) throw new Error('Pipeline not found.')

  const deals = await prisma.deal.count({ where: { pipelineId: id } })
  if (deals > 0) throw new Error(`Cannot delete: ${deals} deal(s) exist in this pipeline. Reassign them first.`)

  return prisma.pipeline.delete({ where: { id } })
}

// ── Stages ────────────────────────────────────────────────────
function pickStageFields(data) {
  const fields = {}
  if (data.name !== undefined) fields.name = String(data.name).trim()
  if (data.color !== undefined) fields.color = data.color
  if (data.position !== undefined) fields.position = Number(data.position)
  if (data.isClosedWon !== undefined) fields.isClosedWon = Boolean(data.isClosedWon)
  if (data.isClosedLost !== undefined) fields.isClosedLost = Boolean(data.isClosedLost)
  return fields
}

export async function createStage(pipelineId, data) {
  const pipeline = await prisma.pipeline.findUnique({ where: { id: pipelineId } })
  if (!pipeline) throw new Error('Pipeline not found.')

  const fields = pickStageFields(data)
  if (!fields.name) throw new Error('Stage name is required.')
  if (fields.isClosedWon && fields.isClosedLost) {
    throw new Error('A stage cannot be both Closed Won and Closed Lost.')
  }

  // Append to the end unless a position is explicitly supplied.
  if (fields.position === undefined) {
    const last = await prisma.stage.findFirst({ where: { pipelineId }, orderBy: { position: 'desc' } })
    fields.position = last ? last.position + 1 : 0
  }

  return prisma.stage.create({ data: { ...fields, pipelineId }, include: { pipeline: true } })
}

export async function updateStage(id, data) {
  const stage = await prisma.stage.findUnique({ where: { id } })
  if (!stage) throw new Error('Stage not found.')

  const fields = pickStageFields(data)
  if (!Object.keys(fields).length) throw new Error('No updatable fields were provided.')

  if (fields.isClosedWon && fields.isClosedLost) {
    throw new Error('A stage cannot be both Closed Won and Closed Lost.')
  }

  return prisma.stage.update({ where: { id }, data: fields, include: { pipeline: true } })
}

/**
 * Refuse to delete a stage that still holds deals. Deleting it would orphan
 * those deals, and the schema has no onDelete behaviour for Deal.stageId.
 */
export async function deleteStage(id) {
  const stage = await prisma.stage.findUnique({ where: { id } })
  if (!stage) throw new Error('Stage not found.')

  const deals = await prisma.deal.count({ where: { stageId: id } })
  if (deals > 0) {
    throw new Error(`Cannot delete: ${deals} deal(s) are still in this stage. Move them to another stage first.`)
  }

  return prisma.stage.delete({ where: { id } })
}

export async function reorderStages(pipelineId, stageIds = []) {
  if (!Array.isArray(stageIds) || stageIds.length === 0) {
    throw new Error('An ordered list of stage ids is required.')
  }

  // Verify every id really belongs to this pipeline before rewriting positions.
  const owned = await prisma.stage.count({ where: { pipelineId, id: { in: stageIds.map(Number) } } })
  if (owned !== stageIds.length) {
    throw new Error('One or more stages do not belong to this pipeline.')
  }

  return prisma.$transaction(
    stageIds.map((sid, idx) => prisma.stage.update({ where: { id: Number(sid) }, data: { position: idx } }))
  )
}
