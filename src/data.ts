import { supabase } from './supabase';
export interface User { id: number; firstName: string; lastName: string; email: string; company?: { name: string } | null; }
export interface Product { id: number; title: string; description?: string; category: string; price: number; stock: number; thumbnail: string; }
export interface Cart { id: number; userId: number; discountedTotal: number; totalQuantity: number; }
export interface Supplier { id: number; name: string; contactName: string; email: string; leadTimeDays: number; code?: string; phone?: string; website?: string; addressLine1?: string; addressLine2?: string; city?: string; postalCode?: string; country?: string; paymentTerms?: string; notes?: string; }
export interface InventoryLocation { id: number; name: string; code: string; address: string; type?: string; contactName?: string; email?: string; phone?: string; addressLine1?: string; addressLine2?: string; city?: string; postalCode?: string; country?: string; }
export interface PurchaseOrder { id: number; supplierId: number; locationId: number; status: 'Draft' | 'Ordered' | 'Received'; expectedDate: string; itemCount: number; }
export interface RestockAction { id: number; productId: number; supplierId: number; locationId: number; purchaseOrderId?: number; quantity: number; status: 'Planned' | 'Ordered' | 'Received'; createdAt: string; }
export interface Order { id: number; userId: number; revenue: number; expenses: number; date: Date; quantity: number; }
export type Resource = 'users' | 'products' | 'carts' | 'suppliers' | 'locations' | 'purchase_orders' | 'restock_actions';
const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const number = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const id = (value: unknown) => number(value) && Number.isSafeInteger(value) && value > 0;
export function validRecord(resource: Resource, value: unknown): boolean {
  if (!object(value) || !id(value.id)) return false;
  if (resource === 'users') return text(value.firstName) && text(value.lastName) && text(value.email)
    && (value.company == null || (object(value.company) && text(value.company.name)));
  if (resource === 'products') return text(value.title) && text(value.category) && number(value.price)
    && number(value.stock) && Number.isSafeInteger(value.stock) && typeof value.thumbnail === 'string'
    && (value.description == null || typeof value.description === 'string');
  if (resource === 'suppliers') return text(value.name) && text(value.contactName) && text(value.email) && number(value.leadTimeDays) && Number.isSafeInteger(value.leadTimeDays)
    && ['code','phone','website','addressLine1','addressLine2','city','postalCode','country','paymentTerms','notes'].every(key => value[key] == null || typeof value[key] === 'string');
  if (resource === 'locations') return text(value.name) && text(value.code) && text(value.address)
    && ['type','contactName','email','phone','addressLine1','addressLine2','city','postalCode','country'].every(key => value[key] == null || typeof value[key] === 'string');
  if (resource === 'purchase_orders') return id(value.supplierId) && id(value.locationId) && text(value.status) && text(value.expectedDate) && number(value.itemCount) && Number.isSafeInteger(value.itemCount);
  if (resource === 'restock_actions') return id(value.productId) && id(value.supplierId) && id(value.locationId) && number(value.quantity) && Number.isSafeInteger(value.quantity) && text(value.status) && text(value.createdAt) && (value.purchaseOrderId == null || id(value.purchaseOrderId));
  return id(value.userId) && number(value.discountedTotal) && number(value.totalQuantity) && Number.isSafeInteger(value.totalQuantity);
}
export async function getItems<T>(resource: Resource, signal?: AbortSignal): Promise<T[]> {
  if (!supabase) throw new Error('Supabase is not configured.');
  let request = supabase.from('forma_demo_records').select('payload').eq('resource', resource).order('id').limit(1000);
  if (signal) request = request.abortSignal(signal);
  const { data, error } = await request;
  if (error) throw new Error(`Could not load ${resource}. Check your access and try again.`);
  if (!Array.isArray(data) || data.some(row => !object(row) || !validRecord(resource, row.payload))) throw new Error(`Unexpected ${resource} response.`);
  return data.map(row => row.payload as T);
}
export async function createItem<T extends Record<string, unknown>>(resource: 'suppliers' | 'locations' | 'purchase_orders' | 'restock_actions', payload: T): Promise<T & {id:number}> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const {data: auth, error: authError} = await supabase.auth.getUser();
  if (authError || !auth.user) throw new Error('Your session has expired. Please sign in again.');
  const {data: rows, error: loadError} = await supabase.from('forma_demo_records').select('id').eq('resource',resource).order('id',{ascending:false}).limit(1);
  if (loadError) throw new Error(`Could not prepare ${resource}.`);
  const nextId = (rows?.[0]?.id ?? 0) + 1;
  const record = {...payload,id:nextId};
  const {error} = await supabase.from('forma_demo_records').insert({owner_id:auth.user.id,resource,id:nextId,payload:record});
  if (error) throw new Error(`Could not save ${resource.replaceAll('_',' ')}.`);
  return record;
}
const cents = (value: number) => Math.round(value * 100);
export function createOrders(carts: Cart[], anchor = new Date()): Order[] {
  return carts.map(cart => {
    const revenue = cents(cart.discountedTotal);
    const ratio = 70 + ((cart.id * 17) % 51);
    return { id: cart.id, userId: cart.userId, revenue: revenue / 100, expenses: Math.round(revenue * ratio / 100) / 100, quantity: cart.totalQuantity,
      date: new Date(anchor.getFullYear(), anchor.getMonth() - (cart.id % 6), 1 + ((cart.id * 7) % 28)) };
  });
}
export function summarize(orders: Order[]) {
  const revenue = orders.reduce((sum, o) => sum + cents(o.revenue), 0) / 100;
  const expenses = orders.reduce((sum, o) => sum + cents(o.expenses), 0) / 100;
  return { revenue, expenses, profit: (cents(revenue) - cents(expenses)) / 100 };
}
export function monthlyData(orders: Order[], anchor = new Date()) {
  return Array.from({ length: 6 }, (_, i) => {
    const date = new Date(anchor.getFullYear(), anchor.getMonth() - 5 + i, 1);
    return { month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), ...summarize(orders.filter(o => o.date.getMonth() === date.getMonth() && o.date.getFullYear() === date.getFullYear())) };
  });
}
export function pageItems<T>(items: T[], query: string, page: number, label: (item: T) => string, size = 10) {
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery ? items.filter(item => label(item).toLowerCase().includes(normalizedQuery)) : items;
  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const current = Math.min(Math.max(1, page), pages);
  return { items: filtered.slice((current - 1) * size, current * size), total: filtered.length, pages, current };
}
const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
export const money = (value: number) => currencyFormatter.format(value);
