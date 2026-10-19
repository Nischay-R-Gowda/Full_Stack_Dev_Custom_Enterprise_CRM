import { PrismaClient } from '@prisma/client'

// ── Shared database access ─────────────────────────────────────
// Every controller imports this single PrismaClient instance instead of
// creating its own. Prisma opens a connection pool per client, so multiple
// instances would exhaust SQLite's file locks under load.
export const prisma = new PrismaClient()

// Nexus CRM has no authentication (documented limitation), so every record
// is attributed to the first user in the database — the seeded admin.
// Resolving it here means controllers never trust a client-supplied id.
export async function getSystemUserId() {
  const user = await prisma.user.findFirst({ orderBy: { id: 'asc' } })
  if (!user) {
    throw new Error('No user found in the database. Run `npm run db:seed` to create the admin user.')
  }
  return user.id
}
