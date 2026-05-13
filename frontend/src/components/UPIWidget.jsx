import { QrCode } from 'lucide-react';

const UPIWidget = ({ upiId = 'upi pending' }) => (
  <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-6 text-white shadow-xl shadow-primary-100 relative overflow-hidden group h-full flex flex-col justify-between">
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
    
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-[10px] text-primary-100 font-bold uppercase tracking-widest mb-1 opacity-80">Personal UPI ID</p>
        <p className="text-xl font-black tracking-tight">{upiId}</p>
      </div>
      <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/10 group-hover:rotate-6 transition-transform">
        <QrCode size={24} />
      </div>
    </div>

    <div className="mt-8 flex gap-3 relative z-10">
      <button className="flex-1 bg-white text-primary-700 font-black py-3.5 rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-wider">
        Scan & Pay
      </button>
      <button className="flex-1 bg-primary-500/50 backdrop-blur-md border border-white/20 text-white font-bold py-3.5 rounded-2xl active:scale-95 transition-all text-xs uppercase tracking-wider hover:bg-primary-500/70">
        Receive
      </button>
    </div>
  </div>
);

export default UPIWidget;
