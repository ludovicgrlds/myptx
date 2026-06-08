import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function VehicleDetail({ session, vehicle, nav }) {
  const [weekControl, setWeekControl] = useState(null)
  const [recentControls, setRecentControls] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const getMondayOfWeek = () => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff); d.setHours(0,0,0,0)
    return d.toISOString()
  }

  const fetchData = async () => {
    const monday = getMondayOfWeek()
    const { data: wc } = await supabase
      .from('controls')
      .select('*, profiles(full_name)')
      .eq('vehicle_id', vehicle.id)
      .gte('created_at', monday)
      .order('created_at', { ascending: false })
      .limit(1)
    setWeekControl(wc?.[0] || null)

    const { data: rc } = await supabase
      .from('controls')
      .select('*, profiles(full_name)')
      .eq('vehicle_id', vehicle.id)
      .order('created_at', { ascending: false })
      .limit(8)
    setRecentControls(rc || [])
    setLoading(false)
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit', year: '2-digit' })

  return (
    <div className="page">
      <div className="top-bar">
        <div>
          <div className="top-bar-title">{vehicle.name}</div>
          <div className="top-bar-sub">{vehicle.type}</div>
        </div>
        <button className="top-bar-icon" onClick={() => nav('vehicles')} aria-label="Retour">
          <i className="ti ti-arrow-left" style={{ fontSize: 18 }} />
        </button>
      </div>

      <div className="scroll-body">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 4 }}>Vérification cette semaine</div>
            {loading ? <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>Chargement...</div>
              : weekControl ? (
                <div>
                  <span className={`badge badge-${weekControl.has_ko ? 'ko' : 'ok'}`}>
                    {weekControl.has_ko ? 'Anomalie(s)' : 'RAS'}
                  </span>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 6 }}>
                    {formatDate(weekControl.created_at)} · {weekControl.profiles?.full_name || 'Inconnu'}
                  </div>
                </div>
              ) : (
                <span className="badge badge-pending">Non vérifié</span>
              )
            }
          </div>
          {weekControl && (
            <button onClick={() => nav('history', vehicle, weekControl)}
              style={{ background: 'var(--orange-bg)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '8px 12px', color: 'var(--orange)', fontSize: 13, fontWeight: 500 }}>
              Voir
            </button>
          )}
        </div>

        <button className="btn-primary" onClick={() => nav('checklist', vehicle)} style={{ marginTop: 4 }}>
          <i className="ti ti-clipboard-check" style={{ marginRight: 8, fontSize: 18, verticalAlign: '-3px' }} />
          {weekControl ? 'Nouvelle vérification' : 'Démarrer la vérification'}
        </button>

        <p className="section-title" style={{ marginTop: 8 }}>Historique</p>

        {recentControls.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '20px 0', fontSize: 14 }}>Aucune vérification enregistrée</div>
        ) : recentControls.map(c => (
          <button key={c.id} className="card fade-in" onClick={() => nav('history', vehicle, c)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', border: '1px solid var(--gray-200)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{formatDate(c.created_at)}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{c.profiles?.full_name || 'Inconnu'}</div>
            </div>
            <span className={`badge badge-${c.has_ko ? 'ko' : 'ok'}`}>{c.has_ko ? 'Anomalie' : 'RAS'}</span>
            <i className="ti ti-chevron-right" style={{ color: 'var(--gray-400)', fontSize: 18 }} />
          </button>
        ))}
      </div>
    </div>
  )
}
