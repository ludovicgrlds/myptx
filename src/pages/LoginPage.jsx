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
    <div className="page" style={{ background: 'var(--orange)', justifyContent: 'space-between' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px 24px' }}>
        <div style={{ marginBottom: 8, width: 64, height: 64, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="ti ti-firetruck" style={{ fontSize: 32, color: 'white' }} />
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'white', letterSpacing: '0.12em', marginBottom: 6 }}>MyPTX</div>
        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, textAlign: 'center', maxWidth: 220 }}>
          L'innovation au service de ceux qui vous sauvent
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '28px 28px 0 0', padding: '28px 24px 40px' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>Connexion</h2>
        <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 24 }}>Accès réservé aux personnels habilités</p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--gray-600)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Email</label>
            <input
              className="input-field"
              type="email"
              placeholder="prenom.nom@sdis30.fr"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--gray-600)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Mot de passe</label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {error && (
            <div style={{ background: 'var(--red-bg)', color: 'var(--red)', fontSize: 13, padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontWeight: 500 }}>
              <i className="ti ti-alert-circle" style={{ marginRight: 6 }} />{error}
            </div>
          )}
          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
