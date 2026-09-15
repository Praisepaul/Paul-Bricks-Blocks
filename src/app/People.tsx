import { useState } from 'react'
import { Button } from '../components/Button'
import { Customers } from './Customers'
import { Suppliers } from './Suppliers'

type View = 'customers' | 'suppliers'

export function People() {
  const [view, setView] = useState<View>('customers')
  return <div className="people-page">
    <section className="page-heading">
      <div>
        <p className="eyebrow">People</p>
        <h2>{view === 'customers' ? 'Customers' : 'Suppliers'}</h2>
        <p>Switch between customers and suppliers here without leaving the People tab.</p>
      </div>
    </section>
    <div className="section-switcher" role="tablist" aria-label="People sections">
      <Button variant={view === 'customers' ? 'active' : 'secondary'} role="tab" aria-selected={view === 'customers'} onClick={() => setView('customers')}>Customers</Button>
      <Button variant={view === 'suppliers' ? 'active' : 'secondary'} role="tab" aria-selected={view === 'suppliers'} onClick={() => setView('suppliers')}>Suppliers</Button>
    </div>
    {view === 'customers' ? <Customers /> : <Suppliers />}
  </div>
}
