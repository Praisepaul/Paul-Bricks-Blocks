import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { getBusinessSettings, saveBusinessSettings, type BusinessSettings } from '../lib/settings'

const emptySettings: BusinessSettings = {
  businessName: 'Paul Bricks & Blocks', phone: '', address: '', gstNumber: '', currency: 'INR',
}

export function Settings() {
  const [settings, setSettings] = useState<BusinessSettings>(emptySettings)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    void getBusinessSettings()
      .then(setSettings)
      .catch((value) => setError(value instanceof Error ? value.message : 'Unable to load settings.'))
      .finally(() => setLoading(false))
  }, [])

  function update(field: keyof BusinessSettings, value: string) {
    setSettings((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    try {
      const saved = await saveBusinessSettings(settings)
      setSettings(saved)
      setMessage('Business details saved.')
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Unable to save settings.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <section className="empty-state"><p>Loading business details…</p></section>

  return <section className="settings-page">
    <div className="page-heading">
      <p className="eyebrow">Owner</p>
      <h2>Business Settings</h2>
      <p>These details will be used on future invoices and business documents.</p>
    </div>
    <section className="form-card">
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>Business name<input value={settings.businessName} onChange={(event) => update('businessName', event.target.value)} required /></label>
        <label>Phone number<input type="tel" autoComplete="tel" value={settings.phone} onChange={(event) => update('phone', event.target.value)} /></label>
        <label>Business address<textarea value={settings.address} onChange={(event) => update('address', event.target.value)} rows={3} /></label>
        <label>GST number <span className="field-hint">(optional)</span><input value={settings.gstNumber} onChange={(event) => update('gstNumber', event.target.value)} placeholder="Example: 29ABCDE1234F1Z5" /></label>
        <label>Currency<input value="₹ Indian Rupee (INR)" readOnly /></label>
        {error && <p className="error-text" role="alert">{error}</p>}
        {message && <p className="success-text" role="status">{message}</p>}
        <Button variant="primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save Business Details'}</Button>
      </form>
    </section>
  </section>
}
