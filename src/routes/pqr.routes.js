import { Router } from 'express'
import { getPqr, getPqrDetail, updateEstado, addBitacora } from '../controller/pqr.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

// Todas las rutas requieren autenticación
router.get('/', authMiddleware, getPqr)
router.get('/:id', authMiddleware, getPqrDetail)
router.patch('/:id/estado', authMiddleware, updateEstado)
router.post('/:id/bitacora', authMiddleware, addBitacora)

export default router
