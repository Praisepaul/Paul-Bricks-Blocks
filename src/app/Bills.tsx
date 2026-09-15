import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { createBill, listBills, markBillPaid, type Bill } from '../lib/bills'

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })
const categories = ['Electricity', 'Water', 'Rent', 'Phone / Internet', 'Loan', 'Other']
function today() { return new Date().toISOString().slice(0, 10) }

export function Bills() {
  const [bills, setBills] = useState<Bill[]>([])
  const [title, setTitle] = useState(''); const [category, setCategory] = useState(''); const [amount, setAmount] = useState('')
  const [billDate, setBillDate] = useState(today); const [dueDate, setDueDate] = useState(''); const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [success, setSuccess] = useState('')

  async function load() { setLoading(true); setError(''); try { setBills(await listBills()) } catch (errorValue) { setError(errorValue instanceof Error ? errorValue.message : 'Unable to load bills.') } finally { setLoading(false) } }
  useEffect(() => { void load() }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setSuccess(''); setBusy(true)
    try {
      const bill = await createBill({ title: title.trim(), category: category.trim(), amount: Number(amount), billDate, dueDate, notes: notes.trim() })
      setBills((current) => [bill, ...current]); setSuccess(`Bill saved as ${bill.billNumber}.`)
      setTitle(''); setCategory(''); setAmount(''); setBillDate(today()); setDueDate(''); setNotes('')
    } catch (errorValue) { setError(errorValue instanceof Error ? errorValue.message : 'Unable to save bill.') } finally { setBusy(false) }
  }

  async function handlePaid(bill: Bill) {
    setError(''); setSuccess(''); setBusy(true)
    try { const updated = await markBillPaid(bill.id, today()); setBills((current) => current.map((item) => item.id === updated.id ? updated : item)); setSuccess(`${bill.title} marked as paid.`) }
    catch (errorValue) { setError(errorValue instanceof Error ? errorValue.message : 'Unable to mark bill paid.') } finally { setBusy(false) }
  }

  return <div className="bills-page">
    <section className="page-heading"><p className="eyebrow">Money</p><h2>Bills</h2><p>Keep track of regular bills and mark them paid when you pay them.</p></section>
    <section className="form-card"><h3>New bill</h3><form className="customer-form" onSubmit={handleSubmit}>
      <label>Bill name<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Example: Electricity bill" required /></label>
      <label>Category<select value={category} onChange={(event) => setCategory(event.target.value)} required><option value="">Choose category</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label>Amount<input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" required /></label>
      <label>Bill date<input type="date" value={billDate} onChange={(event) => setBillDate(event.target.value)} required /></label>
      <label>Due date <span className="field-hint">(optional)</span><input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} min={billDate} /></label>
      <label>Notes <span className="field-hint">(optional)</span><input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Example: Monthly electricity" /></label>
      {error && <p className="error-text" role="alert">{error}</p>}{success && <p className="success-text" role="status">{success}</p>}
      <div className="form-actions"><Button variant="primary" type="submit" disabled={busy || loading}>{busy ? 'Saving…' : 'Save bill'}</Button></div>
    </form></section>
    <section className="user-list"><div className="list-heading"><h3>Recent bills</h3><Button variant="secondary" onClick={() => void load()} disabled={loading || busy}>Refresh</Button></div>
      {loading ? <p>Loading bills…</p> : bills.length === 0 ? <p>No bills yet.</p> : bills.map((bill) => <article className="user-row expense-row" key={bill.id}><div><strong>{bill.title}</strong><span>{bill.category} · {bill.billDate}{bill.dueDate ? ` · Due ${bill.dueDate}` : ''} · {bill.billNumber}</span></div><div className="row-actions"><strong>{money.format(bill.amount)}</strong>{bill.isPaid ? <span className="success-text">Paid {bill.paidDate}</span> : <Button variant="secondary" onClick={() => void handlePaid(bill)} disabled={busy}>Mark paid</Button>}</div></article>)}
    </section>
  </div>
}
