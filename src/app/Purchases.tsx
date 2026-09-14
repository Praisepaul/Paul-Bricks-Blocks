import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { listProducts, type Product } from '../lib/products'
import { createPurchase, listPurchases, type Purchase } from '../lib/purchases'

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })

export function Purchases() {
  const [products, setProducts] = useState<Product[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [supplierName, setSupplierName] = useState('')
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
      const [productData, purchaseData] = await Promise.all([listProducts(), listPurchases()])
      setProducts(productData.filter((item) => item.isActive))
      setPurchases(purchaseData)
    } catch (errorValue) { setError(errorValue instanceof Error ? errorValue.message : 'Unable to load purchases.') }
    finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [])

  function handleProductChange(id: string) {
    setProductId(id)
    const product = products.find((item) => item.id === id)
    setUnitPrice(product ? String(product.purchasePrice) : '')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setSuccess(''); setBusy(true)
    try {
      const purchase = await createPurchase({ supplierName: supplierName.trim(), productId, quantity: Number(quantity), unitPrice: Number(unitPrice) })
      setPurchases((current) => [purchase, ...current])
      setSuccess(`Purchase saved as ${purchase.purchaseNumber}.`)
      setSupplierName(''); setProductId(''); setQuantity('1'); setUnitPrice('')
    } catch (errorValue) { setError(errorValue instanceof Error ? errorValue.message : 'Unable to save purchase.') }
    finally { setBusy(false) }
  }

  return <div className="purchases-page">
    <section className="page-heading"><p className="eyebrow">Money</p><h2>Purchases</h2><p>Record materials bought from a supplier. Stock will be connected later.</p></section>
    <section className="form-card">
      <h3>New purchase</h3>
      <form className="customer-form" onSubmit={handleSubmit}>
        <label>Supplier name<input value={supplierName} onChange={(event) => setSupplierName(event.target.value)} placeholder="Example: ABC Bricks Supplier" required /></label>
        <label>Product<select value={productId} onChange={(event) => handleProductChange(event.target.value)} required><option value="">Choose product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} — {money.format(product.purchasePrice)}/{product.unit}</option>)}</select></label>
        {selectedProduct && <p className="field-hint">Purchase price: {money.format(selectedProduct.purchasePrice)} per {selectedProduct.unit}. You can change it for this purchase.</p>}
        <label>Quantity<input type="number" min="0.01" step="0.01" value={quantity} onChange={(event) => setQuantity(event.target.value)} required /></label>
        <label>Price per unit<input type="number" min="0" step="0.01" value={unitPrice} onChange={(event) => setUnitPrice(event.target.value)} required /></label>
        <div className="sale-total"><span>Total</span><strong>{money.format(total)}</strong></div>
        {error && <p className="error-text" role="alert">{error}</p>}
        {success && <p className="success-text" role="status">{success}</p>}
        <div className="form-actions"><Button variant="primary" type="submit" disabled={busy || loading}>{busy ? 'Saving…' : 'Save purchase'}</Button></div>
      </form>
    </section>
    <section className="user-list"><div className="list-heading"><h3>Recent purchases</h3><Button variant="secondary" onClick={() => void load()} disabled={loading}>Refresh</Button></div>
      {loading ? <p>Loading purchases…</p> : purchases.length === 0 ? <p>No purchases yet.</p> : purchases.map((purchase) => <article className="user-row sale-row" key={purchase.id}><div><strong>{purchase.purchaseNumber}</strong><span>{purchase.supplierName} · {purchase.productName} · {purchase.quantity} {purchase.unit}</span></div><div className="row-actions"><strong>{money.format(purchase.totalAmount)}</strong></div></article>)}
    </section>
  </div>
}
