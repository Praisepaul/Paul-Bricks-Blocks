import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { createCustomer, listCustomers, updateCustomer, type Customer } from '../lib/customers'

const emptyForm = { name: '', phone: '', address: '', gstNumber: '' }

type CustomerForm = typeof emptyForm

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [form, setForm] = useState<CustomerForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadCustomers() {
    setLoading(true)
    setError('')
    try {
      setCustomers(await listCustomers())
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : 'Unable to load customers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadCustomers() }, [])

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
    setError('')
  }

  function startEditing(customer: Customer) {
    setEditingId(customer.id)
    setForm({ name: customer.name, phone: customer.phone, address: customer.address, gstNumber: customer.gstNumber })
    setSuccess('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setBusy(true)
    try {
      if (editingId) {
        await updateCustomer(editingId, form)
        setSuccess('Customer details updated.')
      } else {
        await createCustomer(form)
        setSuccess('Customer added.')
      }
      resetForm()
      await loadCustomers()
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : 'Unable to save customer.')
    } finally {
      setBusy(false)
    }
  }

  async function toggleCustomer(customer: Customer) {
    setError('')
    setSuccess('')
    setBusy(true)
    try {
      await updateCustomer(customer.id, {
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        gstNumber: customer.gstNumber,
        isActive: !customer.isActive,
      })
      setSuccess(customer.isActive ? 'Customer marked inactive.' : 'Customer marked active.')
      await loadCustomers()
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : 'Unable to update customer.')
    } finally {
      setBusy(false)
    }
  }

  return <div className="customers-page">
    <section className="page-heading">
      <p className="eyebrow">Business</p>
      <h2>Customers</h2>
      <p>Keep your customer list ready for sales and payments.</p>
    </section>

    <section className="form-card">
      <h3>{editingId ? 'Edit customer' : 'Add customer'}</h3>
      <form className="customer-form" onSubmit={handleSubmit}>
        <label>Customer name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required autoFocus={!editingId} /></label>
        <label>Phone number<input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
        <label>Address<span className="field-hint"> Optional</span><textarea rows={3} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></label>
        <label>GST number<span className="field-hint"> Optional</span><input value={form.gstNumber} onChange={(event) => setForm({ ...form, gstNumber: event.target.value.toUpperCase() })} /></label>
        {error && <p className="error-text" role="alert">{error}</p>}
        {success && <p className="success-text" role="status">{success}</p>}
        <div className="form-actions">
          <Button variant="primary" type="submit" disabled={busy}>{busy ? 'Saving…' : editingId ? 'Save changes' : 'Add customer'}</Button>
          {editingId && <Button variant="secondary" type="button" onClick={resetForm} disabled={busy}>Cancel</Button>}
        </div>
      </form>
    </section>

    <section className="user-list customer-list">
      <div className="list-heading"><h3>Customer list</h3><span className="field-hint">{customers.length} total</span></div>
      {loading ? <p className="field-hint">Loading customers…</p> : customers.length === 0 ? <p className="field-hint">No customers yet. Add your first customer above.</p> : customers.map((customer) => <article className="user-row customer-row" key={customer.id}>
        <div>
          <strong>{customer.name}</strong>
          <span>{customer.phone || 'No phone number'}{customer.gstNumber ? ` · GST ${customer.gstNumber}` : ''}</span>
          {customer.address && <span>{customer.address}</span>}
        </div>
        <div className="row-actions">
          <span className="status-badge">{customer.isActive ? 'Active' : 'Inactive'}</span>
          <Button variant="secondary" type="button" onClick={() => startEditing(customer)} disabled={busy}>Edit</Button>
          <Button variant="secondary" type="button" onClick={() => void toggleCustomer(customer)} disabled={busy}>{customer.isActive ? 'Disable' : 'Enable'}</Button>
        </div>
      </article>)}
    </section>
  </div>
}
