import { useState } from 'react'
import { Button } from '../components/Button'
import { Expenses } from './Expenses'
import { Bills } from './Bills'
import { Labour } from './Labour'

type View = 'expenses' | 'bills' | 'labour'

export function Operations() {
  const [view, setView] = useState<View>('expenses')
  return <div className="operations-page">
    <section className="page-heading">
      <div>
        <p className="eyebrow">More money</p>
        <h2>{view === 'expenses' ? 'Expenses' : view === 'bills' ? 'Bills' : 'Labour'}</h2>
        <p>Switch between expenses, bills and labour here without leaving this tab.</p>
      </div>
    </section>
    <div className="section-switcher" role="tablist" aria-label="Expenses and bills sections">
      <Button variant={view === 'expenses' ? 'active' : 'secondary'} role="tab" aria-selected={view === 'expenses'} onClick={() => setView('expenses')}>Expenses</Button>
      <Button variant={view === 'bills' ? 'active' : 'secondary'} role="tab" aria-selected={view === 'bills'} onClick={() => setView('bills')}>Bills</Button>
      <Button variant={view === 'labour' ? 'active' : 'secondary'} role="tab" aria-selected={view === 'labour'} onClick={() => setView('labour')}>Labour</Button>
    </div>
    {view === 'expenses' ? <Expenses /> : view === 'bills' ? <Bills /> : <Labour />}
  </div>
}
