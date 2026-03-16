import { allPqr, getPqrById, getBitacoraByPqr, updateEstadoPqr, addBitacoraEntry } from "../repositories/pqr.repository.js"

// GET /api/pqr — Obtiene todas las PQRs con datos del cliente
export const getPqr = async (req, res) => {
    try {
        const resultado = await allPqr()
        return res.status(200).json(resultado)
    } catch (err) {
        return res.status(500).json({ message: err.message || "Error al obtener PQRs" })
    }
}

// GET /api/pqr/:id — Obtiene una PQR específica con su bitácora
export const getPqrDetail = async (req, res) => {
    try {
        const { id } = req.params
        const pqr = await getPqrById(id)
        if (!pqr) {
            return res.status(404).json({ message: "PQR no encontrada" })
        }
        const bitacora = await getBitacoraByPqr(id)
        return res.status(200).json({ ...pqr, bitacora })
    } catch (err) {
        return res.status(500).json({ message: err.message || "Error al obtener la PQR" })
    }
}

// PATCH /api/pqr/:id/estado — Actualiza el estado de una PQR
export const updateEstado = async (req, res) => {
    try {
        const { id } = req.params
        const { id_estado, id_tipo_evento, descripcion } = req.body
        const id_usuario = req.user.id_usuario || req.user.id

        if (!id_estado || !id_tipo_evento) {
            return res.status(400).json({ message: "id_estado e id_tipo_evento son requeridos" })
        }

        const resultado = await updateEstadoPqr(id, id_estado, id_usuario, id_tipo_evento, descripcion)
        return res.status(200).json({ message: "Estado actualizado", ...resultado })
    } catch (err) {
        return res.status(500).json({ message: err.message || "Error al actualizar estado" })
    }
}

// POST /api/pqr/:id/bitacora — Agrega una entrada de gestión a la bitácora
export const addBitacora = async (req, res) => {
    try {
        const { id } = req.params
        const { id_tipo_evento, descripcion } = req.body
        const id_usuario = req.user.id_usuario || req.user.id

        if (!id_tipo_evento || !descripcion?.trim()) {
            return res.status(400).json({ message: "id_tipo_evento y descripcion son requeridos" })
        }

        const entrada = await addBitacoraEntry(id, id_usuario, id_tipo_evento, descripcion)
        return res.status(201).json(entrada)
    } catch (err) {
        return res.status(500).json({ message: err.message || "Error al agregar entrada a bitácora" })
    }
}
