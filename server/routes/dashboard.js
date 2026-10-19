import { Router } from 'express'
import { getDashboardData } from '../controllers/dashboard.js'

const router = Router()

router.get('/', (req, res) => {
  getDashboardData().then(data => res.json(data)).catch(err => res.status(500).json({ error: err.message }))
})

export default router
