import { Router } from 'express'
import { getContacts, getContact, createContact, updateContact, deleteContact } from '../controllers/contacts.js'

const router = Router()

router.get('/', (req, res) => {
  getContacts(req.query).then(data => res.json(data)).catch(err => res.status(500).json({ error: err.message }))
})
router.get('/:id', (req, res) => {
  getContact(Number(req.params.id)).then(data => data ? res.json(data) : res.status(404).json({ error: 'Contact not found' })).catch(err => res.status(500).json({ error: err.message }))
})
router.post('/', (req, res) => {
  createContact(req.body).then(data => res.status(201).json(data)).catch(err => res.status(400).json({ error: err.message }))
})
router.put('/:id', (req, res) => {
  updateContact(Number(req.params.id), req.body).then(data => res.json(data)).catch(err => res.status(400).json({ error: err.message }))
})
router.delete('/:id', (req, res) => {
  deleteContact(Number(req.params.id)).then(() => res.json({ success: true })).catch(err => res.status(500).json({ error: err.message }))
})

export default router
