import { Form } from "react-router-dom"

function SignUp() {
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
            <h1 className="text-3xl font-bold text-start w-full mb-6">Registrarse</h1>
            <Form>
              <div className="flex flex-col gap-1 mb-3">
                <label htmlFor="username" className="text-gray-300">Usuario <span className="text-gray-500">*</span></label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  className="w-full bg-oscuro-secundario/50 border border-borde/70 shadow-lg py-2 px-4 rounded-lg focus-visible:outline-0 invalid:outline-1 "
                />
              </div>

              <div className="flex flex-col gap-1 mb-3">
                <label htmlFor="email" className="text-gray-300">Correo <span className="text-gray-500">*</span></label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="w-full bg-oscuro-secundario/50 border border-borde/70 shadow-lg py-2 px-4 rounded-lg focus-visible:outline-0 invalid:outline-1 "
                />
              </div>

              <div className="flex flex-col gap-1 mb-7">
                <label htmlFor="password" className="text-gray-300">Contraseña <span className="text-gray-500">*</span></label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="w-full bg-oscuro-secundario/50 border border-borde/70 shadow-lg py-2 px-4 rounded-lg focus-visible:outline-0 invalid:outline-1 "
                />
              </div>

              <div className="flex flex-col gap-1 mb-7">
                <label htmlFor="password" className="text-gray-300">Repetir contraseña <span className="text-gray-500">*</span></label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="w-full bg-oscuro-secundario/50 border border-borde/70 shadow-lg py-2 px-4 rounded-lg focus-visible:outline-0 invalid:outline-1 "
                />
              </div>

              <input
                type="submit"
                value="Crear Cuenta"
                className="mb-7 w-full rounded-lg bg-claro-primario px-4 py-2 cursor-pointer hover:bg-claro-primario/80"
              />
            </Form>

            <a href="#" className="text-gray-500">
              ¿Ya tienes cuenta? Inicia sesión
            </a>
          </div>
        </div>
      </main>
    </>
  )
}

export default SignUp