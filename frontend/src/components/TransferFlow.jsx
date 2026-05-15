import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Search, 
  ArrowRight, 
  User, 
  Hash, 
  Building2, 
  CheckCircle2, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import useStore from '../store/useStore';
import authService from '../services/authService';
import { bankingService } from '../services/bankingService';

const TransferFlow = ({ isOpen, onClose }) => {
  const { platformUsers, user: currentUser, balance, setBankingData } = useStore();
  const [step, setStep] = useState(1); 
  const [method, setMethod] = useState(null); 
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);

  const displayContacts = searchQuery.length > 1 ? searchResults : platformUsers.slice(0, 5);

  const handleTransfer = async () => {
    if (!selectedRecipient || !amount || !pin) return;
    
    setLoading(true);
    setError(null);

    // Frontend balance check
    if (parseFloat(amount) > balance) {
      setError("Insufficient balance");
      setLoading(false);
      return;
    }

    try {

      const response = await bankingService.upiTransfer({
        receiverUpi: selectedRecipient.upi_id,
        amount: parseFloat(amount),
        pin: pin,
        note: note
      });

      if (response.success || response.id) {
        // Success
        const updatedData = await bankingService.getDashboardData();
        setBankingData(updatedData);
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Transfer failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 2) {
      setIsSearching(true);
      try {
        const users = await authService.searchUsers(query);
        setSearchResults(users);
      } catch (err) {
        console.error("Modal search failed:", err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };


  const resetFlow = () => {
    setStep(1);
    setMethod(null);
    setAmount('');
    setNote('');
    setSearchQuery('');
  };

  const handleClose = () => {
    resetFlow();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            className="fixed bottom-0 left-0 right-0 lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:bottom-auto lg:max-w-xl w-full bg-white lg:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl z-[101] overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {step > 1 && (
                  <button onClick={() => setStep(step - 1)} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
                    <ArrowLeft size={20} />
                  </button>
                )}
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {step === 1 ? 'Transfer Money' : step === 2 ? 'Enter Details' : 'Transfer Successful'}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    {step === 1 ? 'Choose how you want to pay' : step === 2 ? 'Set amount and message' : 'Transaction completed'}
                  </p>
                </div>
              </div>
              <button onClick={handleClose} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {step === 1 && (
                <>
                  {/* Search */}
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search contacts, UPI ID or account..." 
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 text-sm font-bold text-slate-900 outline-none transition-all"
                    />
                  </div>

                  {/* Transfer Methods */}
                  {!searchQuery && (
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => { setMethod('upi'); setStep(2); }}
                        className="p-5 bg-white border border-slate-200 rounded-[2rem] hover:border-primary-200 hover:bg-primary-50/30 transition-all group text-left space-y-4"
                      >
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Hash size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase tracking-widest">UPI ID</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">Pay via VPA</p>
                        </div>
                      </button>
                      <button 
                        onClick={() => { setMethod('bank'); setStep(2); }}
                        className="p-5 bg-white border border-slate-200 rounded-[2rem] hover:border-primary-200 hover:bg-primary-50/30 transition-all group text-left space-y-4"
                      >
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Bank Account</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">NEFT/IMPS/RTGS</p>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Contacts */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{searchQuery ? 'Search Results' : 'Recent Contacts'}</h4>
                    <div className="space-y-2">
                      {displayContacts.map(contact => (
                        <div 
                          key={contact.id}
                          onClick={() => { 
                            setMethod('contact'); 
                            setSelectedRecipient(contact);
                            setStep(2); 
                          }}
                          className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-primary-200 hover:bg-slate-50 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-sm group-hover:scale-110 transition-transform`}>
                              {(contact.full_name || 'U').substring(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900">{contact.full_name}</p>
                              <p className="text-[11px] font-bold text-slate-400">{contact.upi_id}</p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-primary-600" />
                        </div>
                      ))}
                      {searchQuery && displayContacts.length === 0 && !isSearching && (
                        <p className="text-center text-[10px] font-bold text-slate-400 uppercase py-4">No users found</p>
                      )}
                    </div>
                  </div>

                </>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  {/* Amount Input */}
                  <div className="text-center space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount to Transfer</p>
                    <div className="relative flex items-center justify-center">
                      <span className="text-2xl font-black text-slate-400 mr-2">₹</span>
                      <input 
                        type="number" 
                        autoFocus
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="text-5xl font-black text-slate-900 w-full max-w-[200px] text-center outline-none bg-transparent placeholder:text-slate-100"
                      />
                    </div>
                    <div className="h-px w-32 bg-slate-100 mx-auto" />
                    <p className="text-[11px] font-bold text-slate-400">Available: <span className="text-slate-900">₹{Number(balance || 0).toLocaleString()}</span></p>
                  </div>

                  {/* Note Input */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Add a note (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="What is this for?" 
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 text-sm font-bold text-slate-900 outline-none transition-all"
                    />
                  </div>

                  {/* Summary */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sending to</span>
                      <span className="text-xs font-black text-slate-900">{selectedRecipient?.full_name || 'Recipient'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</span>
                      <span className="text-xs font-black text-indigo-600 uppercase">UPI Transfer</span>
                    </div>
                  </div>

                  {/* PIN Input for Step 2 */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enter 6-digit UPI PIN</label>
                    <input 
                      type="password" 
                      maxLength={6}
                      placeholder="••••••" 
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-2xl tracking-[1em] font-black text-slate-900 outline-none focus:bg-white focus:border-primary-500 transition-all"
                    />
                  </div>

                  {error && (
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 text-[11px] font-bold text-center">
                      {error}
                    </div>
                  )}

                  <button 
                    onClick={handleTransfer}
                    disabled={loading || !amount || !pin || pin.length < 4}
                    className="w-full py-5 bg-primary-600 text-white rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.2em] shadow-xl shadow-primary-200 hover:bg-primary-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-3 mt-4"
                  >
                    {loading ? 'Processing...' : 'Confirm Transfer'}
                    {!loading && <ArrowRight size={18} />}
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="py-10 text-center space-y-8">
                  <div className="relative">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 12 }}
                      className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-100/50"
                    >
                      <CheckCircle2 size={48} />
                    </motion.div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight">₹{parseFloat(amount).toLocaleString()} Sent!</h4>
                    <p className="text-sm font-bold text-slate-500">Successfully transferred to {selectedRecipient?.full_name}</p>
                  </div>


                  <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">Transaction ID</span>
                      <span className="text-slate-900">#VTX-293847102</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">Date & Time</span>
                      <span className="text-slate-900">{new Date().toLocaleString()}</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleClose}
                    className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-black transition-all"
                  >
                    Back to Dashboard
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TransferFlow;
