import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard({ session, nav }) {
  const [stats, setStats] = useState({ total: 0, ok: 0, ko: 0, pending: 0 })
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    setProfile(profileData)

    const { data: vehicles } = await supabase.from('vehicles').select('id, name')
    if (!vehicles) { setLoading(false); return }

    const total = vehicles.length
    let ok = 0, ko = 0, pending = 0

    const monday = getMondayOfWeek()
    for (const v of vehicles) {
      const { data: controls } = await supabase
        .from('controls')
        .select('id, has_ko')
        .eq('vehicle_id', v.id)
        .gte('created_at', monday)
        .limit(1)
      if (!controls || controls.length === 0) pending++
      else if (controls[0].has_ko) ko++
      else ok++
    }
    setStats({ total, ok, ko, pending })
    setLoading(false)
  }

  const getMondayOfWeek = () => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  }

  const firstName = profile?.full_name?.split(' ')[0] || session.user.email.split('@')[0]

  return (
    <div className="page">
      <div className="top-bar" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2, paddingTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'white', letterSpacing: '0.06em' }}>MyPTX</div>
            <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: 12 }}>Bonjour, {firstName}</div>
          </div>
          <button className="top-bar-icon" onClick={() => supabase.auth.signOut()} aria-label="Déconnexion">
            <i className="ti ti-logout" style={{ fontSize: 18 }} />
          </button>
        </div>
      </div>

      <div className="scroll-body">
        {stats.ko > 0 && (
          <div className="alert-banner fade-in" onClick={() => nav('vehicles')}>
            <i className="ti ti-alert-triangle" style={{ fontSize: 20, flexShrink: 0 }} />
            <span>{stats.ko} véhicule{stats.ko > 1 ? 's' : ''} avec anomalie{stats.ko > 1 ? 's' : ''} cette semaine</span>
            <i className="ti ti-chevron-right" style={{ marginLeft: 'auto', flexShrink: 0 }} />
          </div>
        )}
        {stats.pending > 0 && (
          <div style={{ background: 'var(--amber-bg)', border: '1px solid #FFD98A', borderRadius: 'var(--radius-md)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--amber)', fontWeight: 500 }} onClick={() => nav('vehicles')}>
            <i className="ti ti-clock" style={{ fontSize: 20, flexShrink: 0 }} />
            <span>{stats.pending} véhicule{stats.pending > 1 ? 's' : ''} non vérifié{stats.pending > 1 ? 's' : ''} cette semaine</span>
            <i className="ti ti-chevron-right" style={{ marginLeft: 'auto', flexShrink: 0 }} />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--orange)' }}>{loading ? '—' : stats.total}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>Véhicules</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 600, color: stats.ok === stats.total && stats.total > 0 ? 'var(--green)' : 'var(--orange)' }}>{loading ? '—' : stats.ok}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>RAS cette semaine</div>
          </div>
        </div>

        <p className="section-title" style={{ marginTop: 4 }}>Accès rapide</p>

        <button onClick={() => nav('vehicles')} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', width: '100%', border: 'none' }}>
          <div style={{ width: 48, height: 48, background: 'var(--orange-bg)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="ti ti-truck" style={{ fontSize: 24, color: 'var(--orange)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Véhicules</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>Checklist & historique</div>
          </div>
          <i className="ti ti-chevron-right" style={{ color: 'var(--gray-400)', fontSize: 20 }} />
        </button>
      </div>
    </div>
  )
}
