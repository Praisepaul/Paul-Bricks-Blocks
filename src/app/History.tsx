import { useEffect, useState } from 'react'
import { Button } from '../components/Button'
import { listHistory, type HistoryItem, type HistoryType } from '../lib/history'

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })
const labels: Record<HistoryType, string> = { sale: 'Sale', purchase: 'Purchase', expense: 'Expense', labour: 'Labour', bill: 'Bill' }

export function History() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [filter, setFilter] = useState<'all' | HistoryType>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  async function load() { setLoading(true); setError(''); try { setItems(await listHistory()) } catch (errorValue) { setError(errorValue instanceof Error ? errorValue.message : 'Unable to load history.') } finally { setLoading(false) } }
  useEffect(() => { void load() }, [])
  const visible = filter === 'all' ? items : items.filter((item) => item.type === filter)
  return <div className="history-page">
    <section className="page-heading"><p className="eyebrow">Records</p><h2>History</h2><p>See your recent business transactions in one place.</p></section>
    <section className="form-card"><div className="history-filters">{(['all', 'sale', 'purchase', 'expense', 'labour', 'bill'] as const).map((value) => <Button key={value} variant={filter === value ? 'active' : 'secondary'} onClick={() => setFilter(value)}>{value === 'all' ? 'All' : labels[value]}</Button>)}</div></section>
    <section className="user-list"><div className="list-heading"><h3>Recent records</h3><Button variant="secondary" onClick={() => void load()} disabled={loading}>Refresh</Button></div>
      {error && <p className="error-text" role="alert">{error}</p>}
      {loading ? <p>Loading history…</p> : visible.length === 0 ? <p>No records found.</p> : visible.map((item) => <article className="user-row history-row" key={`${item.type}-${item.id}`}><div><strong>{item.title}</strong><span>{labels[item.type]} · {item.subtitle} · {item.date} · {item.number}{item.status ? ` · ${item.status === 'paid' ? 'Paid' : 'Unpaid'}` : ''}</span></div><div className="row-actions"><strong>{money.format(item.amount)}</strong></div></article>)}
    </section>
  </div>
}
