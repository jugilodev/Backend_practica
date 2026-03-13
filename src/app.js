import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import usuariosRoutes from './routes/usuarios.routes.js'
import loginRoutes from './routes/auth.routes.js'
import cookieParser from 'cookie-parser'

dotenv.config()

const app = express()
app.use(express.json())
app.use(cookieParser())


connectDB()

app.use("/api/usuarios", usuariosRoutes)
app.use("/", loginRoutes)

app.listen(process.env.PORT_SERVER, () => {
    console.log("Escuchando en el servidor", process.env.PORT_SERVER)
})
