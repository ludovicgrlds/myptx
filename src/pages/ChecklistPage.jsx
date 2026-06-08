import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DEFAULT_SECTIONS = [
  {
    id: 'exterieur',
    title: 'Extérieur véhicule',
    icon: 'ti-car',
    items: ['Carrosserie & vitrages', 'Éclairages & gyrophares', 'État des pneus', 'Portes & accès', 'Plaques & marquages']
  },
  {
    id: 'cabine',
    title: 'Cabine avant',
    icon: 'ti-steering-wheel',
    items: ['Tableau de bord', 'Niveaux fluides (huile, liquide de frein)', 'Carburant', 'Batterie & démarrage', 'Climatisation / chauffage']
  },
  {
    id: 'materiel',
    title: 'Matériel embarqué',
    icon: 'ti-briefcase-medical',
    items: ['Extincteurs', 'Tuyaux & raccords', 'Échelles', 'Matériel de désincarcération', 'Équipements de protection']
  }
]

export default function ChecklistPage({ session, vehicle, nav }) {
  const [sections, setSections] = useState(
    DEFAULT_SECTIONS.map(s => ({
      ...s,
      items: s.items.map(name => ({ name, status: null })),
      comment: ''
    }))
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const setItemStatus = (sIdx, iIdx, status) => {
    setSections(prev => prev.map((s, si) =>
      si !== sIdx ? s : {
        ...s,
        items: s.items.map((item, ii) => ii !== iIdx ? item : { ...item, status })
      }
    ))
  }

  const setComment = (sIdx, val) => {
    setSections(prev => prev.map((s, si) => si !== sIdx ? s : { ...s, comment: val }))
  }

  const allFilled = sections.every(s => s.items.every(i => i.status !== null))
  const hasKo = sections.some(s => s.items.some(i => i.status === 'ko'))

  const handleSave = async () => {
    if (!allFilled) return
    setSaving(true)
    const payload = {
      vehicle_id: vehicle.id,
      agent_id: session.user.id,
      has_ko: hasKo,
      data: sections.map(s => ({
        id: s.id,
        title: s.title,
        items: s.items,
        comment: s.comment
      }))
    }
    const { error } = await supabase.from('controls').insert([{
      vehicle_id: payload.vehicle_id,
      agent_id: payload.agent_id,
      has_ko: payload.has_ko,
      sections: payload.data
    }])
    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => nav('vehicle-detail', vehicle), 1500)
    }
  }

  const progress = sections.reduce((acc, s) => acc + s.items.filter(i => i.status).length, 0)
  const total = sections.reduce((acc, s) => acc + s.items.length, 0)

  if (saved) return (
    <div className="page" style={{ alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
      <div style={{ width: 72, height: 72, background: 'var(--green-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className="ti ti-check" style={{ fontSize: 36, color: 'var(--green)' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Vérification enregistrée</div>
        <div style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 6 }}>
          {hasKo ? 'Des anomalies ont été signalées' : 'Tout est en ordre'}
        </div>
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="top-bar">
        <div>
          <div className="top-bar-title">Vérification — {vehicle.name}</div>
          <div className="top-bar-sub">{progress}/{total} points vérifiés</div>
        </div>
        <button className="top-bar-icon" onClick={() => nav('vehicle-detail', vehicle)} aria-label="Retour">
          <i className="ti ti-x" style={{ fontSize: 18 }} />
        </button>
      </div>

      <div style={{ height: 4, background: 'var(--gray-200)', flexShrink: 0 }}>
        <div style={{ height: '100%', background: 'var(--orange)', width: `${(progress/total)*100}%`, transition: 'width 0.3s' }} />
      </div>

      <div className="scroll-body" style={{ gap: 16 }}>
        {sections.map((section, sIdx) => (
          <div key={section.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ background: 'var(--orange-bg)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--orange-border)' }}>
              <i className={`ti ${section.icon}`} style={{ fontSize: 18, color: 'var(--orange)' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--orange-dark)' }}>{section.title}</span>
            </div>
            {section.items.map((item, iIdx) => (
              <div key={iIdx} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--gray-100)' }}>
                <span style={{ flex: 1, fontSize: 14, color: 'var(--gray-900)' }}>{item.name}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => setItemStatus(sIdx, iIdx, 'ok')}
                    style={{
                      padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', minHeight: 36, minWidth: 52,
                      background: item.status === 'ok' ? 'var(--green)' : 'var(--green-bg)',
                      color: item.status === 'ok' ? 'white' : 'var(--green)'
                    }}>OK</button>
                  <button
                    onClick={() => setItemStatus(sIdx, iIdx, 'ko')}
                    style={{
                      padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', minHeight: 36, minWidth: 52,
                      background: item.status === 'ko' ? 'var(--red)' : 'var(--red-bg)',
                      color: item.status === 'ko' ? 'white' : 'var(--red)'
                    }}>KO</button>
                </div>
              </div>
            ))}
            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--gray-100)' }}>
              <textarea
                placeholder="Commentaire sur cette section (optionnel)..."
                value={section.comment}
                onChange={e => setComment(sIdx, e.target.value)}
                rows={2}
                style={{ width: '100%', background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: 13, color: 'var(--gray-900)', resize: 'none', outline: 'none', fontFamily: 'var(--font-body)' }}
              />
            </div>
          </div>
        ))}

        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={!allFilled || saving}
          style={{ opacity: allFilled ? 1 : 0.5, marginTop: 4, marginBottom: 16 }}>
          {saving ? 'Enregistrement...' : (
            <><i className="ti ti-device-floppy" style={{ marginRight: 8, fontSize: 18, verticalAlign: '-3px' }} />Enregistrer la vérification</>
          )}
        </button>
      </div>
    </div>
  )
}
