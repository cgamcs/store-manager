import { useEffect, useState, type PropsWithChildren } from 'react'
import { TriangleAlert } from 'lucide-react'

function ErrorMessage({children} : PropsWithChildren) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  if(!visible) return null

  return (
    <div className="notificacion bg-azul-oscuro p-4 rounded-lg shadow-sm absolute top-5 right-5">
      <div className="flex gap-2">
        <TriangleAlert className="text-red-500"/>
        {children}
      </div>
    </div>
  )
}

export default ErrorMessage