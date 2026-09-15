import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { money, monthlyData } from './data';

export default function FinancialChart({months}: {months: ReturnType<typeof monthlyData>}) {
  return <ResponsiveContainer width="100%" height="100%"><AreaChart data={months} margin={{top:10,right:15,left:5,bottom:0}}><defs><linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7060df" stopOpacity={0.18}/><stop offset="100%" stopColor="#7060df" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} stroke="#eef0f5"/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize:12,fill:'#8b91a3'}} dy={10}/><YAxis axisLine={false} tickLine={false} tick={{fontSize:12,fill:'#8b91a3'}} tickFormatter={v => `$${(v/1000).toFixed(0)}k`}/><Tooltip formatter={v => money(Number(v))}/><Area name="Revenue" type="monotone" dataKey="revenue" stroke="#7060df" strokeWidth={3} fill="url(#revenue)"/><Area name="Expenses" type="monotone" dataKey="expenses" stroke="#eda870" strokeWidth={2} strokeDasharray="5 5" fill="transparent"/></AreaChart></ResponsiveContainer>;
}
