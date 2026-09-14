import { supabase } from './supabase';
export interface User { id: number; firstName: string; lastName: string; email: string; company: { name: string }; }
export interface Product { id: number; title: string; category: string; price: number; stock: number; thumbnail: string; }
export interface Cart { id: number; userId: number; discountedTotal: number; totalQuantity: number; }
export interface Order { id: number; userId: number; revenue: number; expenses: number; date: Date; quantity: number; }
export async function getItems<T>(resource: 'users' | 'products' | 'carts', signal?: AbortSignal): Promise<T[]> {
  if (!supabase) throw new Error('Supabase is not configured.');
  let request = supabase.from('forma_demo_records').select('payload').eq('resource', resource).order('id').limit(1000);
  if (signal) request = request.abortSignal(signal);
  const { data, error } = await request;
  if (error) throw new Error(`Could not load ${resource}. Check your access and try again.`);
  if (!Array.isArray(data) || data.some(row => !row.payload || typeof row.payload !== 'object')) throw new Error(`Unexpected ${resource} response.`);
  return data.map(row => row.payload as T);
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
  const filtered = items.filter(item => label(item).toLowerCase().includes(query.trim().toLowerCase()));
  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const current = Math.min(Math.max(1, page), pages);
  return { items: filtered.slice((current - 1) * size, current * size), total: filtered.length, pages, current };
}
export const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
