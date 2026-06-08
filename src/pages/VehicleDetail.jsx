import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { VSAV_SECTIONS } from '../lib/vsav_checklist'

export default function VehicleDetail({ session, vehicle, nav }) {
  const [sectionControls, setSectionControls] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const getWeekDate = () => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    return d.toISOString().split('T')[0]
  }

  const fetchData = async () => {
    const weekDate = getWeekDate()
    const { data } = await supabase
      .from('section_controls')
      .select('*, profiles(full_name)')
      .eq('vehicle_id', vehicle.id)
      .eq('week_date', weekDate)
    setSectionControls(data || [])
    setLoading(false)
  }

  const weekDate = getWeekDate()
  const totalSections = VSAV_SECTIONS.length
  const doneSections = sectionControls.length
  const koSections = sectionControls.filter(s => s.has_ko).length
  const progressPct = Math.round((doneSections / totalSections) * 100)

  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })

  return (
    <div className="page">
      <div className="top-bar">
        <div>
          <div className="top-bar-title">{vehicle.name}</div>
          <div className="top-bar-sub">{vehicle.immatriculation} · {vehicle.type}</div>
        </div>
        <button className="top-bar-icon" onClick={() => nav('vehicles')} aria-label="Retour">
          <i className="ti ti-arrow-left" style={{ fontSize: 18 }} />
        </button>
      </div>

      <div className="scroll-body">
        {/* Progression semaine */}
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Vérification hebdomadaire</div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
                {doneSections}/{totalSections} sections · {koSections > 0 ? `${koSections} anomalie(s)` : 'RAS'}
              </div>
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: doneSections === totalSections ? 'var(--green)' : 'var(--orange)' }}>
              {progressPct}%
            </span>
          </div>
          <div style={{ height: 6, background: 'var(--gray-100)', borderRadius: 99 }}>
            <div style={{
              height: '100%', borderRadius: 99, transition: 'width 0.4s',
              background: koSections > 0 ? 'var(--red)' : doneSections === totalSections ? 'var(--green)' : 'var(--orange)',
              width: `${progressPct}%`
            }} />
          </div>
        </div>

        <p className="section-title">Sections de vérification</p>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '20px 0' }}>Chargement...</div>
        ) : VSAV_SECTIONS.map((section) => {
          const done = sectionControls.find(sc => sc.section_id === section.id)
          const isMe = done?.agent_id === session.user.id
          return (
            <button key={section.id} className="card fade-in"
              onClick={() => nav('checklist', vehicle, { sectionId: section.id })}
              style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', border: '1px solid var(--gray-200)', padding: '14px 16px' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-md)', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                background: done ? (done.has_ko ? 'var(--red-bg)' : 'var(--green-bg)') : 'var(--orange-bg)',
                color: done ? (done.has_ko ? 'var(--red)' : 'var(--green)') : 'var(--orange)'
              }}>
                <i className={`ti ${section.icon}`} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{section.title}</div>
                {done ? (
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                    {done.profiles?.full_name || 'Inconnu'} · {section.items.length} pts
                    {done.has_ko && <span style={{ color: 'var(--red)', marginLeft: 6, fontWeight: 600 }}>⚠ Anomalie</span>}
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{section.items.length} points à vérifier</div>
                )}
              </div>
              {done ? (
                isMe ? (
                  <span style={{ fontSize: 11, color: 'var(--orange)', fontWeight: 600, flexShrink: 0 }}>Modifier</span>
                ) : (
                  <i className="ti ti-lock" style={{ color: 'var(--gray-400)', fontSize: 16, flexShrink: 0 }} />
                )
              ) : (
                <i className="ti ti-chevron-right" style={{ color: 'var(--gray-400)', fontSize: 18, flexShrink: 0 }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
