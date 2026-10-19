import { Router } from 'express'
import { getPipelines, getPipeline, createPipeline, updatePipeline, deletePipeline, createStage, updateStage, deleteStage, reorderStages } from '../controllers/pipelines.js'

const router = Router()

router.get('/', (req, res) => {
  getPipelines().then(data => res.json(data)).catch(err => res.status(500).json({ error: err.message }))
})
router.get('/:id', (req, res) => {
  getPipeline(Number(req.params.id)).then(data => data ? res.json(data) : res.status(404).json({ error: 'Pipeline not found' })).catch(err => res.status(500).json({ error: err.message }))
})
router.post('/', (req, res) => {
  createPipeline(req.body).then(data => res.status(201).json(data)).catch(err => res.status(400).json({ error: err.message }))
})
router.put('/:id', (req, res) => {
  updatePipeline(Number(req.params.id), req.body).then(data => res.json(data)).catch(err => res.status(400).json({ error: err.message }))
})
router.delete('/:id', (req, res) => {
  deletePipeline(Number(req.params.id)).then(() => res.json({ success: true })).catch(err => res.status(400).json({ error: err.message }))
})
router.post('/:pipelineId/stages', (req, res) => {
  createStage(Number(req.params.pipelineId), req.body).then(data => res.status(201).json(data)).catch(err => res.status(400).json({ error: err.message }))
})
router.put('/stages/:id', (req, res) => {
  updateStage(Number(req.params.id), req.body).then(data => res.json(data)).catch(err => res.status(400).json({ error: err.message }))
})
router.delete('/stages/:id', (req, res) => {
  deleteStage(Number(req.params.id)).then(() => res.json({ success: true })).catch(err => res.status(400).json({ error: err.message }))
})
router.post('/:id/reorder', (req, res) => {
  reorderStages(Number(req.params.id), req.body.stageIds).then(() => res.json({ success: true })).catch(err => res.status(400).json({ error: err.message }))
})

export default router
