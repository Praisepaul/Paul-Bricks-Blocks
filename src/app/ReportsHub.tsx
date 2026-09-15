import { useState } from 'react'
import { Button } from '../components/Button'
import { Reports } from './Reports'
import { Ledger } from './Ledger'

export function ReportsHub() {
  const [showLedger, setShowLedger] = useState(false)
  if (showLedger) return <><section className="page-heading"><div><p className="eyebrow">Reports</p><h2>Detailed ledger</h2><p>Accounting entries behind the report.</p></div><Button variant="secondary" onClick={() => setShowLedger(false)}>← Reports</Button></section><Ledger /></>
  return <><Reports /><section className="form-card" style={{ marginTop: 16 }}><div className="page-heading"><div><p className="eyebrow">Drill down</p><h3>Detailed ledger</h3><p>Open the full accounting entries only when you need them.</p></div><Button variant="secondary" onClick={() => setShowLedger(true)}>View ledger</Button></div></section></>
}
