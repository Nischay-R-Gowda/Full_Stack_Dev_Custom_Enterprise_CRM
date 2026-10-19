import { Router } from 'express'
import { getDeals, getDeal, createDeal, updateDeal, deleteDeal, moveDealStage } from '../controllers/deals.js'

const router = Router()

router.get('/', (req, res) => {
  getDeals(req.query).then(data => res.json(data)).catch(err => res.status(500).json({ error: err.message }))
})
router.get('/:id', (req, res) => {
  getDeal(Number(req.params.id)).then(data => data ? res.json(data) : res.status(404).json({ error: 'Deal not found' })).catch(err => res.status(500).json({ error: err.message }))
})
router.post('/', (req, res) => {
  createDeal(req.body).then(data => res.status(201).json(data)).catch(err => res.status(400).json({ error: err.message }))
})
router.put('/:id', (req, res) => {
  updateDeal(Number(req.params.id), req.body).then(data => res.json(data)).catch(err => res.status(400).json({ error: err.message }))
})
router.delete('/:id', (req, res) => {
  deleteDeal(Number(req.params.id)).then(() => res.json({ success: true })).catch(err => res.status(500).json({ error: err.message }))
})
router.patch('/:id/stage', (req, res) => {
  moveDealStage(Number(req.params.id), req.body.stageId).then(data => res.json(data)).catch(err => res.status(400).json({ error: err.message }))
})

export default router
