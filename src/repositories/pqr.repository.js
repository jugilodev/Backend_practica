import { pool } from '../config/db.js'

export const allPqr = async () => {
    const respuesta = await pool.query(`

            select
        p.radicado,
        p.fecha_reporte,
        p.fecha_evento,
        c2.nombre,
        c2.apellido,
        c2.celular,
        c2.correo,
        c2.direccion,
        c2.cedula,
        p.id_pqr,
        p.descripcion,
        e.tipo_estado,
        tp.tipo_peticion,
        c.tipo_canal
    from public.pqr p
    join public.estados e on e.id_estado = p.id_estado
    join public.tipo_peticion tp on tp.id_tipo_peticion = p.id_tipo_peticion
    join public.canal c on c.id_canal = p.id_canal
    join public.cliente c2 on c2.id_cliente = p.id_cliente
        
        `)

    return respuesta.rows
}

// Obtiene una PQR por ID con todos sus datos relacionados
export const getPqrById = async (id_pqr) => {
    const result = await pool.query(`
        SELECT
            p.id_pqr, p.radicado, p.fecha_reporte, p.fecha_evento, p.descripcion, p.acepta_terminos,
            e.id_estado, e.tipo_estado,
            tp.id_tipo_peticion, tp.tipo_peticion,
            c.id_canal, c.tipo_canal,
            cl.id_cliente, cl.nombre AS cliente_nombre, cl.apellido, cl.celular,
            cl.correo AS cliente_correo, cl.direccion, cl.cedula,
            m.nombre AS municipio
        FROM public.pqr p
        JOIN public.estados e ON e.id_estado = p.id_estado
        JOIN public.tipo_peticion tp ON tp.id_tipo_peticion = p.id_tipo_peticion
        JOIN public.canal c ON c.id_canal = p.id_canal
        JOIN public.cliente cl ON cl.id_cliente = p.id_cliente
        LEFT JOIN public.municipio m ON m.id_municipio = p.id_municipio
        WHERE p.id_pqr = $1
    `, [id_pqr])
    return result.rows[0]
}

// Obtiene todas las entradas de bitácora de una PQR
export const getBitacoraByPqr = async (id_pqr) => {
    const result = await pool.query(`
        SELECT
            b.id_bitacora, b.descripcion, b.estado_anterior, b.estado_nuevo,
            b.fecha_evento, b.created_at,
            te.nombre AS tipo_evento,
            u.nombre AS usuario_nombre, u.rol AS usuario_rol, u.area AS usuario_area
        FROM public.pqr_bitacora b
        JOIN public.tipo_evento te ON te.id_tipo_evento = b.id_tipo_evento
        JOIN public.usuarios u ON u.id_usuario = b.id_usuario
        WHERE b.id_pqr = $1
        ORDER BY b.created_at DESC
    `, [id_pqr])
    return result.rows
}

// Actualiza el estado de una PQR e inserta automáticamente una entrada en la bitácora
export const updateEstadoPqr = async (id_pqr, id_estado, id_usuario, id_tipo_evento, descripcion) => {
    // Obtener estado actual para registrar como estado_anterior
    const estadoActualRes = await pool.query(`
        SELECT e.tipo_estado FROM public.pqr p
        JOIN public.estados e ON e.id_estado = p.id_estado
        WHERE p.id_pqr = $1
    `, [id_pqr])
    const estadoAnterior = estadoActualRes.rows[0]?.tipo_estado || ""

    // Actualizar el estado de la PQR
    await pool.query(`UPDATE public.pqr SET id_estado = $1 WHERE id_pqr = $2`, [id_estado, id_pqr])

    // Obtener el nombre del nuevo estado
    const estadoNuevoRes = await pool.query(`SELECT tipo_estado FROM public.estados WHERE id_estado = $1`, [id_estado])
    const estadoNuevo = estadoNuevoRes.rows[0]?.tipo_estado || ""

    // Insertar entrada en bitácora registrando el cambio
    await pool.query(`
        INSERT INTO public.pqr_bitacora (id_pqr, id_usuario, id_tipo_evento, descripcion, estado_anterior, estado_nuevo, fecha_evento)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `, [id_pqr, id_usuario, id_tipo_evento,
        descripcion || `Estado actualizado de "${estadoAnterior}" a "${estadoNuevo}"`,
        estadoAnterior, estadoNuevo])

    return { estadoAnterior, estadoNuevo }
}

// Agrega una entrada de bitácora (gestión manual: correos, llamadas, etc.)
export const addBitacoraEntry = async (id_pqr, id_usuario, id_tipo_evento, descripcion) => {
    const result = await pool.query(`
        INSERT INTO public.pqr_bitacora (id_pqr, id_usuario, id_tipo_evento, descripcion, fecha_evento)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING *
    `, [id_pqr, id_usuario, id_tipo_evento, descripcion])
    return result.rows[0]
}