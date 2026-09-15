import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { createLabour, listLabour, type Labour } from '../lib/labour'

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function Labour() {
  const [labour, setLabour] = useState<Labour[]>([])
  const [workerName, setWorkerName] = useState('')
  const [workDescription, setWorkDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [labourDate, setLabourDate] = useState(today)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    setLoading(true); setError('')
    try { setLabour(await listLabour()) }
    catch (errorValue) { setError(errorValue instanceof Error ? errorValue.message : 'Unable to load labour records.') }
    finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setSuccess(''); setBusy(true)
    try {
      const record = await createLabour({ workerName: workerName.trim(), workDescription: workDescription.trim(), amount: Number(amount), labourDate })
      setLabour((current) => [record, ...current])
      setSuccess(`Labour payment saved as ${record.labourNumber}.`)
      setWorkerName(''); setWorkDescription(''); setAmount(''); setLabourDate(today())
    } catch (errorValue) { setError(errorValue instanceof Error ? errorValue.message : 'Unable to save labour payment.') }
    finally { setBusy(false) }
  }

  return <div className="labour-page">
    <section className="page-heading"><p className="eyebrow">People</p><h2>Labour</h2><p>Record payments made to workers. Detailed attendance can come later.</p></section>
    <section className="form-card">
      <h3>New labour payment</h3>
      <form className="customer-form" onSubmit={handleSubmit}>
        <label>Worker name<input value={workerName} onChange={(event) => setWorkerName(event.target.value)} placeholder="Example: Ramesh" required /></label>
        <label>Work description <span className="field-hint">(optional)</span><input value={workDescription} onChange={(event) => setWorkDescription(event.target.value)} placeholder="Example: Brick loading" /></label>
        <label>Amount<input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" required /></label>
        <label>Date<input type="date" value={labourDate} onChange={(event) => setLabourDate(event.target.value)} required /></label>
        {error && <p className="error-text" role="alert">{error}</p>}
        {success && <p className="success-text" role="status">{success}</p>}
        <div className="form-actions"><Button variant="primary" type="submit" disabled={busy || loading}>{busy ? 'Saving…' : 'Save labour payment'}</Button></div>
      </form>
    </section>
    <section className="user-list"><div className="list-heading"><h3>Recent labour payments</h3><Button variant="secondary" onClick={() => void load()} disabled={loading}>Refresh</Button></div>
      {loading ? <p>Loading labour payments…</p> : labour.length === 0 ? <p>No labour payments yet.</p> : labour.map((record) => <article className="user-row labour-row" key={record.id}><div><strong>{record.workerName}</strong><span>{record.workDescription || 'No work description'} · {record.labourDate} · {record.labourNumber}</span></div><div className="row-actions"><strong>{money.format(record.amount)}</strong></div></article>)}
    </section>
  </div>
}
