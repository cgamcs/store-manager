import { connectDB } from "../server"
import db from "../config/db"

jest.mock('../config/db') // simula la conexion a la BD

describe("connectDB", () => {
  it("should handle database connection error", async () => {
    jest.spyOn(db, 'authenticate') // espera a que se ejecute db.authenticate
      .mockRejectedValueOnce(new Error('Error al conectar la base de datos')) // negar la promesa de conexio
    const consoleSpy = jest.spyOn(console, 'log') // espia el console log

    await connectDB()

    expect(consoleSpy).toHaveBeenLastCalledWith( // obtiene el contenido del espia del console log
      expect.stringContaining("Error al conectar la base de datos")
    )
  })
})