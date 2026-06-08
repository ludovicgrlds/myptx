import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { VSAV_SECTIONS } from '../lib/vsav_checklist'

export default function ChecklistPage({ session, vehicle, params, nav }) {
  const sectionDef = VSAV_SECTIONS.find(s => s.id === params?.sectionId) || VSAV_SECTIONS[0]
  const [items, setItems] = useState(sectionDef.items.map(name => ({ name, status: null })))
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [existing, setExisting] = useState(null)
  const [locked, setLocked] = useState(false)

  const getWeekDate = () => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    return d.toISOString().split('T')[0]
  }

  useEffect(() => {
    const fetchExisting = async () => {
      const weekDate = getWeekDate()
      const { data } = await supabase
        .from('section_controls')
        .select('*, profiles(full_name)')
        .eq('vehicle_id', vehicle.id)
        .eq('section_id', sectionDef.id)
        .eq('week_date', weekDate)
        .single()
      if (data) {
        setExisting(data)
        setItems(data.items)
        setComment(data.comment || '')
        if (data.agent_id !== session.user.id) setLocked(true)
      }
      setLoading(false)
    }
    fetchExisting()
  }, [])

  const setItemStatus = (idx, status) => {
    if (locked) return
    setItems(prev => prev.map((item, i) => i !== idx ? item : { ...item, status }))
  }

  const allFilled = items.every(i => i.status !== null)
  const commentOk = comment.trim().length > 0
  const canSave = allFilled && commentOk && !locked
  const hasKo = items.some(i => i.status === 'ko')
  const progress = items.filter(i => i.status).length

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    const weekDate = getWeekDate()
    const payload = {
      vehicle_id: vehicle.id,
      agent_id: session.user.id,
      section_id: sectionDef.id,
      section_title: sectionDef.title,
      items,
      comment,
      has_ko: hasKo,
      week_date: weekDate,
      updated_at: new Date().toISOString()
    }
    if (existing) {
      await supabase.from('section_controls').update(payload).eq('id', existing.id)
    } else {
      await supabase.from('section_controls').insert([payload])
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => nav('vehicle-detail', vehicle), 1200)
  }

  if (loading) return (
    <div className="page" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--gray-400)' }}>Chargement...</div>
    </div>
  )

  if (saved) return (
    <div className="page" style={{ alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
      <div style={{ width: 72, height: 72, background: 'var(--green-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className="ti ti-check" style={{ fontSize: 36, color: 'var(--green)' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Section enregistrée</div>
        <div style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 6 }}>
          {hasKo ? 'Des anomalies ont été signalées' : 'Tout est en ordre'}
        </div>
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="top-bar">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="top-bar-title" style={{ fontSize: 14 }}>{sectionDef.title}</div>
          <div className="top-bar-sub">{vehicle.name} · {progress}/{items.length} points</div>
        </div>
        <button className="top-bar-icon" onClick={() => nav('vehicle-detail', vehicle)} aria-label="Retour">
          <i className="ti ti-x" style={{ fontSize: 18 }} />
        </button>
      </div>

      <div style={{ height: 4, background: 'var(--gray-200)', flexShrink: 0 }}>
        <div style={{ height: '100%', background: 'var(--orange)', width: `${(progress/items.length)*100}%`, transition: 'width 0.3s' }} />
      </div>

      {locked && (
        <div style={{ background: 'var(--amber-bg)', borderBottom: '1px solid var(--orange-border)', padding: '10px 16px', display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: 'var(--amber)', fontWeight: 500 }}>
          <i className="ti ti-lock" style={{ fontSize: 16 }} />
          Section validée par {existing?.profiles?.full_name || 'un autre agent'} — lecture seule
        </div>
      )}

      <div className="scroll-body" style={{ gap: 0, padding: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {items.map((item, idx) => (
            <div key={idx} style={{
              padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12,
              borderBottom: '1px solid var(--gray-100)',
              background: item.status === 'ko' ? '#FFF8F8' : item.status === 'ok' ? '#F8FFF9' : 'white'
            }}>
              <span style={{ flex: 1, fontSize: 14, lineHeight: 1.4, color: 'var(--gray-900)' }}>{item.name}</span>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={() => setItemStatus(idx, 'ok')} style={{
                  width: 52, height: 40, borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none',
                  background: item.status === 'ok' ? 'var(--green)' : 'var(--green-bg)',
                  color: item.status === 'ok' ? 'white' : 'var(--green)',
                  opacity: locked ? 0.6 : 1
                }}>OK</button>
                <button onClick={() => setItemStatus(idx, 'ko')} style={{
                  width: 52, height: 40, borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none',
                  background: item.status === 'ko' ? 'var(--red)' : 'var(--red-bg)',
                  color: item.status === 'ko' ? 'white' : 'var(--red)',
                  opacity: locked ? 0.6 : 1
                }}>KO</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '16px', borderTop: '2px solid var(--gray-100)', background: 'var(--gray-50)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: comment.trim() ? 'var(--green)' : 'var(--red)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {comment.trim() ? '✓ Remarque renseignée' : '⚠ Remarque obligatoire'}
          </div>
          <textarea
            placeholder="Saisir une remarque avant de valider..."
            value={comment}
            onChange={e => !locked && setComment(e.target.value)}
            readOnly={locked}
            rows={3}
            style={{
              width: '100%', background: locked ? 'var(--gray-100)' : 'white',
              border: `1.5px solid ${comment.trim() ? 'var(--green)' : 'var(--gray-200)'}`,
              borderRadius: 'var(--radius-md)', padding: '10px 14px',
              fontSize: 14, color: 'var(--gray-900)', resize: 'none', outline: 'none',
              fontFamily: 'var(--font-body)', lineHeight: 1.5
            }}
          />
        </div>

        {!locked && (
          <div style={{ padding: '0 16px 32px' }}>
            <button className="btn-primary" onClick={handleSave} disabled={!canSave || saving}
              style={{ opacity: canSave ? 1 : 0.4 }}>
              {saving ? 'Enregistrement...' : (
                <><i className="ti ti-device-floppy" style={{ marginRight: 8, fontSize: 18, verticalAlign: '-3px' }} />
                  {existing ? 'Mettre à jour' : 'Valider cette section'}</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
