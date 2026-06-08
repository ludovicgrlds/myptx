import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function VehicleList({ session, nav }) {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchVehicles() }, [])

  const getMondayOfWeek = () => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff); d.setHours(0,0,0,0)
    return d.toISOString()
  }

  const fetchVehicles = async () => {
    const { data: vlist } = await supabase.from('vehicles').select('*').order('name')
    if (!vlist) { setLoading(false); return }
    const monday = getMondayOfWeek()
    const enriched = await Promise.all(vlist.map(async v => {
      const { data: controls } = await supabase
        .from('controls')
        .select('id, has_ko, created_at, profiles(full_name)')
        .eq('vehicle_id', v.id)
        .gte('created_at', monday)
        .order('created_at', { ascending: false })
        .limit(1)
      const control = controls?.[0] || null
      return { ...v, weekControl: control }
    }))
    setVehicles(enriched)
    setLoading(false)
  }

  const getStatus = (v) => {
    if (!v.weekControl) return 'pending'
    return v.weekControl.has_ko ? 'ko' : 'ok'
  }

  const statusLabel = { ok: 'RAS', ko: 'Anomalie', pending: 'Non vérifié' }
  const statusIcon = { ok: 'ti-circle-check', ko: 'ti-alert-triangle', pending: 'ti-clock' }
  const iconBg = { ok: 'var(--green-bg)', ko: 'var(--red-bg)', pending: 'var(--amber-bg)' }
  const iconColor = { ok: 'var(--green)', ko: 'var(--red)', pending: 'var(--amber)' }

  return (
    <div className="page">
      <div className="top-bar">
        <div>
          <div className="top-bar-title">Véhicules</div>
          <div className="top-bar-sub">Centre de secours</div>
        </div>
        <button className="top-bar-icon" onClick={() => nav('dashboard')} aria-label="Retour">
          <i className="ti ti-arrow-left" style={{ fontSize: 18 }} />
        </button>
      </div>

      <div className="scroll-body">
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '40px 0', fontSize: 14 }}>Chargement...</div>
        ) : vehicles.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '40px 0', fontSize: 14 }}>Aucun véhicule enregistré</div>
        ) : vehicles.map(v => {
          const status = getStatus(v)
          return (
            <button key={v.id} className="card fade-in" onClick={() => nav('vehicle-detail', v)}
              style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left', border: '1px solid var(--gray-200)' }}>
              <div style={{ width: 48, height: 48, background: iconBg[status], borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={`ti ${statusIcon[status]}`} style={{ fontSize: 24, color: iconColor[status] }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{v.name}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{v.type}</div>
                <span className={`badge badge-${status}`} style={{ marginTop: 5 }}>
                  {statusLabel[status]}
                </span>
              </div>
              <i className="ti ti-chevron-right" style={{ color: 'var(--gray-400)', fontSize: 20, flexShrink: 0 }} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
