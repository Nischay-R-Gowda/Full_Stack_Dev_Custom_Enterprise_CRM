import { Router } from 'express'
import { getActivities, getActivity, createActivity, updateActivity, deleteActivity } from '../controllers/activities.js'

const router = Router()

router.get('/', (req, res) => {
  getActivities(req.query).then(data => res.json(data)).catch(err => res.status(500).json({ error: err.message }))
})
router.get('/:id', (req, res) => {
  getActivity(Number(req.params.id)).then(data => data ? res.json(data) : res.status(404).json({ error: 'Activity not found' })).catch(err => res.status(500).json({ error: err.message }))
})
router.post('/', (req, res) => {
  createActivity(req.body).then(data => res.status(201).json(data)).catch(err => res.status(400).json({ error: err.message }))
})
router.put('/:id', (req, res) => {
  updateActivity(Number(req.params.id), req.body).then(data => res.json(data)).catch(err => res.status(400).json({ error: err.message }))
})
router.delete('/:id', (req, res) => {
  deleteActivity(Number(req.params.id)).then(() => res.json({ success: true })).catch(err => res.status(500).json({ error: err.message }))
})

export default router
