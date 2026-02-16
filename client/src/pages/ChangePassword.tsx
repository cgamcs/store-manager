import { Form } from "react-router-dom"

function ChangePassword() {
  return (
    <>
      <main className="h-screen w-screen bg-oscuro-primario grid grid-cols-2 items-center justify-center">
        <div className="h-full w-full flex items-center justify-center p-2 overflow-hidden rounded-lg">
          <div className="h-full w-full flex items-center justify-center overflow-hidden rounded-lg">
            <img src="./banner.jpg" alt="" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="h-full w-full flex flex-col items-center justify-center">
          <div className="w-84">
            <h1 className="text-3xl font-bold text-start w-full mb-6">Contraseña</h1>
            <Form>
              <div className="flex flex-col gap-1 mb-3">
                <label htmlFor="password" className="text-gray-300">Nueva contraseña <span className="text-gray-500">*</span></label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  minLength={8}
                  required
                  className="w-full bg-oscuro-secundario/50 border border-borde/70 shadow-lg py-2 px-4 rounded-lg focus-visible:outline-0"
                />
              </div>

              <div className="flex flex-col gap-1 mb-7">
                <label htmlFor="password" className="text-gray-300">Validar nueva contraseña <span className="text-gray-500">*</span></label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  minLength={8}
                  required
                  className="w-full bg-oscuro-secundario/50 border border-borde/70 shadow-lg py-2 px-4 rounded-lg focus-visible:outline-0"
                />
              </div>

              <input
                type="submit"
                value="Cambiar contraseña"
                className="mb-7 w-full rounded-lg bg-claro-primario px-4 py-2 cursor-pointer hover:bg-claro-primario/80"
              />
            </Form>

            <a href="#" className="text-gray-500">
              Iniciar Sesión
            </a>
          </div>
        </div>
      </main>
    </>
  )
}

export default ChangePassword