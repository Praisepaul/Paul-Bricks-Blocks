import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { listCustomers, type Customer } from '../lib/customers'
import { listProducts, type Product } from '../lib/products'
import { createSale, listSales, type Sale } from '../lib/sales'

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })

export function Sales() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [customerId, setCustomerId] = useState('')
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unitPrice, setUnitPrice] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const selectedProduct = useMemo(() => products.find((product) => product.id === productId), [products, productId])
  const total = (Number(quantity) || 0) * (Number(unitPrice) || 0)

  async function load() {
    setLoading(true); setError('')
    try {
      const [customerData, productData, saleData] = await Promise.all([listCustomers(), listProducts(), listSales()])
      setCustomers(customerData.filter((item) => item.isActive))
      setProducts(productData.filter((item) => item.isActive))
      setSales(saleData)
    } catch (errorValue) { setError(errorValue instanceof Error ? errorValue.message : 'Unable to load sales.') }
    finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [])

  function handleProductChange(id: string) {
    setProductId(id)
    const product = products.find((item) => item.id === id)
    setUnitPrice(product ? String(product.sellingPrice) : '')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setSuccess(''); setBusy(true)
    try {
      const sale = await createSale({ customerId, productId, quantity: Number(quantity), unitPrice: Number(unitPrice) })
      setSales((current) => [sale, ...current]); setSuccess(`Sale saved as ${sale.invoiceNumber}.`); setCustomerId(''); setProductId(''); setQuantity('1'); setUnitPrice('')
    } catch (errorValue) { setError(errorValue instanceof Error ? errorValue.message : 'Unable to save sale.') }
    finally { setBusy(false) }
  }

  return <div className="sales-page">
    <section className="page-heading"><p className="eyebrow">Money</p><h2>Sales</h2><p>Create a simple sale and get an invoice number automatically.</p></section>
    <section className="form-card">
      <h3>New sale</h3>
      <form className="customer-form" onSubmit={handleSubmit}>
        <label>Customer<select value={customerId} onChange={(event) => setCustomerId(event.target.value)} required><option value="">Choose customer</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></label>
        <label>Product<select value={productId} onChange={(event) => handleProductChange(event.target.value)} required><option value="">Choose product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} — {money.format(product.sellingPrice)}/{product.unit}</option>)}</select></label>
        {selectedProduct && <p className="field-hint">Selling price: {money.format(selectedProduct.sellingPrice)} per {selectedProduct.unit}. You can change it for this sale.</p>}
        <label>Quantity<input type="number" min="0.01" step="0.01" value={quantity} onChange={(event) => setQuantity(event.target.value)} required /></label>
        <label>Price per unit<input type="number" min="0" step="0.01" value={unitPrice} onChange={(event) => setUnitPrice(event.target.value)} required /></label>
        <div className="sale-total"><span>Total</span><strong>{money.format(total)}</strong></div>
        {error && <p className="error-text" role="alert">{error}</p>}
        {success && <p className="success-text" role="status">{success}</p>}
        <div className="form-actions"><Button variant="primary" type="submit" disabled={busy || loading}>{busy ? 'Saving…' : 'Save sale'}</Button></div>
      </form>
    </section>
    <section className="user-list"><div className="list-heading"><h3>Recent sales</h3><Button variant="secondary" onClick={() => void load()} disabled={loading}>Refresh</Button></div>
      {loading ? <p>Loading sales…</p> : sales.length === 0 ? <p>No sales yet.</p> : sales.map((sale) => <article className="user-row sale-row" key={sale.id}><div><strong>{sale.invoiceNumber}</strong><span>{sale.customerName} · {sale.productName} · {sale.quantity} {sale.unit}</span></div><div className="row-actions"><strong>{money.format(sale.totalAmount)}</strong></div></article>)}
    </section>
  </div>
}
