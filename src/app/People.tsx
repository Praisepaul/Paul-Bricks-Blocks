import { useState, type ReactNode } from 'react'
import { Button } from '../components/Button'
import { Customers } from './Customers'
import { Suppliers } from './Suppliers'

export function People() {
  const [view, setView] = useState<'overview' | 'customers' | 'suppliers'>('overview')
  if (view === 'customers') return <HubView title="Customers" onBack={() => setView('overview')}><Customers /></HubView>
  if (view === 'suppliers') return <HubView title="Suppliers" onBack={() => setView('overview')}><Suppliers /></HubView>
  return <section className="form-card">
    <div className="page-heading"><div><p className="eyebrow">People</p><h2>People</h2><p>Customers and suppliers are together here so Dad does not need to remember two menus.</p></div></div>
    <div className="action-grid">
      <Button variant="primary" onClick={() => setView('customers')}>Show customers</Button>
      <Button variant="secondary" onClick={() => setView('suppliers')}>Show suppliers</Button>
    </div>
  </section>
}

function HubView({ title, onBack, children }: { title: string; onBack: () => void; children: ReactNode }) {
  return <><section className="page-heading"><div><p className="eyebrow">People</p><h2>{title}</h2></div><Button variant="secondary" onClick={onBack}>← People</Button></section>{children}</>
}
