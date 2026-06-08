import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { VSAV_SECTIONS } from '../lib/vsav_checklist'

const buildSections = () => VSAV_SECTIONS.map(s => ({
  ...s,
  items: s.items.map(name => ({ name, status: null })),
  comment: ''
}))

export default function ChecklistPage({ session, vehicle, nav }) {
  const [sections, setSections] = useState(buildSections)
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

  const allItemsFilled = sections.every(s => s.items.every(i => i.status !== null))
  const allCommentsFilled = sections.every(s => s.comment.trim().length > 0)
  const canSave = allItemsFilled && allCommentsFilled
  const hasKo = sections.some(s => s.items.some(i => i.status === 'ko'))

  const progress = sections.reduce((acc, s) => acc + s.items.filter(i => i.status).length, 0)
  const total = sections.reduce((acc, s) => acc + s.items.length, 0)

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    const { error } = await supabase.from('controls').insert([{
      vehicle_id: vehicle.id,
      agent_id: session.user.id,
      has_ko: hasKo,
      sections: sections.map(s => ({
        id: s.id, title: s.title,
        items: s.items,
        comment: s.comment
      }))
    }])
    setSaving(false)
    if (!error) { setSaved(true); setTimeout(() => nav('vehicle-detail', vehicle), 1500) }
  }

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
          <div className="top-bar-sub">{progress}/{total} points · {sections.filter(s => s.comment.trim()).length}/{sections.length} remarques</div>
        </div>
        <button className="top-bar-icon" onClick={() => nav('vehicle-detail', vehicle)} aria-label="Fermer">
          <i className="ti ti-x" style={{ fontSize: 18 }} />
        </button>
      </div>

      <div style={{ height: 4, background: 'var(--gray-200)', flexShrink: 0 }}>
        <div style={{ height: '100%', background: 'var(--orange)', width: `${(progress/total)*100}%`, transition: 'width 0.3s' }} />
      </div>

      <div className="scroll-body" style={{ gap: 16 }}>
        {sections.map((section, sIdx) => {
          const sectionComplete = section.items.every(i => i.status !== null)
          const commentMissing = sectionComplete && !section.comment.trim()
          return (
            <div key={section.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                background: commentMissing ? 'var(--red-bg)' : sectionComplete ? 'var(--green-bg)' : 'var(--orange-bg)',
                padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
                borderBottom: `1px solid ${commentMissing ? '#F5C6C2' : sectionComplete ? '#C0DD97' : 'var(--orange-border)'}`
              }}>
                <i className={`ti ${section.icon}`} style={{ fontSize: 18, color: commentMissing ? 'var(--red)' : sectionComplete ? 'var(--green)' : 'var(--orange)' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: commentMissing ? 'var(--red)' : sectionComplete ? 'var(--green)' : 'var(--orange-dark)', flex: 1 }}>
                  {section.title}
                </span>
                {sectionComplete && !section.comment.trim() && (
                  <span style={{ fontSize: 11, color: 'var(--red)', fontWeight: 600 }}>Remarque requise</span>
                )}
                {sectionComplete && section.comment.trim() && (
                  <i className="ti ti-circle-check" style={{ fontSize: 18, color: 'var(--green)' }} />
                )}
              </div>

              {section.items.map((item, iIdx) => (
                <div key={iIdx} style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--gray-100)' }}>
                  <span style={{ flex: 1, fontSize: 13, lineHeight: 1.4 }}>{item.name}</span>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => setItemStatus(sIdx, iIdx, 'ok')} style={{
                      padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none',
                      minHeight: 38, minWidth: 52,
                      background: item.status === 'ok' ? 'var(--green)' : 'var(--green-bg)',
                      color: item.status === 'ok' ? 'white' : 'var(--green)'
                    }}>OK</button>
                    <button onClick={() => setItemStatus(sIdx, iIdx, 'ko')} style={{
                      padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none',
                      minHeight: 38, minWidth: 52,
                      background: item.status === 'ko' ? 'var(--red)' : 'var(--red-bg)',
                      color: item.status === 'ko' ? 'white' : 'var(--red)'
                    }}>KO</button>
                  </div>
                </div>
              ))}

              <div style={{ padding: '10px 16px', background: 'var(--gray-50)', borderTop: '1px solid var(--gray-100)' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: section.comment.trim() ? 'var(--green)' : 'var(--red)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {section.comment.trim() ? '✓ Remarque renseignée' : 'Remarque obligatoire'}
                </div>
                <textarea
                  placeholder="Saisir une remarque avant de continuer..."
                  value={section.comment}
                  onChange={e => setComment(sIdx, e.target.value)}
                  rows={2}
                  style={{
                    width: '100%', background: 'white',
                    border: `1.5px solid ${section.comment.trim() ? 'var(--green)' : commentMissing ? 'var(--red)' : 'var(--gray-200)'}`,
                    borderRadius: 'var(--radius-sm)', padding: '8px 12px',
                    fontSize: 13, color: 'var(--gray-900)', resize: 'none', outline: 'none',
                    fontFamily: 'var(--font-body)', lineHeight: 1.5
                  }}
                />
              </div>
            </div>
          )
        })}

        {!canSave && (
          <div style={{ background: 'var(--amber-bg)', border: '1px solid var(--orange-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', fontSize: 13, color: 'var(--amber)', textAlign: 'center' }}>
            {!allItemsFilled
              ? `${total - progress} point(s) non cochés`
              : `${sections.filter(s => !s.comment.trim()).length} remarque(s) manquante(s)`}
          </div>
        )}

        <button className="btn-primary" onClick={handleSave} disabled={!canSave || saving}
          style={{ opacity: canSave ? 1 : 0.4, marginTop: 4, marginBottom: 20 }}>
          {saving ? 'Enregistrement...' : (
            <><i className="ti ti-device-floppy" style={{ marginRight: 8, fontSize: 18, verticalAlign: '-3px' }} />Enregistrer la vérification</>
          )}
        </button>
      </div>
    </div>
  )
}
