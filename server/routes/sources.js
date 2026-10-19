import { Router } from 'express'
import { prisma, getSystemUserId } from '../utils/db.js'
import { generateLeadNumber, findOrCreateContact } from '../controllers/leads.js'

const router = Router()

// ─────────────────────────────────────────────────────────────
// SIMULATED lead sources.
//
// IMPORTANT: these are demonstrations, not real integrations.
// No Google Ads, Meta Ads, form-webhook or telephony API is contacted.
// Each handler fabricates a plausible enquiry and writes it through the
// normal database path so the Leads page and Dashboard update exactly as
// they would for a real source.
// ─────────────────────────────────────────────────────────────

const SCENARIOS = {
  'google-ads': {
    source: 'google_ads',
    type: 'mql',
    notes: 'SIMULATED: Generated from a Google Ads search campaign.',
    people: [
      ['Priya Sharma', 'TechVista Solutions'],
      ['Rahul Verma', 'CloudBridge Systems'],
      ['Ananya Iyer', 'DataPulse Analytics'],
      ['Vikram Singh', 'NextGen Retail'],
      ['Meera Krishnan', 'FinEdge Capital'],
    ],
  },
  'meta-ads': {
    source: 'meta_ads',
    type: 'mql',
    notes: 'SIMULATED: Generated from a Meta (Facebook/Instagram) ad campaign.',
    people: [
      ['Arjun Reddy', 'PixelCraft Media'],
      ['Sneha Kapoor', 'BrandForge Agency'],
      ['Karthik Nair', 'SocialHive Tech'],
      ['Divya Patel', 'AdVantage Labs'],
      ['Rohan Das', 'ClickWave Inc'],
    ],
  },
  'website-form': {
    source: 'website',
    type: 'mql',
    notes: 'SIMULATED: Submitted via the website contact form.',
    people: [
      ['Kavya Menon', 'WebFlow Systems'],
      ['Siddharth Rao', 'PageTurner Labs'],
      ['Isha Gupta', 'ClickPath Digital'],
      ['Aditya Joshi', 'FormBuild Co'],
      ['Riya Chatterjee', 'LandingPad Tech'],
    ],
  },
  'inbound-call': {
    source: 'inbound_call',
    type: 'mql',
    notes: 'SIMULATED: Received as an inbound phone call.',
    people: [
      ['Nikhil Desai', 'VoiceFirst CRM'],
      ['Pooja Srinivasan', 'CallConnect Inc'],
      ['Amit Banerjee', 'DialLogic Solutions'],
      ['Lakshmi Reddy', 'RingCentral Partners'],
      ['Sanjay Malhotra', 'TalkTrack Tech'],
    ],
  },
}

function buildSimulatedLead(scenario) {
  const [fullName, company] = scenario.people[Math.floor(Math.random() * scenario.people.length)]
  const [firstName, ...rest] = fullName.split(' ')
  const lastName = rest.join(' ')

  return {
    firstName,
    lastName,
    company,
    // A random suffix keeps repeat simulations from colliding on the unique
    // email column, which is what let duplicates slip into the database.
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 900 + 100)}@simulation.local`,
    phone: `+91 ${Math.floor(9000000000 + Math.random() * 999999999)}`,
  }
}

async function simulateLead(req, res) {
  try {
    // Each route passes its own scenario key, because these are static paths
    // (/google-ads) rather than a parameterised one (/source/:source).
    const scenario = SCENARIOS[req.scenarioKey]
    if (!scenario) return res.status(404).json({ error: 'Unknown lead source.' })

    const enquiry = buildSimulatedLead(scenario)

    const contact = await findOrCreateContact({
      ...enquiry,
      leadSource: scenario.source,
    })

    const lead = await prisma.lead.create({
      data: {
        leadNumber: generateLeadNumber(),
        contactId: contact.id,
        createdById: await getSystemUserId(),
        source: scenario.source,
        type: scenario.type,
        status: 'new',
        company: enquiry.company,
        notes: scenario.notes,
        expectedValue: Math.floor(50000 + Math.random() * 250000),
      },
      include: { contact: true },
    })

    return res.status(201).json(lead)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

// Register each simulated channel. `attachScenario` stamps the scenario key onto
// the request so the shared handler knows which channel it is serving.
function attachScenario(key) {
  return (req, res, next) => { req.scenarioKey = key; next() }
}

router.post('/google-ads', attachScenario('google-ads'), simulateLead)
router.post('/meta-ads', attachScenario('meta-ads'), simulateLead)
router.post('/website-form', attachScenario('website-form'), simulateLead)
router.post('/inbound-call', attachScenario('inbound-call'), simulateLead)

export default router
