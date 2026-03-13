import { findUserByEmail, createUser, allUser } from '../repositories/user.repository.js'
import { createHash } from '../utils/hash.js'
import { logger } from '../utils/loggers.js'



export const createUsuarios = async (req, res) => {
    const { nombre, email, celular, password } = req.body
    try {
        const result = await findUserByEmail(email, celular)
        logger.info(result)
        if (result.length > 0) {

            logger.warn(`Usuaario ya existente con ${email} o ${celular}`)
            return res.status(400).json({
                message: "Ya existe un usuario con ese numero o email registrados"
            })
        }
        const hash = await createHash(password, 10)
        const user = await createUser(nombre, email, celular, hash)
        res.status(201).json({ user })

    } catch (err) {

        logger.error(error, "Error al crear el usuario")
        res.status(500).json({
            message: "Error al crear el usuario"
        })

    }

}

export const getUsuarios = async (req, res) => {
    try {

        const result = await allUser()
        logger.info(result)

        if (result.length === 0) {
            return res.status(200).json([])

        }
        return res.status(200).json(result)

    } catch (err) {
        return res.status(500).json({
            message: "Errorr"
        })
    }
}