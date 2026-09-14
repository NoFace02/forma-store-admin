import { afterEach, describe, expect, it, vi } from 'vitest';
import {createOrders,getItems,monthlyData,pageItems,summarize} from './data';
const anchor = new Date(2026,0,14);
const database = vi.hoisted(() => ({from: vi.fn(),select: vi.fn(),eq: vi.fn(),order: vi.fn(),limit: vi.fn(),abortSignal: vi.fn()}));
vi.mock('./supabase', () => ({supabase: database}));
const carts = Array.from({length:40},(_,i) => ({id:i+1,userId:i+1,discountedTotal:100.13+i,totalQuantity:3}));
afterEach(() => vi.unstubAllGlobals());
describe('sample finances',() => {
 it('produces stable dates and expenses across six months, including year boundaries',() => {
  const orders = createOrders(carts,anchor); expect(orders).toEqual(createOrders(carts,anchor));
  expect(new Set(orders.map(o => `${o.date.getFullYear()}-${o.date.getMonth()}`)).size).toBe(6);
  for(const o of orders) {expect(o.expenses).toBeGreaterThanOrEqual(o.revenue*.7-.01);expect(o.expenses).toBeLessThanOrEqual(o.revenue*1.2+.01);}
  expect(orders.some(o=>o.expenses>o.revenue)).toBe(true);expect(orders.some(o=>o.expenses<o.revenue)).toBe(true);
 });
 it('keeps chart, order, and overall totals consistent to the cent',() => {
  const orders=createOrders(carts,anchor), totals=summarize(orders), months=monthlyData(orders,anchor);
  expect(Math.round(months.reduce((s,m)=>s+m.revenue,0)*100)).toBe(Math.round(totals.revenue*100));
  expect(Math.round(months.reduce((s,m)=>s+m.expenses,0)*100)).toBe(Math.round(totals.expenses*100));
  expect(Math.round(totals.profit*100)).toBe(Math.round(totals.revenue*100)-Math.round(totals.expenses*100));
  expect(summarize([])).toEqual({revenue:0,expenses:0,profit:0});
 });
});
it('searches without case sensitivity and handles pages and empty results',() => {
 const items=Array.from({length:25},(_,i)=>`Customer ${i}`);
 expect(pageItems(items,' CUSTOMER ',2,s=>s).items).toHaveLength(10);
 expect(pageItems(items,'',3,s=>s).items).toHaveLength(5);
 expect(pageItems(items,'missing',9,s=>s)).toEqual({items:[],total:0,pages:1,current:1});
});
it('reports HTTP and unexpected API responses and forwards cancellation',async() => {
 database.from.mockReturnValue(database); database.select.mockReturnValue(database); database.eq.mockReturnValue(database); database.order.mockReturnValue(database);
 database.limit.mockResolvedValue({error: {message:'denied'},data:null});
 await expect(getItems('users')).rejects.toThrow('Could not load users');
 database.limit.mockResolvedValue({error:null,data:null});
 await expect(getItems('users')).rejects.toThrow('Unexpected users response');
 const signal=new AbortController().signal; database.limit.mockReturnValue(database); database.abortSignal.mockResolvedValue({error:null,data:[{payload:{id:1}}]});
 expect(await getItems('users',signal)).toEqual([{id:1}]);
 expect(database.from).toHaveBeenLastCalledWith('forma_demo_records');
 expect(database.eq).toHaveBeenLastCalledWith('resource','users');
 expect(database.abortSignal).toHaveBeenLastCalledWith(signal);
});
