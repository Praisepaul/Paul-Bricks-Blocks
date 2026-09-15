import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { FormSheet } from '../components/FormSheet'
import { createUser, listUsers } from '../lib/users'
import type { UserProfile, UserRole } from '../types/auth'

export function Users() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('partner')
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function loadUsers() {
    setError('')
    try { setUsers(await listUsers()) }
    catch (value) { setError(value instanceof Error ? value.message : 'Unable to load users.') }
  }

  useEffect(() => { void loadUsers() }, [])

  function resetForm() {
    setFullName('')
    setEmail('')
    setPassword('')
    setRole('partner')
    setError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    try {
      await createUser({ fullName: fullName.trim(), email: email.trim(), password, role })
      setMessage(`${role === 'owner' ? 'Owner' : 'Partner'} account created.`)
      resetForm()
      setOpen(false)
      await loadUsers()
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Unable to create user.')
    } finally {
      setBusy(false)
    }
  }

  return <section className="users-page">
    <div className="page-heading">
      <div>
        <p className="eyebrow">Owner</p>
        <h2>Users</h2>
        <p>Manage the people who can run the business.</p>
      </div>
      <Button variant="primary" type="button" onClick={() => { setMessage(''); setError(''); setOpen(true) }}>+ Add user</Button>
    </div>

    {error && !open && <p className="error-text" role="alert">{error}</p>}
    {message && <p className="success-text" role="status">{message}</p>}

    <section className="user-list">
      <h3>Team</h3>
      {users.length === 0 ? <div className="empty-inline"><p>No users yet.</p></div> : users.map((user) => <article className="user-row" key={user.id}>
        <div><strong>{user.fullName || user.email}</strong><span>{user.email}</span></div>
        <span className="status-badge">{user.role === 'owner' ? 'Owner' : 'Partner'}</span>
      </article>)}
    </section>

    <FormSheet open={open} title="Add user" onClose={() => { if (!busy) { resetForm(); setOpen(false) } }}>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>Full name<input value={fullName} onChange={(event) => setFullName(event.target.value)} required /></label>
        <label>Email<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>Role
          <select value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
            <option value="partner">Partner</option>
            <option value="owner">Owner</option>
          </select>
        </label>
        <label>Temporary password<input type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        {error && <p className="error-text" role="alert">{error}</p>}
        <Button variant="primary" type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create user'}</Button>
      </form>
    </FormSheet>
  </section>
}
