import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import VehicleList from './pages/VehicleList'
import VehicleDetail from './pages/VehicleDetail'
import ChecklistPage from './pages/ChecklistPage'
import HistoryPage from './pages/HistoryPage'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('dashboard')
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [selectedControl, setSelectedControl] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--orange)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'white', letterSpacing: '0.1em' }}>MyPTX</div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 8 }}>Chargement...</div>
      </div>
    </div>
  )

  if (!session) return <LoginPage onLogin={setSession} />

  const nav = (p, vehicle = null, control = null) => {
    setPage(p)
    if (vehicle !== null) setSelectedVehicle(vehicle)
    if (control !== null) setSelectedControl(control)
  }

  if (page === 'dashboard') return <Dashboard session={session} nav={nav} />
  if (page === 'vehicles') return <VehicleList session={session} nav={nav} />
  if (page === 'vehicle-detail') return <VehicleDetail session={session} vehicle={selectedVehicle} nav={nav} />
  if (page === 'checklist') return <ChecklistPage session={session} vehicle={selectedVehicle} nav={nav} />
  if (page === 'history') return <HistoryPage session={session} vehicle={selectedVehicle} control={selectedControl} nav={nav} />

  return <Dashboard session={session} nav={nav} />
}
