import { useState } from 'react';
import { ArrowRight, Search, CheckCircle2 } from 'lucide-react';

const beneficiaries = [
  { id: 1, name: 'Sarah Jenkins', account: '**** 4592', initials: 'SJ', color: 'bg-blue-600' },
  { id: 2, name: 'Michael Wong', account: '**** 8104', initials: 'MW', color: 'bg-slate-400' },
  { id: 3, name: 'Emma Davis', account: '**** 2219', initials: 'ED', color: 'bg-emerald-500' },
];

const Transfers = () => {
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(1);
  const [amount, setAmount] = useState('1500.00');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Transfer Funds</h1>
        <p className="text-slate-500 text-sm mt-1">Initiate a secure transfer to a saved beneficiary or a new recipient.</p>
      </div>

      <div className="glass-card p-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-10 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-100 -z-10"></div>
          
          <div className="flex flex-col items-center gap-2 bg-white px-2">
            <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-primary-200">1</div>
            <span className="text-xs font-medium text-primary-600">Details</span>
          </div>
          <div className="flex flex-col items-center gap-2 bg-white px-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-sm font-bold">2</div>
            <span className="text-xs font-medium text-slate-500">Review</span>
          </div>
          <div className="flex flex-col items-center gap-2 bg-white px-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-sm font-bold">3</div>
            <span className="text-xs font-medium text-slate-500">Verify</span>
          </div>
          <div className="flex flex-col items-center gap-2 bg-white px-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-sm font-bold">4</div>
            <span className="text-xs font-medium text-slate-500">Done</span>
          </div>
        </div>

        <form className="space-y-8">
          {/* Transfer Mode */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-3">Transfer Mode</label>
            <div className="flex gap-3">
              {['IMPS', 'NEFT', 'RTGS', 'UPI'].map((mode, i) => (
                <button
                  key={mode}
                  type="button"
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    i === 0 
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-200' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">Instant transfer up to $5,000. Available 24/7.</p>
          </div>

          {/* Beneficiary Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-900">Select Beneficiary</label>
              <button type="button" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
                + Add New
              </button>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search saved beneficiaries..." 
                className="input-field pl-9 text-sm py-2.5"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {beneficiaries.slice(0, 2).map((b) => (
                <div 
                  key={b.id}
                  onClick={() => setSelectedBeneficiary(b.id)}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedBeneficiary === b.id 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm ${b.color}`}>
                      {b.initials}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{b.name}</p>
                      <p className="text-xs text-slate-500">{b.account}</p>
                    </div>
                  </div>
                  {selectedBeneficiary === b.id && (
                    <CheckCircle2 size={20} className="absolute top-1/2 right-4 -translate-y-1/2 text-primary-600" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Amount & Remarks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Amount ($)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-slate-900">$</span>
                <input 
                  type="text" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-field pl-8 font-medium text-lg"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">Available Balance: <span className="font-medium text-slate-900">$12,450.00</span></p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Remarks (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. Rent, Consulting Fee" 
                defaultValue="Consulting Fees"
                className="input-field"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" className="btn-secondary px-6">Cancel</button>
            <button type="button" className="btn-primary px-8 flex items-center gap-2">
              Continue <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Transfers;
