import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { getBusinessSettings, saveBusinessSettings, type BusinessSettings } from '../lib/settings'

const emptySettings: BusinessSettings = { businessName: 'Paul Bricks & Blocks', phone: '', address: '', state: '', gstNumber: '', defaultGstRate: 0, currency: 'INR' }

export function Settings() {
  const [settings, setSettings] = useState<BusinessSettings>(emptySettings)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  useEffect(() => { void getBusinessSettings().then(setSettings).catch((value) => setError(value instanceof Error ? value.message : 'Unable to load settings.')).finally(() => setLoading(false)) }, [])
  function update(field: keyof BusinessSettings, value: string | number) { setSettings((current) => ({ ...current, [field]: value })) }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(''); setMessage(''); setBusy(true); try { setSettings(await saveBusinessSettings(settings)); setMessage('Business details saved.') } catch (value) { setError(value instanceof Error ? value.message : 'Unable to save settings.') } finally { setBusy(false) } }
  if (loading) return <section className="empty-state"><p>Loading business details…</p></section>
  return <section className="settings-page"><div className="page-heading"><p className="eyebrow">Owner</p><h2>Business Settings</h2><p>These details are used on invoices and GST calculations.</p></div><section className="form-card"><form className="auth-form" onSubmit={handleSubmit}>
    <label>Business name<input value={settings.businessName} onChange={(event) => update('businessName', event.target.value)} required /></label>
    <label>Phone number<input type="tel" autoComplete="tel" value={settings.phone} onChange={(event) => update('phone', event.target.value)} /></label>
    <label>Business address<textarea value={settings.address} onChange={(event) => update('address', event.target.value)} rows={3} /></label>
    <label>Business state <span className="field-hint">(needed for CGST/SGST vs IGST)</span><input value={settings.state} onChange={(event) => update('state', event.target.value)} placeholder="Example: Karnataka" /></label>
    <label>GST number <span className="field-hint">(optional)</span><input value={settings.gstNumber} onChange={(event) => update('gstNumber', event.target.value)} placeholder="Example: 29ABCDE1234F1Z5" /></label>
    <label>Default GST rate (%) <span className="field-hint">(0 to 28)</span><input type="number" min="0" max="28" step="0.01" value={settings.defaultGstRate} onChange={(event) => update('defaultGstRate', Number(event.target.value))} /></label>
    <label>Currency<input value="₹ Indian Rupee (INR)" readOnly /></label>
    {error && <p className="error-text" role="alert">{error}</p>}{message && <p className="success-text" role="status">{message}</p>}
    <Button variant="primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save Business Details'}</Button>
  </form></section></section>
}
