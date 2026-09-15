import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { createExpense, listExpenses, type Expense } from '../lib/expenses'

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })
const categories = ['Electricity', 'Transport', 'Diesel', 'Repairs', 'Office', 'Rent', 'Other']

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [expenseDate, setExpenseDate] = useState(today)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    setLoading(true); setError('')
    try { setExpenses(await listExpenses()) }
    catch (errorValue) { setError(errorValue instanceof Error ? errorValue.message : 'Unable to load expenses.') }
    finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setSuccess(''); setBusy(true)
    try {
      const expense = await createExpense({ category: category.trim(), description: description.trim(), amount: Number(amount), expenseDate })
      setExpenses((current) => [expense, ...current])
      setSuccess(`Expense saved as ${expense.expenseNumber}.`)
      setCategory(''); setDescription(''); setAmount(''); setExpenseDate(today())
    } catch (errorValue) { setError(errorValue instanceof Error ? errorValue.message : 'Unable to save expense.') }
    finally { setBusy(false) }
  }

  return <div className="expenses-page">
    <section className="page-heading"><p className="eyebrow">Money</p><h2>Expenses</h2><p>Record everyday business expenses. Simple now, reports later.</p></section>
    <section className="form-card">
      <h3>New expense</h3>
      <form className="customer-form" onSubmit={handleSubmit}>
        <label>Category<select value={category} onChange={(event) => setCategory(event.target.value)} required><option value="">Choose category</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label>Description <span className="field-hint">(optional)</span><input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Example: Diesel for delivery" /></label>
        <label>Amount<input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" required /></label>
        <label>Date<input type="date" value={expenseDate} onChange={(event) => setExpenseDate(event.target.value)} required /></label>
        {error && <p className="error-text" role="alert">{error}</p>}
        {success && <p className="success-text" role="status">{success}</p>}
        <div className="form-actions"><Button variant="primary" type="submit" disabled={busy || loading}>{busy ? 'Saving…' : 'Save expense'}</Button></div>
      </form>
    </section>
    <section className="user-list"><div className="list-heading"><h3>Recent expenses</h3><Button variant="secondary" onClick={() => void load()} disabled={loading}>Refresh</Button></div>
      {loading ? <p>Loading expenses…</p> : expenses.length === 0 ? <p>No expenses yet.</p> : expenses.map((expense) => <article className="user-row expense-row" key={expense.id}><div><strong>{expense.category}</strong><span>{expense.description || 'No description'} · {expense.expenseDate} · {expense.expenseNumber}</span></div><div className="row-actions"><strong>{money.format(expense.amount)}</strong></div></article>)}
    </section>
  </div>
}
