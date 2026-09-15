import { useEffect, useState } from 'react'
import { Button } from '../components/Button'
import { getReportSummary, type ReportSummary } from '../lib/reports'

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })
function today() { return new Date().toISOString().slice(0, 10) }
function daysAgo(days: number) { const date = new Date(); date.setDate(date.getDate() - days); return date.toISOString().slice(0, 10) }

export function Reports() {
  const [from, setFrom] = useState(today())
  const [to, setTo] = useState(today())
  const [report, setReport] = useState<ReportSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function load(nextFrom = from, nextTo = to) {
    setError(''); setBusy(true)
    try { setReport(await getReportSummary(nextFrom, nextTo)) }
    catch (errorValue) { setError(errorValue instanceof Error ? errorValue.message : 'Unable to load report.') }
    finally { setBusy(false); setLoading(false) }
  }
  useEffect(() => { void load() }, [])

  function applyRange(nextFrom: string, nextTo: string) { setFrom(nextFrom); setTo(nextTo); void load(nextFrom, nextTo) }
  const net = report?.cashMovementBeforeStockAndTax ?? 0

  return <div className="reports-page">
    <section className="page-heading"><p className="eyebrow">Accounts</p><h2>Reports</h2><p>See the business picture for any date range.</p></section>
    <section className="form-card report-filter-card">
      <h3>Date range</h3>
      <div className="report-presets">
        <Button variant="secondary" type="button" onClick={() => applyRange(today(), today())}>Today</Button>
        <Button variant="secondary" type="button" onClick={() => applyRange(daysAgo(6), today())}>7 days</Button>
        <Button variant="secondary" type="button" onClick={() => { const d = new Date(); d.setDate(1); applyRange(d.toISOString().slice(0, 10), today()) }}>This month</Button>
      </div>
      <div className="report-date-grid">
        <label>From<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
        <label>To<input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
      </div>
      <Button variant="primary" type="button" onClick={() => void load()} disabled={busy || !from || !to}>{busy ? 'Loading…' : 'Show report'}</Button>
    </section>
    {error && <p className="error-text" role="alert">{error}</p>}
    {loading ? <section className="empty-state"><p>Loading report…</p></section> : report && <>
      <section className="summary-grid report-summary-grid">
        <article className="summary-card"><p>Sales</p><strong>{money.format(report.sales.total)}</strong><span>{report.sales.count} sale{report.sales.count === 1 ? '' : 's'}</span></article>
        <article className="summary-card"><p>Purchases</p><strong>{money.format(report.purchases.total)}</strong><span>{report.purchases.count} purchase{report.purchases.count === 1 ? '' : 's'}</span></article>
        <article className="summary-card"><p>Expenses + Labour</p><strong>{money.format(report.expenses.total + report.labour.total)}</strong><span>{report.expenses.count} expenses · {report.labour.count} labour</span></article>
        <article className="summary-card"><p>GST collected</p><strong>{money.format(report.sales.gst)}</strong><span>from sales</span></article>
      </section>
      <section className="user-list report-section"><h3>Money summary</h3>
        <div className="report-line"><span>Sales before GST</span><strong>{money.format(report.sales.subtotal)}</strong></div>
        <div className="report-line"><span>GST collected</span><strong>{money.format(report.sales.gst)}</strong></div>
        <div className="report-line"><span>Sales total</span><strong>{money.format(report.sales.total)}</strong></div>
        <div className="report-line"><span>Purchases</span><strong>{money.format(report.purchases.total)}</strong></div>
        <div className="report-line"><span>Expenses</span><strong>{money.format(report.expenses.total)}</strong></div>
        <div className="report-line"><span>Labour</span><strong>{money.format(report.labour.total)}</strong></div>
        <div className="report-line report-total"><span>Cash movement before stock & tax</span><strong>{money.format(net)}</strong></div>
      </section>
      <section className="user-list report-section"><h3>Bills & GST</h3>
        <div className="report-line"><span>Unpaid bills in period</span><strong>{money.format(report.unpaidBills.total)} ({report.unpaidBills.count})</strong></div>
        <div className="report-line"><span>Purchase input GST</span><strong>Not captured yet</strong></div>
        <p className="field-hint">GST collected is shown from sales. Purchase GST / input tax credit is deliberately not guessed until purchase tax details are captured.</p>
      </section>
      <section className="empty-state report-note"><p className="eyebrow">Accounting note</p><p>{report.stockNote}</p></section>
    </>}
  </div>
}
