import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { getBusinessSettings, type BusinessSettings } from '../lib/settings'
import { listProducts, type Product } from '../lib/products'
import { createPurchase, listPurchases, type Purchase } from '../lib/purchases'

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })

export function Purchases() {
  const [products, setProducts] = useState<Product[]>([]); const [purchases, setPurchases] = useState<Purchase[]>([]); const [business, setBusiness] = useState<BusinessSettings | null>(null)
  const [supplierName, setSupplierName] = useState(''); const [supplierState, setSupplierState] = useState(''); const [productId, setProductId] = useState(''); const [quantity, setQuantity] = useState('1'); const [unitPrice, setUnitPrice] = useState(''); const [gstRate, setGstRate] = useState('0')
  const [printPurchaseId, setPrintPurchaseId] = useState<string | null>(null); const [sharingPurchaseId, setSharingPurchaseId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [success, setSuccess] = useState('')
  const selectedProduct = useMemo(() => products.find((product) => product.id === productId), [products, productId]); const subtotal = (Number(quantity) || 0) * (Number(unitPrice) || 0); const estimatedTax = subtotal * (Number(gstRate) || 0) / 100; const total = subtotal + estimatedTax
  const gstType = Number(gstRate) <= 0 ? 'none' : business?.state && supplierState && business.state.trim().toLowerCase() === supplierState.trim().toLowerCase() ? 'cgst_sgst' : 'igst'
  const printPurchase = useMemo(() => purchases.find((purchase) => purchase.id === printPurchaseId) ?? null, [purchases, printPurchaseId])
  const sharingPurchase = useMemo(() => purchases.find((purchase) => purchase.id === sharingPurchaseId) ?? null, [purchases, sharingPurchaseId])

  async function load() { setLoading(true); setError(''); try { const [productData, purchaseData, settingsData] = await Promise.all([listProducts(), listPurchases(), getBusinessSettings()]); setProducts(productData.filter((item) => item.isActive)); setPurchases(purchaseData); setBusiness(settingsData); setGstRate(String(settingsData.defaultGstRate)) } catch (errorValue) { setError(errorValue instanceof Error ? errorValue.message : 'Unable to load purchases.') } finally { setLoading(false) } }
  useEffect(() => { void load() }, [])
  function handleProductChange(id: string) { setProductId(id); const product = products.find((item) => item.id === id); setUnitPrice(product ? String(product.purchasePrice) : '') }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(''); setSuccess(''); setBusy(true); try { const purchase = await createPurchase({ supplierName: supplierName.trim(), supplierState: supplierState.trim(), productId, quantity: Number(quantity), unitPrice: Number(unitPrice), gstRate: Number(gstRate) }); setPurchases((current) => [purchase, ...current]); setSuccess(`Purchase saved as ${purchase.purchaseNumber}.`); setSupplierName(''); setSupplierState(''); setProductId(''); setQuantity('1'); setUnitPrice('') } catch (errorValue) { setError(errorValue instanceof Error ? errorValue.message : 'Unable to save purchase.') } finally { setBusy(false) } }
  function printPurchaseDocument(purchaseId: string) { setPrintPurchaseId(purchaseId); setSharingPurchaseId(null); setTimeout(() => window.print(), 100) }
  async function sharePurchase(purchaseId: string) {
    const purchase = purchases.find((item) => item.id === purchaseId)
    if (!purchase) return
    const lines = [business?.businessName ?? 'Paul Bricks & Blocks', `Purchase: ${purchase.purchaseNumber}`, `Date: ${new Date(purchase.createdAt).toLocaleDateString('en-IN')}`, `Supplier: ${purchase.supplierName}`, `Product: ${purchase.productName}`, `Quantity: ${purchase.quantity} ${purchase.unit}`, `Subtotal: ${money.format(purchase.subtotal)}`]
    if (purchase.gstType === 'cgst_sgst') lines.push(`CGST: ${money.format(purchase.cgstAmount)}`, `SGST: ${money.format(purchase.sgstAmount)}`)
    if (purchase.gstType === 'igst') lines.push(`IGST: ${money.format(purchase.igstAmount)}`)
    lines.push(`GST: ${money.format(purchase.taxAmount)}`, `Total: ${money.format(purchase.totalAmount)}`)
    const text = lines.join('\n')
    setSharingPurchaseId(purchaseId); setError(''); setSuccess('')
    try {
      if (navigator.share) { await navigator.share({ title: `Purchase ${purchase.purchaseNumber}`, text }); setSuccess('Purchase details shared successfully.') }
      else if (navigator.clipboard) { await navigator.clipboard.writeText(text); setSuccess('Purchase details copied. You can paste them into WhatsApp or another app.') }
      else setSuccess('Sharing is not available on this device. Use Print purchase and save as PDF.')
    } catch (errorValue) {
      if (errorValue instanceof DOMException && errorValue.name === 'AbortError') return
      setError('Unable to share the purchase. You can still use Print purchase.')
    } finally { setSharingPurchaseId(null) }
  }

  return <div className="purchases-page"><section className="page-heading"><p className="eyebrow">Money</p><h2>Purchases</h2><p>Record materials bought from a supplier, including purchase GST when applicable.</p></section><section className="form-card"><h3>New purchase</h3><form className="customer-form" onSubmit={handleSubmit}>
    <label>Supplier name<input value={supplierName} onChange={(event) => setSupplierName(event.target.value)} placeholder="Example: ABC Bricks Supplier" required /></label>
    <label>Supplier state<input value={supplierState} onChange={(event) => setSupplierState(event.target.value)} placeholder="Example: Karnataka" /><span className="field-hint">Used to decide CGST + SGST or IGST. Leave blank only when state is unavailable.</span></label>
    <label>Product<select value={productId} onChange={(event) => handleProductChange(event.target.value)} required><option value="">Choose product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} — {money.format(product.purchasePrice)}/{product.unit}</option>)}</select></label>
    {selectedProduct && <p className="field-hint">Purchase price: {money.format(selectedProduct.purchasePrice)} per {selectedProduct.unit}. You can change it for this purchase.</p>}
    <label>Quantity<input type="number" min="0.01" step="0.01" value={quantity} onChange={(event) => setQuantity(event.target.value)} required /></label>
    <label>Price per unit<input type="number" min="0" step="0.01" value={unitPrice} onChange={(event) => setUnitPrice(event.target.value)} required /></label>
    <label>GST rate (%)<input type="number" min="0" max="28" step="0.01" value={gstRate} onChange={(event) => setGstRate(event.target.value)} /><span className="field-hint">Business default: {business?.defaultGstRate ?? 0}%. Use the applicable rate for this purchase.</span></label>
    <div className="sale-total"><span>Subtotal</span><strong>{money.format(subtotal)}</strong><span>{gstType === 'cgst_sgst' ? 'CGST + SGST' : gstType === 'igst' ? 'IGST' : 'GST'}</span><strong>{money.format(estimatedTax)}</strong><span>Total</span><strong>{money.format(total)}</strong></div>
    {error && <p className="error-text" role="alert">{error}</p>}{success && <p className="success-text" role="status">{success}</p>}<div className="form-actions"><Button variant="primary" type="submit" disabled={busy || loading}>{busy ? 'Saving…' : 'Save purchase'}</Button></div>
  </form></section><section className="user-list"><div className="list-heading"><h3>Recent purchases</h3><Button variant="secondary" onClick={() => void load()} disabled={loading}>Refresh</Button></div>{loading ? <p>Loading purchases…</p> : purchases.length === 0 ? <p>No purchases yet.</p> : purchases.map((purchase) => <article className="user-row sale-row" key={purchase.id}><div><strong>{purchase.purchaseNumber}</strong><span>{purchase.supplierName} · {purchase.productName} · {purchase.quantity} {purchase.unit}</span><span>{purchase.gstType === 'cgst_sgst' ? `CGST ${money.format(purchase.cgstAmount)} · SGST ${money.format(purchase.sgstAmount)}` : purchase.gstType === 'igst' ? `IGST ${money.format(purchase.igstAmount)}` : 'No GST'} · Total {money.format(purchase.totalAmount)}</span></div><div className="row-actions"><strong>{money.format(purchase.totalAmount)}</strong><Button variant="secondary" type="button" onClick={() => printPurchaseDocument(purchase.id)}>Print purchase</Button><Button variant="secondary" type="button" onClick={() => void sharePurchase(purchase.id)} disabled={sharingPurchaseId === purchase.id}>{sharingPurchaseId === purchase.id ? 'Sharing…' : 'Share purchase'}</Button></div></article>)}</section>
    {printPurchase && <section className="print-invoice" aria-label="Purchase document">
      <div className="invoice-header"><div><h1>{business?.businessName ?? 'Paul Bricks & Blocks'}</h1>{business?.address && <p>{business.address}</p>}{business?.phone && <p>Phone: {business.phone}</p>}{business?.gstNumber && <p>GST: {business.gstNumber}</p>}</div><div className="invoice-meta"><strong>PURCHASE</strong><span>{printPurchase.purchaseNumber}</span><span>{new Date(printPurchase.createdAt).toLocaleDateString('en-IN')}</span></div></div>
      <div className="invoice-customer"><strong>Supplier</strong><span>{printPurchase.supplierName}</span>{printPurchase.supplierState && <span>State: {printPurchase.supplierState}</span>}</div>
      <table className="invoice-table"><thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody><tr><td>{printPurchase.productName}</td><td>{printPurchase.quantity} {printPurchase.unit}</td><td>{money.format(printPurchase.unitPrice)}</td><td>{money.format(printPurchase.subtotal)}</td></tr></tbody></table>
      <div className="invoice-total"><span>Subtotal</span><strong>{money.format(printPurchase.subtotal)}</strong>{printPurchase.gstType === 'cgst_sgst' ? <><span>CGST</span><strong>{money.format(printPurchase.cgstAmount)}</strong><span>SGST</span><strong>{money.format(printPurchase.sgstAmount)}</strong></> : printPurchase.gstType === 'igst' ? <><span>IGST</span><strong>{money.format(printPurchase.igstAmount)}</strong></> : <><span>GST</span><strong>{money.format(printPurchase.taxAmount)}</strong></>}<span>Total</span><strong>{money.format(printPurchase.totalAmount)}</strong></div>
      <p className="invoice-note">Purchase record for business accounts.</p>
    </section>}
    {sharingPurchase && <section className="share-preview" aria-label="Purchase sharing preview"><h3>Purchase ready to share</h3><p>{sharingPurchase.purchaseNumber} · {sharingPurchase.supplierName} · {money.format(sharingPurchase.totalAmount)}</p><p className="field-hint">On phones with sharing support, your normal share menu will open. Otherwise the purchase details are copied for easy pasting.</p></section>}
  </div>
}
