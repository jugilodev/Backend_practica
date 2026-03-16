import { Router } from 'express'
import { listEstados, listTipoEvento, listTipoPeticion, listCanales } from '../controller/catalogos.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

// Todos los catálogos requieren autenticación
router.get('/estados', authMiddleware, listEstados)
router.get('/tipo_evento', authMiddleware, listTipoEvento)
router.get('/tipo_peticion', authMiddleware, listTipoPeticion)
router.get('/canales', authMiddleware, listCanales)

export default router
