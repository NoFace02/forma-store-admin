import { useEffect, useMemo, useRef } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { createOrders, money, summarize, type Cart, type User } from './data';
import './customer-details.css';
import { closeDialog } from './dialogMotion';

export function CustomerDetails({ customer, carts, onClose }: { customer: User; carts: Cart[]; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const orders = useMemo(() => createOrders(carts).filter(order => order.userId === customer.id).sort((a,b) => b.date.getTime() - a.date.getTime()),[carts,customer.id]);
  const totals = summarize(orders);
  useEffect(() => { const element = dialog.current!; element.showModal(); return () => element.close(); },[]);
  return <dialog ref={dialog} className="product-dialog customer-dialog" aria-labelledby="customer-title" onClose={() => { if (!dialog.current?.open) onClose(); }} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDialog(dialog);
  }}>
    <div className="product-detail-header"><span className="eyebrow">CUSTOMER PROFILE</span><button autoFocus className="icon-button" aria-label="Close customer details" onClick={() => closeDialog(dialog)}><X size={20}/></button></div>
    <div className="customer-profile"><span className="customer-profile-avatar">{customer.firstName[0]}{customer.lastName[0]}</span><div><h2 id="customer-title">{customer.firstName} {customer.lastName}</h2><p className="product-detail-id">Customer ID: {customer.id}</p></div></div>
    <dl className="customer-contact"><div><dt>Email</dt><dd>{customer.email}</dd></div><div><dt>Company</dt><dd>{customer.company?.name ?? '—'}</dd></div></dl>
    <section className="customer-summary" aria-label="Customer order summary"><div><span>Orders</span><strong>{orders.length}</strong></div><div><span>Total spent</span><strong>{money(totals.revenue)}</strong></div></section>
    <section className="customer-orders"><div className="customer-orders-heading"><div><h3>Order history</h3><p className="muted">Sample orders from this customer</p></div><ShoppingBag size={18}/></div>{orders.length ? <div className="customer-order-list">{orders.map(order => <div key={order.id}><span><strong>#{String(order.id).padStart(4,'0')}</strong><small>{order.date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})} · {order.quantity} items</small></span><strong>{money(order.revenue)}</strong></div>)}</div> : <p className="muted customer-empty">No sample orders for this customer yet.</p>}</section>
    <p className="muted">Read-only sample customer · USD</p>
  </dialog>;
}
