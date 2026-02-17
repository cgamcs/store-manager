import { Eye, ShieldHalf } from "lucide-react"
import { Form } from "react-router-dom"

function Login() {
  return (
    <>
      <main className="h-screen w-screen bg-oscuro-primario grid grid-cols-2 items-center justify-center">
        <div className="h-full w-full flex items-center justify-center p-2 overflow-hidden rounded-lg">
          <div className="h-full w-full flex items-center justify-center overflow-hidden rounded-lg">
            <img src="./logo.png" alt="" className="w-full h-full object-cover" />
            {/* <img src="./banner.jpg" alt="" className="w-full h-full object-cover" /> */}
          </div>
        </div>

        <ShieldHalf className="top-5 right-5 absolute bg-[#0474c2] text-white p-2 h-10 w-10 rounded-lg shadow-lg" />

        <div className="h-full w-full flex flex-col items-center justify-center">
          <div className="w-84">
            <h1 className="text-3xl font-bold text-start w-full mb-6">Iniciar Sesión</h1>
            <Form>
              <div className="flex flex-col gap-1 mb-3">
                <label htmlFor="username" className="text-gray-300">Usuario <span className="text-gray-500">*</span></label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  className="w-full bg-oscuro-secundario/50 border border-borde/70 shadow-lg py-2 px-4 rounded-lg focus-visible:outline-0 invalid:outline-1 invalid:outline-red-500"
                />
              </div>

              <div className="flex flex-col gap-1 mb-7">
                <label htmlFor="password" className="text-gray-300">Contraseña <span className="text-gray-500">*</span></label>
                <div className="flex justify-between items-center w-full bg-oscuro-secundario/50 border border-borde/70 shadow-lg py-2 px-4 rounded-lg">
                  <input
                    type="password"
                    name="password"
                    id="password"
                    className="focus-visible:outline-0 invalid:outline-1 invalid:outline-red-500"
                  />
                  <Eye className="text-gray-400" />
                </div>
              </div>

              <input
                type="submit"
                value="Iniciar Sesión"
                className="mb-7 w-full rounded-lg bg-claro-primario px-4 py-2 cursor-pointer hover:bg-claro-primario/80"
              />
            </Form>

            <div className="flex justify-between items-center">
              <a href="#" className="text-xs text-gray-500">
                ¿Olvidaste tu contraseña?
              </a>

              <a href="#" className="text-xs text-gray-500 text-end">
                ¿Aún no tienes cuentas? Registrate
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default Login