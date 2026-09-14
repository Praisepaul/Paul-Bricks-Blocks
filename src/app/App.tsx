import { useState } from 'react'
import { Button } from '../components/Button'

type Section = 'dashboard' | 'sales' | 'purchases' | 'labour' | 'bills' | 'history'

const sections: Array<{ id: Section; label: string }> = [
  { id: 'dashboard', label: 'Home' },
  { id: 'sales', label: 'Sales' },
  { id: 'purchases', label: 'Purchases' },
  { id: 'labour', label: 'Labour' },
  { id: 'bills', label: 'Bills' },
  { id: 'history', label: 'History' },
]

export function App() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard')

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Paul Bricks & Blocks</p>
          <h1>{getSectionTitle(activeSection)}</h1>
        </div>
        <div className="user-badge" aria-label="Current user role">Owner</div>
      </header>

      <main className="page-content">
        {activeSection === 'dashboard' ? <Dashboard /> : <Placeholder section={activeSection} />}
      </main>

      <nav className="bottom-nav" aria-label="Main navigation">
        {sections.map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? 'active' : 'nav'}
            onClick={() => setActiveSection(section.id)}
          >
            {section.label}
          </Button>
        ))}
      </nav>
    </div>
  )
}

function Dashboard() {
  return (
    <>
      <section className="welcome-card">
        <p className="eyebrow">Good morning</p>
        <h2>What do you want to do?</h2>
        <div className="action-grid">
          <Button variant="primary">+ New Sale</Button>
          <Button variant="secondary">+ Add Purchase</Button>
          <Button variant="secondary">+ Add Expense</Button>
          <Button variant="secondary">+ Add Labour</Button>
        </div>
      </section>

      <section className="summary-grid" aria-label="Business summary">
        <SummaryCard label="Today's Sales" value="₹0" />
        <SummaryCard label="Today's Expenses" value="₹0" />
        <SummaryCard label="Pending Payments" value="₹0" />
      </section>
    </>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="summary-card">
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  )
}

function Placeholder({ section }: { section: Section }) {
  return (
    <section className="empty-state">
      <p className="eyebrow">Foundation</p>
      <h2>{getSectionTitle(section)}</h2>
      <p>This section will be built in the next business phase.</p>
    </section>
  )
}

function getSectionTitle(section: Section) {
  return sections.find((item) => item.id === section)?.label ?? 'Home'
}
