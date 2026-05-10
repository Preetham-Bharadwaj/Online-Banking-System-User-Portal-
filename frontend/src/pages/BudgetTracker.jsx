import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertTriangle, TrendingUp, Home, Utensils, Car, Film } from 'lucide-react';

const data = [
  { name: 'Housing', value: 1960, color: '#0ea5e9' },
  { name: 'Food', value: 820, color: '#ef4444' },
  { name: 'Transport', value: 225, color: '#d97706' },
  { name: 'Other', value: 415, color: '#94a3b8' },
];

const BudgetTracker = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Budget Tracker</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor your monthly spending limits.</p>
        </div>
        <select className="btn-secondary outline-none">
          <option>October 2023</option>
          <option>September 2023</option>
        </select>
      </div>

      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
        <AlertTriangle size={20} className="text-red-500" />
        <span className="text-sm font-medium">Warning: Food budget at 82%</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex flex-col">
          <h3 className="font-bold text-slate-900 mb-6">Monthly Spending</h3>
          <div className="flex-1 flex items-center justify-center relative min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `$${value}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-sm text-slate-500">Total Spent</span>
              <span className="text-2xl font-bold text-slate-900">$3,420</span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {data.map(item => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-medium text-slate-900">{Math.round((item.value / 3420) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BudgetCard 
              title="Food & Dining" 
              icon={<Utensils size={20} className="text-red-500" />} 
              spent={820} 
              limit={1000} 
              color="bg-red-500" 
              bgColor="bg-red-50"
              alert
            />
            <BudgetCard 
              title="Housing" 
              icon={<Home size={20} className="text-blue-500" />} 
              spent={1960} 
              limit={2000} 
              color="bg-blue-600" 
              bgColor="bg-blue-50"
            />
            <BudgetCard 
              title="Transportation" 
              icon={<Car size={20} className="text-amber-600" />} 
              spent={225} 
              limit={500} 
              color="bg-amber-500" 
              bgColor="bg-amber-50"
            />
            <BudgetCard 
              title="Entertainment" 
              icon={<Film size={20} className="text-indigo-500" />} 
              spent={60} 
              limit={300} 
              color="bg-indigo-500" 
              bgColor="bg-indigo-50"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const BudgetCard = ({ title, icon, spent, limit, color, bgColor, alert }) => {
  const percent = Math.min((spent / limit) * 100, 100);
  
  return (
    <div className={`glass-card p-5 ${alert ? 'border-red-200 bg-red-50/30' : ''} relative overflow-hidden`}>
      {alert && <div className="absolute top-0 right-0 w-0 h-0 border-l-[30px] border-l-transparent border-t-[30px] border-t-red-200 flex items-start justify-end">
        <AlertTriangle size={10} className="text-red-500 absolute top-[-25px] right-[4px]" />
      </div>}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <h4 className="font-medium text-slate-900">{title}</h4>
          {alert && <p className="text-xs text-red-500 font-medium">{Math.round(percent)}% of limit</p>}
        </div>
      </div>
      <div className="flex justify-between items-end mb-2 text-sm">
        <span className="font-bold text-lg text-slate-900">${spent}</span>
        <span className="text-slate-500">/ ${limit}</span>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}

export default BudgetTracker;
