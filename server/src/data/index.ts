import { exit } from "node:process"
import colors from "colors"
import db from "../config/db"

const cleardb = async () => {
  try {
    await db.sync({force: true})
    console.log(colors.green("Datos eliminados correctamente"))
    exit(0)
  } catch (error) {
    console.log(colors.red("Error al limpiar la Base de Datos"))
    console.error(error)
    exit(1)
  }
}

if(process.argv[2] === '--clear') {
  cleardb()
}