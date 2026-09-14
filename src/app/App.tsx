import { useState, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { signIn, signOut } from '../lib/auth/auth'
import { useAuth } from '../lib/auth/AuthProvider'
import { Customers } from './Customers'
import { Products } from './Products'
import { Sales } from './Sales'
import { Users } from './Users'
import { Settings } from './Settings'

type Section = 'dashboard' | 'customers' | 'products' | 'sales' | 'purchases' | 'labour' | 'bills' | 'history' | 'users' | 'settings'
const sections: Array<{ id: Section; label: string }> = [
  { id: 'dashboard', label: 'Home' }, { id: 'customers', label: 'Customers' }, { id: 'products', label: 'Products' }, { id: 'sales', label: 'Sales' }, { id: 'purchases', label: 'Purchases' },
  { id: 'labour', label: 'Labour' }, { id: 'bills', label: 'Bills' }, { id: 'history', label: 'History' },
]
export function App() {
  const { loading, configured, session, user } = useAuth()
  if (!configured) return <ConfigurationNotice />
  if (loading) return <LoadingScreen />
  if (!session) return <SignInScreen />
  if (!user?.profile?.isActive) return <InactiveAccount />
  return <AuthenticatedApp roleLabel={user.profile.role === 'owner' ? 'Owner' : 'Partner'} />
}
function AuthenticatedApp({ roleLabel }: { roleLabel: string }) {
  const [activeSection, setActiveSection] = useState<Section>('dashboard')
  const { user } = useAuth()
  const isOwner = user?.profile?.role === 'owner'
  const visibleSections = isOwner ? [...sections, { id: 'users' as Section, label: 'Users' }, { id: 'settings' as Section, label: 'Settings' }] : sections
  return <div className="app-shell">
    <header className="topbar"><div><p className="eyebrow">Paul Bricks & Blocks</p><h1>{getSectionTitle(activeSection)}</h1></div><div className="user-badge">{roleLabel}</div></header>
    <main className="page-content">{activeSection === 'dashboard' ? <Dashboard onNewSale={() => setActiveSection('sales')} /> : activeSection === 'customers' ? <Customers /> : activeSection === 'products' ? <Products /> : activeSection === 'sales' ? <Sales /> : activeSection === 'users' && isOwner ? <Users /> : activeSection === 'settings' && isOwner ? <Settings /> : <Placeholder section={activeSection}/>}<div className="account-strip"><span>{user?.email ?? 'Signed in'}</span><Button variant="secondary" onClick={() => void signOut()}>Sign out</Button></div></main>
    <nav className="bottom-nav" aria-label="Main navigation">{visibleSections.map((section) => <Button key={section.id} variant={activeSection === section.id ? 'active' : 'nav'} onClick={() => setActiveSection(section.id)}>{section.label}</Button>)}</nav>
  </div>
}
function SignInScreen() { const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); async function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(''); setBusy(true); try { await signIn(email.trim(), password) } catch (errorValue) { setError(errorValue instanceof Error ? errorValue.message : 'Unable to sign in.') } finally { setBusy(false) } } return <main className="auth-screen"><section className="auth-card"><p className="eyebrow">Paul Bricks & Blocks</p><h1>Sign in</h1><p>Use your business account to continue.</p><form onSubmit={handleSubmit} className="auth-form"><label>Email<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <p className="error-text" role="alert">{error}</p>}<Button variant="primary" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Button></form></section></main> }
function ConfigurationNotice() { return <main className="auth-screen"><section className="auth-card"><p className="eyebrow">Setup needed</p><h1>Start the API</h1><p>The MERN API is not reachable yet. Start the Node server and check the local API settings.</p></section></main> }
function LoadingScreen() { return <main className="auth-screen"><section className="auth-card"><p>Loading your account…</p></section></main> }
function InactiveAccount() { return <main className="auth-screen"><section className="auth-card"><p className="eyebrow">Account unavailable</p><h1>Contact the owner</h1><p>This account is currently inactive.</p></section></main> }
function Dashboard({ onNewSale }: { onNewSale: () => void }) { return <><section className="welcome-card"><p className="eyebrow">Good morning</p><h2>What do you want to do?</h2><div className="action-grid"><Button variant="primary" onClick={onNewSale}>+ New Sale</Button><Button variant="secondary">+ Add Purchase</Button><Button variant="secondary">+ Add Expense</Button><Button variant="secondary">+ Add Labour</Button></div></section><section className="summary-grid"><SummaryCard label="Today's Sales" value="₹0"/><SummaryCard label="Today's Expenses" value="₹0"/><SummaryCard label="Pending Payments" value="₹0"/></section></> }
function SummaryCard({ label, value }: { label: string; value: string }) { return <article className="summary-card"><p>{label}</p><strong>{value}</strong></article> }
function Placeholder({ section }: { section: Section }) { return <section className="empty-state"><p className="eyebrow">Foundation</p><h2>{getSectionTitle(section)}</h2><p>This section will be built in the next business phase.</p></section> }
function getSectionTitle(section: Section) { return sections.find((item) => item.id === section)?.label ?? (section === 'users' ? 'Users' : section === 'settings' ? 'Settings' : 'Home') }
