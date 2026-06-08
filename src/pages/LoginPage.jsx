import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Identifiants incorrects')
    else onLogin(data.session)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(160deg, #FFCC44 0%, #F5A623 55%, #E8891A 100%)',
      fontFamily: 'var(--font-body)'
    }}>
      {/* Zone logo */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 32px 32px',
        gap: 0
      }}>
        <img
          src="/alioss.png"
          alt="ALIOSS"
          style={{
            width: 160,
            height: 160,
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.12))'
          }}
        />
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 13,
          color: 'rgba(255,255,255,0.82)',
          letterSpacing: '0.04em',
          textAlign: 'center',
          marginTop: 4,
          maxWidth: 240
        }}>
          L'innovation au service de ceux qui vous sauvent
        </div>
      </div>

      {/* Carte connexion */}
      <div style={{
        background: 'white',
        borderRadius: '32px 32px 0 0',
        padding: '32px 24px 48px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.10)'
      }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            fontWeight: 600,
            color: 'var(--gray-900)',
            marginBottom: 6
          }}>Connexion</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-400)', lineHeight: 1.5 }}>
            Accès réservé aux personnels habilités
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{
              fontSize: 12, fontWeight: 600, color: 'var(--gray-600)',
              display: 'block', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase'
            }}>Email</label>
            <input
              className="input-field"
              type="email"
              placeholder="prenom.nom@sdis40.fr"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
              style={{ fontSize: 16 }}
            />
          </div>

          <div>
            <label style={{
              fontSize: 12, fontWeight: 600, color: 'var(--gray-600)',
              display: 'block', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase'
            }}>Mot de passe</label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              style={{ fontSize: 16 }}
            />
          </div>

          {error && (
            <div style={{
              background: 'var(--red-bg)', color: 'var(--red)',
              fontSize: 13, padding: '12px 16px',
              borderRadius: 'var(--radius-md)', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <i className="ti ti-alert-circle" style={{ fontSize: 18, flexShrink: 0 }} />
              {error}
            </div>
          )}

          <button
            className="btn-primary"
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              background: 'linear-gradient(135deg, #F5A623, #FFCC44)',
              fontSize: 16,
              letterSpacing: '0.03em',
              height: 54,
              borderRadius: 16,
              boxShadow: '0 4px 20px rgba(245,166,35,0.35)'
            }}>
            {loading
              ? <><i className="ti ti-loader-2" style={{ marginRight: 8, fontSize: 18, verticalAlign: '-3px' }} />Connexion...</>
              : <><i className="ti ti-login" style={{ marginRight: 8, fontSize: 18, verticalAlign: '-3px' }} />Se connecter</>
            }
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--orange)', marginTop: 4, cursor: 'pointer' }}>
            Mot de passe oublié ?
          </p>
        </form>

        <div style={{
          marginTop: 32, paddingTop: 20,
          borderTop: '1px solid var(--gray-100)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: 11, color: 'var(--gray-400)', letterSpacing: '0.03em' }}>
            MyPTX · Propulsé par ALIOSS
          </p>
        </div>
      </div>
    </div>
  )
}
