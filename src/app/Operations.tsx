import { useState, type ReactNode } from 'react'
import { Button } from '../components/Button'
import { Expenses } from './Expenses'
import { Bills } from './Bills'
import { Labour } from './Labour'

export function Operations() {
  const [view, setView] = useState<'overview' | 'expenses' | 'bills' | 'labour'>('overview')
  if (view === 'expenses') return <HubView title="Expenses" onBack={() => setView('overview')}><Expenses /></HubView>
  if (view === 'bills') return <HubView title="Bills" onBack={() => setView('overview')}><Bills /></HubView>
  if (view === 'labour') return <HubView title="Labour" onBack={() => setView('overview')}><Labour /></HubView>
  return <section className="form-card">
    <div className="page-heading"><div><p className="eyebrow">More money</p><h2>Expenses & bills</h2><p>Expenses, bills and labour are grouped together without removing any of their existing screens.</p></div></div>
    <div className="action-grid">
      <Button variant="primary" onClick={() => setView('expenses')}>Show expenses</Button>
      <Button variant="secondary" onClick={() => setView('bills')}>Show bills</Button>
      <Button variant="secondary" onClick={() => setView('labour')}>Show labour</Button>
    </div>
  </section>
}

function HubView({ title, onBack, children }: { title: string; onBack: () => void; children: ReactNode }) {
  return <><section className="page-heading"><div><p className="eyebrow">Expenses & bills</p><h2>{title}</h2></div><Button variant="secondary" onClick={onBack}>← Expenses & bills</Button></section>{children}</>
}
