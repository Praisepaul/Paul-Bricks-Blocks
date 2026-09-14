import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { createPartner, listUsers } from '../lib/users'
import type { UserProfile } from '../types/auth'

export function Users() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function loadUsers() {
    setError('')
    try { setUsers(await listUsers()) }
    catch (value) { setError(value instanceof Error ? value.message : 'Unable to load users.') }
  }

  useEffect(() => { void loadUsers() }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    try {
      await createPartner({ fullName: fullName.trim(), email: email.trim(), password })
      setFullName('')
      setEmail('')
      setPassword('')
      setMessage('Partner account created.')
      await loadUsers()
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Unable to create partner.')
    } finally {
      setBusy(false)
    }
  }

  return <section className="users-page">
    <div className="page-heading">
      <p className="eyebrow">Owner</p>
      <h2>Users</h2>
      <p>Add people who can help run the business.</p>
    </div>

    <section className="form-card">
      <h3>Add Partner</h3>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>Full name<input value={fullName} onChange={(event) => setFullName(event.target.value)} required /></label>
        <label>Email<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>Temporary password<input type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        {error && <p className="error-text" role="alert">{error}</p>}
        {message && <p className="success-text" role="status">{message}</p>}
        <Button variant="primary" type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create Partner'}</Button>
      </form>
    </section>

    <section className="user-list">
      <h3>Team</h3>
      {users.map((user) => <article className="user-row" key={user.id}>
        <div><strong>{user.fullName || user.email}</strong><span>{user.email}</span></div>
        <span className="status-badge">{user.role === 'owner' ? 'Owner' : 'Partner'}</span>
      </article>)}
    </section>
  </section>
}
