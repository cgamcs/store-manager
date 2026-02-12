import { useState } from 'react'

interface ViewSwitchProps {
  onViewChange?: (view: 'pos' | 'history') => void
  defaultView?: 'pos' | 'history'
}

export default function ViewSwitch({ onViewChange, defaultView = 'pos' }: ViewSwitchProps) {
  const [activeView, setActiveView] = useState<'pos' | 'history'>(defaultView)

  const handleSwitch = (view: 'pos' | 'history') => {
    setActiveView(view)
    onViewChange?.(view)
  }

  return (
    <div className="inline-flex items-center bg-oscuro-primario rounded-lg p-1">
      <button
        type="button"
        onClick={() => handleSwitch('pos')}
        className={`
          px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200
          ${activeView === 'pos'
            ? 'bg-claro-primario text-gray-300 shadow-sm'
            : 'text-gray-600 hover:text-gray-600'
          }
        `}
      >
        Punto de Venta
      </button>
      <button
        type="button"
        onClick={() => handleSwitch('history')}
        className={`
          px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200
          ${activeView === 'history'
            ? 'bg-claro-primario text-gray-300 shadow-sm'
            : 'text-gray-600 hover:text-gray-600'
          }
        `}
      >
        Historial
      </button>
    </div>
  )
}