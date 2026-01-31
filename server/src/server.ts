import express from "express"
import colors from "colors"
import router from "./router"
import db from "./config/db"

// Conexion a la base de datos
async function connectDB() {
    try {
        await db.authenticate()
        db.sync() // Sincroniza los modelos con la base de datos
        // console.log(colors.blue.bold('Base de datos conectada correctamente'))
    } catch (error) {
        console.log(colors.red.bold('Error al conectar la base de datos'))
        console.log(error)
    }
}

connectDB()

// Instancia de express
const server  = express()

// Leer datos del formulario
server.use(express.json())

server.use('/products', router)

server.get('/', (req, res) => {
    res.json({message: "Desde server.ts"})
})

export default server