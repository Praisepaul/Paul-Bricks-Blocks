import { useState, type ReactNode } from 'react'
import { Button } from '../components/Button'
import { Products } from './Products'
import { Stock } from './Stock'

export function Inventory() {
  const [view, setView] = useState<'overview' | 'products' | 'stock'>('overview')
  if (view === 'products') return <HubView title="Products" onBack={() => setView('overview')}><Products /></HubView>
  if (view === 'stock') return <HubView title="Current stock" onBack={() => setView('overview')}><Stock /></HubView>
  return <section className="form-card">
    <div className="page-heading"><div><p className="eyebrow">Inventory</p><h2>Inventory</h2><p>Choose what you want to see. Everything is still here, just grouped to keep it simple.</p></div></div>
    <div className="action-grid">
      <Button variant="primary" onClick={() => setView('products')}>Show available products</Button>
      <Button variant="secondary" onClick={() => setView('stock')}>Show current stock</Button>
    </div>
    <div className="summary-grid" style={{ marginTop: 16 }}>
      <article className="summary-card"><p>Products</p><strong>Product master</strong><span>Names, units and prices</span></article>
      <article className="summary-card"><p>Stock</p><strong>Current quantity</strong><span>Available quantity and stock value</span></article>
    </div>
  </section>
}

function HubView({ title, onBack, children }: { title: string; onBack: () => void; children: ReactNode }) {
  return <><section className="page-heading"><div><p className="eyebrow">Inventory</p><h2>{title}</h2></div><Button variant="secondary" onClick={onBack}>← Inventory</Button></section>{children}</>
}
