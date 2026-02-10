import express from "express"
import colors from "colors"
import swaggerUi from "swagger-ui-express"
import cors, { CorsOptions } from "cors"
import morgan from "morgan"
import swaggerSpec from "./config/swagger"
import router from "./router"
import db from "./config/db"

// Conexion a la base de datos
export async function connectDB() {
    try {
        await db.authenticate()
        db.sync() // Sincroniza los modelos con la base de datos
        console.log(colors.blue.bold('Base de datos conectada correctamente'))
    } catch (error) {
        console.log(colors.red.bold('Error al conectar la base de datos'))
        console.log(error)
    }
}

connectDB()

// Instancia de express
const server  = express()

// Permitir conexiones
// const corsOptions: CorsOptions = {
//     origin: function(origin, callback) {
//         if(origin === process.env.CLIENT_URL) {
//             callback(null, true)
//         } else {
//             callback(new Error('No permitido por CORS'))
//         }
//     }
// }

// server.use(cors(corsOptions))

server.use(morgan('dev'))

// Leer datos del formulario
server.use(express.json())

server.use('/products', router)

// Docs
server.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

export default server