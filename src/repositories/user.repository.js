import { pool } from "../config/db.js";
import dotenv from 'dotenv'
import { logger } from "../utils/loggers.js";

export const findUserByEmail = async (email, celular) => {
    const result = await pool.query(`

            SELECT * FROM public.usuarios
            WHERE celular = $1 OR email = $2
            `, [celular, email])

    return result.rows
}

export const createUser = async (nombre, email, celular, hash) => {

    const result = await pool.query(`
        INSERT INTO public.usuarios(nombre, email, celular, password)
                VALUES ($1,$2,$3, $4)
                RETURNING *
        `, [nombre, email, celular, hash])

    return result.rows[0]
}

export const allUser = async () => {

    const result = await pool.query(`
        SELECT * FROM public.usuarios
        `)

    return result.rows[0]
}

export const emailUser = async (email) => {

    logger.info(`Buscando usuario con email: ${email}`)

    const result = await pool.query(`
        SELECT * FROM public.usuarios
        WHERE email = $1
        `, [email])
    logger.info(result.rows)
    return result.rows
}