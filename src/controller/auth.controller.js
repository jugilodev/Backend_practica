import dotenv from "dotenv"
import jwt from 'jsonwebtoken'
import { compareHash } from '../utils/hash.js'
import { emailUser } from '../repositories/user.repository.js'
import { logger } from '../utils/loggers.js'

dotenv.config()

export const login = async (req, res) => {

    const { email, password } = req.body

    try {

        const result = await emailUser(email)

        if (result.length === 0) {
            logger.info(`No se encontro un usuario con el email: ${email}`)

            return res.status(400).json({
                message: "Credenciales invalidas"
            })

        } else {
            const user = result[0]
            const passwordValida = await compareHash(password, user.password)
            if (!passwordValida) {
                return res.status(401).json({
                    message: "Contrasena incorrecta"
                })
            }

            const token = jwt.sign(
                {
                    id_usuario: user.id,
                    rol: user.rol
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES }
            )

            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 1000 * 60 * 60
            })

            res.status(200).json({
                message: "Login exitoso",
                usuario: {
                    id: user.id
                }
            })
        }

    } catch (err) {

        res.status(500).json({
            message: err.message || "Error al iniciar sesion"
        })

    }

}

export const logout = (req, res) => {

    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    return res.status(200).json({
        message: "Logout exitoso"
    })
}