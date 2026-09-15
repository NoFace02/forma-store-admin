import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { money, type Product } from './data';
import { ProductImage } from './ProductImage';
import { closeDialog } from './dialogMotion';

export function ProductDetails({ product, onClose }: { product: Product; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    return () => element.close();
  }, []);

  return <dialog ref={dialog} className="product-dialog" aria-labelledby="product-title" onClose={() => { if (!dialog.current?.open) onClose(); }} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDialog(dialog);
  }}>
    <div className="product-detail-header"><span className="eyebrow">PRODUCT DETAILS</span><button autoFocus className="icon-button" aria-label="Close product details" onClick={() => closeDialog(dialog)}><X size={20}/></button></div>
    <ProductImage className="product-detail-image" src={product.thumbnail} alt={product.title}/>
    <h2 id="product-title">{product.title}</h2>
    <p className="product-detail-id">Product ID: {product.id}</p>
    <p className="product-description">{product.description?.trim() || 'No description is available for this sample product.'}</p>
    <dl className="product-facts">
      <div><dt>Price</dt><dd>{money(product.price)}</dd></div>
      <div><dt>Category</dt><dd className="product-category">{product.category.replaceAll('-', ' ')}</dd></div>
      <div><dt>Stock</dt><dd className={product.stock === 0 ? 'stock out' : product.stock < 10 ? 'stock low' : 'stock'}>{product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}</dd></div>
    </dl>
    <p className="muted">Read-only sample product · USD</p>
  </dialog>;
}
