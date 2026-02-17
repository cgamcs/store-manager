import { useState } from 'react'
import ViewSwitch from '@/components/ViewSwitch'
import POSView from '@/pages/POSView'
import HistorySaleView from './HistorySaleView'

export default function Sales() {
  const [currentView, setCurrentView] = useState<'pos' | 'history'>('pos')

  return (
    <>
      <header className="bg-oscuro-secundario pb-5 border-b-2 border-borde">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl text-letra-principal font-bold">Compras</h2>
          
          <ViewSwitch 
            onViewChange={setCurrentView}
            defaultView="pos"
          />
        </div>
      </header>

      {/* Vistas condicionales */}
      <div className="mt-10">
        {currentView === 'pos' ? <POSView /> : <HistorySaleView />}
      </div>
    </>
  )
}