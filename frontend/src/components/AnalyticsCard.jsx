import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

const AnalyticsCard = ({ data, title, subtitle, value, trend }) => (
  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6 group hover:shadow-xl hover:shadow-slate-100 transition-all">
    <div className="flex justify-between items-center">
      <div className="space-y-1">
        <h3 className="font-bold text-slate-900">{title}</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subtitle}</p>
      </div>
      <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-primary-600 group-hover:text-white transition-all">
        <PieChartIcon size={20} />
      </div>
    </div>
    <div className="h-52 w-full relative">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
          <Tooltip 
            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
            itemStyle={{ fontWeight: '900', fontSize: '14px', color: '#1e293b' }}
            labelStyle={{ fontWeight: 'bold', color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div className="flex justify-between items-end pt-4 border-t border-slate-50">
       <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total</p>
          <p className="text-2xl font-black text-slate-900">{value}</p>
       </div>
       <div className="text-right">
          <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {trend}
          </span>
       </div>
    </div>
  </div>
);

export default AnalyticsCard;
