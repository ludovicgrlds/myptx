import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function HistoryPage({ session, vehicle, control, nav }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (control?.sections) {
      setData(control)
      setLoading(false)
    } else if (control?.id) {
      supabase.from('controls').select('*, profiles(full_name)').eq('id', control.id).single()
        .then(({ data: d }) => { setData(d); setLoading(false) })
    }
  }, [])

  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div className="page">
      <div className="top-bar">
        <div>
          <div className="top-bar-title">{vehicle.name} — Contrôle</div>
          <div className="top-bar-sub">{data ? formatDate(data.created_at) : '...'}</div>
        </div>
        <button className="top-bar-icon" onClick={() => nav('vehicle-detail', vehicle)} aria-label="Retour">
          <i className="ti ti-arrow-left" style={{ fontSize: 18 }} />
        </button>
      </div>

      <div className="scroll-body">
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '40px 0', fontSize: 14 }}>Chargement...</div>
        ) : !data ? (
          <div style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '40px 0', fontSize: 14 }}>Données introuvables</div>
        ) : (
          <>
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 4 }}>Agent</div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{data.profiles?.full_name || 'Inconnu'}</div>
              </div>
              <span className={`badge badge-${data.has_ko ? 'ko' : 'ok'}`} style={{ fontSize: 13 }}>
                {data.has_ko ? 'Anomalies' : 'RAS'}
              </span>
            </div>

            {(data.sections || []).map((section, idx) => {
              const sectionKo = section.items?.some(i => i.status === 'ko')
              return (
                <div key={idx} className="card fade-in" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ background: sectionKo ? 'var(--red-bg)' : 'var(--orange-bg)', padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${sectionKo ? '#F5C6C2' : 'var(--orange-border)'}` }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: sectionKo ? 'var(--red)' : 'var(--orange-dark)' }}>{section.title}</span>
                    {sectionKo && <i className="ti ti-alert-triangle" style={{ fontSize: 15, color: 'var(--red)', marginLeft: 'auto' }} />}
                  </div>
                  {(section.items || []).map((item, iIdx) => (
                    <div key={iIdx} style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--gray-100)' }}>
                      <span style={{ flex: 1, fontSize: 13 }}>{item.name}</span>
                      <span className={`badge badge-${item.status === 'ok' ? 'ok' : item.status === 'ko' ? 'ko' : 'pending'}`}>
                        {item.status === 'ok' ? 'OK' : item.status === 'ko' ? 'KO' : '—'}
                      </span>
                    </div>
                  ))}
                  {section.comment && (
                    <div style={{ padding: '10px 16px', background: 'var(--gray-50)', borderTop: '1px solid var(--gray-100)', fontSize: 13, color: 'var(--gray-600)', fontStyle: 'italic' }}>
                      <i className="ti ti-message" style={{ marginRight: 6, fontSize: 14 }} />
                      {section.comment}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
