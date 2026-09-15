import { useEffect, useRef } from 'react';
import { Package, X } from 'lucide-react';
import { money, summarize, type Order, type User } from './data';
import './order-details.css';
import { closeDialog } from './dialogMotion';

export function OrderDetails({ order, customer, onClose }: { order: Order; customer?: User; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const result = summarize([order]).profit;
  const status = order.id % 5 === 0 ? 'Processing' : 'Completed';
  useEffect(() => { const element = dialog.current!; element.showModal(); return () => element.close(); }, []);
  return <dialog ref={dialog} className="product-dialog order-dialog" aria-labelledby="order-title" onClose={() => { if (!dialog.current?.open) onClose(); }} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDialog(dialog);
  }}>
    <div className="product-detail-header"><span className="eyebrow">ORDER DETAILS</span><button autoFocus className="icon-button" aria-label="Close order details" onClick={() => closeDialog(dialog)}><X size={20}/></button></div>
    <div className="order-title"><span className="order-icon"><Package size={22}/></span><div><h2 id="order-title">Order #{String(order.id).padStart(4,'0')}</h2><p className="product-detail-id">Simulated sample order</p></div><span className={status === 'Completed' ? 'order-status completed' : 'order-status processing'}>{status}</span></div>
    <dl className="order-facts"><div><dt>Customer</dt><dd>{customer ? `${customer.firstName} ${customer.lastName}` : `Customer ID: ${order.userId}`}<small>{customer?.email}</small></dd></div><div><dt>Order date</dt><dd>{order.date.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</dd></div><div><dt>Items</dt><dd>{order.quantity}</dd></div><div><dt>Order total</dt><dd>{money(order.revenue)}</dd></div></dl>
    <section className="order-result"><span>Simulated order result</span><strong className={result < 0 ? 'loss' : 'profit'}>{result < 0 ? '−' : '+'}{money(Math.abs(result))}</strong><small>Revenue minus simulated expenses</small></section>
    <p className="muted">Read-only sample order · USD</p>
  </dialog>;
}
