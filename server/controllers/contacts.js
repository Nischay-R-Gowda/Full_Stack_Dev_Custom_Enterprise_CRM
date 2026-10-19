import { prisma } from '../utils/db.js'

// Lifecycle stages a Contact can occupy, mirrored from the frontend so the
// API can reject nonsense values instead of silently storing them.
const LIFECYCLE_STAGES = ['lead', 'mql', 'sql', 'customer']

// Only these columns may be written to a Contact row. Anything else the client
// sends (id, createdAt, nested relations...) is dropped so Prisma never throws
// "Unknown argument".
function pickContactFields(data) {
  const fields = {}
  if (data.firstName !== undefined) fields.firstName = String(data.firstName).trim()
  if (data.lastName !== undefined) fields.lastName = String(data.lastName).trim()
  if (data.email !== undefined) fields.email = String(data.email).trim().toLowerCase()
  if (data.phone !== undefined) fields.phone = data.phone ? String(data.phone).trim() : null
  if (data.company !== undefined) fields.company = data.company ? String(data.company).trim() : null
  if (data.jobTitle !== undefined) fields.jobTitle = data.jobTitle ? String(data.jobTitle).trim() : null
  if (data.location !== undefined) fields.location = data.location ? String(data.location).trim() : null
  if (data.leadSource !== undefined) fields.leadSource = data.leadSource
  if (data.lifecycleStage !== undefined) fields.lifecycleStage = data.lifecycleStage
  if (data.notes !== undefined) fields.notes = data.notes ? String(data.notes).trim() : null
  return fields
}

function validateContact(fields, { partial = false } = {}) {
  if (!partial) {
    if (!fields.firstName) throw new Error('First name is required.')
    if (!fields.lastName) throw new Error('Last name is required.')
  }
  if (fields.email !== undefined) {
    if (!fields.email) throw new Error('Email address is required.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) throw new Error('Please enter a valid email address.')
  }
  if (fields.lifecycleStage !== undefined && !LIFECYCLE_STAGES.includes(fields.lifecycleStage)) {
    throw new Error(`Lifecycle stage must be one of: ${LIFECYCLE_STAGES.join(', ')}.`)
  }
}

const contactInclude = {
  leads: { orderBy: { createdAt: 'desc' } },
  deals: { include: { stage: true, pipeline: true }, orderBy: { createdAt: 'desc' } },
  activities: { orderBy: { createdAt: 'desc' }, take: 10 },
}

export async function getContacts({ search = '', sortBy = 'createdAt', sortOrder = 'desc', lifecycleStage = '' } = {}) {
  const where = {
    ...(search ? {
      OR: [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { company: { contains: search } },
      ],
    } : {}),
    ...(lifecycleStage ? { lifecycleStage } : {}),
  }

  // Whitelist the sort column so a bad query param cannot crash the query.
  const sortable = ['firstName', 'lastName', 'email', 'company', 'createdAt', 'lifecycleStage', 'leadSource']
  const safeSortBy = sortable.includes(sortBy) ? sortBy : 'createdAt'
  const safeSortOrder = sortOrder === 'asc' ? 'asc' : 'desc'

  return prisma.contact.findMany({
    where,
    orderBy: { [safeSortBy]: safeSortOrder },
    include: contactInclude,
  })
}

export async function getContact(id) {
  return prisma.contact.findUnique({ where: { id }, include: contactInclude })
}

export async function createContact(data) {
  const fields = pickContactFields(data)
  validateContact(fields)

  const existing = await prisma.contact.findUnique({ where: { email: fields.email } })
  if (existing) throw new Error('A contact with this email already exists.')

  return prisma.contact.create({ data: fields, include: contactInclude })
}

export async function updateContact(id, data) {
  const existingContact = await prisma.contact.findUnique({ where: { id } })
  if (!existingContact) throw new Error('Contact not found.')

  const fields = pickContactFields(data)
  validateContact(fields, { partial: true })

  // Duplicate check only runs when an email is actually being changed.
  if (fields.email && fields.email !== existingContact.email) {
    const clash = await prisma.contact.findUnique({ where: { email: fields.email } })
    if (clash) throw new Error('Another contact with this email already exists.')
  }

  return prisma.contact.update({ where: { id }, data: fields, include: contactInclude })
}

export async function deleteContact(id) {
  const deals = await prisma.deal.count({ where: { contactId: id } })
  if (deals > 0) {
    throw new Error(`Cannot delete: ${deals} deal(s) are still linked to this contact.`)
  }
  return prisma.contact.delete({ where: { id } })
}
