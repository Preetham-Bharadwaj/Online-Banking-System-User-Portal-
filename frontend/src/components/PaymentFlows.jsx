import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  ArrowRight,
  Building2,
  Smartphone,
  Zap,
  Receipt,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Users,
  Plus,
  RefreshCcw,
  Calendar,
  ArrowLeftRight,
  TrendingDown,
  TrendingUp,
  Flame,
  Droplet,
  Tv,
  Wifi,
  Car,
  Check,
  AlertCircle
} from 'lucide-react';

import useStore from '../store/useStore';
import { bankingService } from '../services/bankingService';
import authService from '../services/authService';
import { supabase } from '../utils/supabaseClient';

const PaymentFlows = ({ isOpen, onClose, activeFlow, initialData }) => {
  const { beneficiaries, accounts, balance, user, setBankingData, platformUsers } = useStore();

  const [step, setStep] = useState(1); // 1: Input/Form, 2: Amount/Plan, 3: Success, 4: PIN Verification
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  
  // Custom states for rich actions
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [upiPin, setUpiPin] = useState('');
  const [error, setError] = useState(null);
  
  // Split states
  const [splitGroup, setSplitGroup] = useState([]);
  const [splitAmount, setSplitAmount] = useState('');
  const [splitName, setSplitName] = useState('');

  // Auto populate initial recipient if passed
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData({});
      setSearchQuery('');
      setUpiPin('');
      setError(null);
      setSplitGroup([]);
      setSplitAmount('');
      setSplitName('');

      if (initialData) {
        if (initialData.upi_id || initialData.upi) {
          const upi = initialData.upi_id || initialData.upi;
          setSearchQuery(upi);
          setFormData({ upi, name: initialData.full_name || initialData.beneficiary_name || initialData.name });
          setStep(2); // Skip straight to amount
        }
      }
    }
  }, [isOpen, initialData, activeFlow]);

  // Global database search
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 2) {
      setSearching(true);
      try {
        const [trieResult, usersList] = await Promise.all([
          bankingService.getAutocomplete(query).catch(() => ({ data: [] })),
          authService.searchUsers(query)
        ]);
        
        const trieSuggestions = (trieResult?.data || []).map(s => ({
          id: s.id,
          full_name: s.name,
          upi_id: s.upi,
          _source: 'trie'
        }));

        const trieUpis = new Set(trieSuggestions.map(s => s.upi_id));
        const merged = [
          ...trieSuggestions,
          ...usersList.filter(u => !trieUpis.has(u.upi_id))
        ];
        setSearchResults(merged);
      } catch (err) {
        console.error("Discovery failed:", err);
      } finally {
        setSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const resetFlow = () => {
    setStep(1);
    setFormData({});
    setSearchQuery('');
    setUpiPin('');
    setError(null);
    setSplitGroup([]);
    setSplitAmount('');
    setSplitName('');
    onClose();
  };

  const handleUpiPinVerifyAndSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. PIN verification call
      await bankingService.verifyPin(upiPin);
      
      // 2. Perform transaction based on active flow type
      if (activeFlow === 'UPI ID / Phone' || activeFlow === 'To Mobile / UPI') {
        const receiverUpi = formData.upi;
        const txAmount = parseFloat(formData.amount);
        
        await bankingService.upiTransfer({
          receiverUpi,
          amount: txAmount,
          pin: upiPin,
          note: formData.note || 'UPI Transfer'
        });

      } else if (activeFlow === 'Bank Transfer' || activeFlow === 'To Bank Account') {
        const fromAccountId = accounts[0]?.id;
        if (!fromAccountId) throw new Error("No source account found.");

        await bankingService.initiateTransfer({
          fromAccountId,
          toAccountDetails: {
            name: formData.name,
            account_number: formData.acc,
            ifsc: formData.ifsc,
            upi: formData.upi || `${formData.acc}@bank`
          },
          amount: parseFloat(formData.amount),
          type: 'Bank Transfer',
          note: formData.note || 'Bank Transfer',
          category: 'Transfer'
        });

      } else if (activeFlow === 'To Self Account') {
        // Mock transfer from Savings to Current or vice versa
        // Let's deduct from balance using deposit/withdraw endpoints or mock successfully
        const fromAccountId = accounts[0]?.id;
        await bankingService.initiateTransfer({
          fromAccountId,
          toAccountDetails: {
            name: `Self Transfer (${formData.destAccountType || 'Current'})`,
            account_number: formData.destAccountNo || '10992384758',
            ifsc: 'FNVA0001923'
          },
          amount: parseFloat(formData.amount),
          type: 'Self Account Transfer',
          note: formData.note || 'Internal Transfer',
          category: 'Self'
        });

      } else if (
        ['Mobile Recharge', 'DTH Recharge', 'Electricity', 'Water', 'Gas', 'Broadband', 'FASTag', 'Utilities', 'Card Bill'].includes(activeFlow)
      ) {
        // Process utility pay through transaction endpoint
        const fromAccountId = accounts[0]?.id;
        await bankingService.initiateTransfer({
          fromAccountId,
          toAccountDetails: {
            name: formData.operator || formData.biller || activeFlow,
            account_number: formData.subscriberId || formData.mobile || 'Utility Pay',
            ifsc: 'FNVA0001923'
          },
          amount: parseFloat(formData.amount),
          type: activeFlow,
          note: `Utility Bill: ${formData.operator || activeFlow}`,
          category: 'Bills'
        });
      }

      // Refresh global Zustand dashboard data
      const updatedData = await bankingService.getDashboardData();
      setBankingData(updatedData);

      setStep(3); // Success Screen
    } catch (err) {
      console.error("Verification or transaction error:", err);
      setError(err.response?.data?.error || err.message || "Invalid UPI PIN. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Split Expense Submission: writes notifications directly to database!
  const handleSplitSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const shareAmount = parseFloat(splitAmount) / (splitGroup.length + 1);
      
      // For each added group member, insert a real transaction/split request notification into Supabase
      const insertPromises = splitGroup.map((member) => {
        return supabase.from('notifications').insert([{
          user_id: member.id,
          title: 'New Split Request',
          message: `${user?.full_name} is requesting ₹${shareAmount.toFixed(2)} for "${splitName}". Pay using UPI ID: ${user?.upi_id}`,
          notification_type: 'transaction',
          is_read: false
        }]);
      });

      await Promise.all(insertPromises);
      
      setFormData({ amount: splitAmount, name: splitName });
      setStep(3); // Show Success Page
    } catch (err) {
      console.error("Split generation error:", err);
      setError("Failed to generate split requests. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  // Scheduled Bill Creation: inserts persistent scheduled bills into Database!
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('bills')
        .insert([{
          user_id: user.id,
          provider_name: formData.provider || 'Scheduled Sub',
          amount: parseFloat(formData.amount),
          due_date: formData.dueDate || new Date().toISOString().split('T')[0],
          status: 'pending'
        }]);

      if (insertError) throw insertError;

      // Refresh data
      const updatedData = await bankingService.getDashboardData();
      setBankingData(updatedData);

      setStep(3);
    } catch (err) {
      console.error("Schedule creation failed:", err);
      setError("Could not register scheduled auto-pay. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleGroupMember = (member) => {
    if (splitGroup.some(g => g.id === member.id)) {
      setSplitGroup(splitGroup.filter(g => g.id !== member.id));
    } else {
      setSplitGroup([...splitGroup, member]);
    }
  };

  const ErrorAlert = () => error ? (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-8 mt-4 p-4.5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3"
    >
      <AlertCircle size={16} className="text-rose-500 shrink-0" />
      <p className="text-[11px] font-black text-rose-600 uppercase tracking-tight">{error}</p>
    </motion.div>
  ) : null;

  if (!isOpen) return null;

  const renderContent = () => {
    // 1. Success Receipt State
    if (step === 3) {
      return (
        <div className="p-10 text-center space-y-6 flex flex-col items-center justify-center min-h-[400px]">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-200"
          >
            <CheckCircle2 size={40} />
          </motion.div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Transaction Successful</h2>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Reference ID: FIN{Date.now().toString().slice(-8)}</p>
          </div>

          <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] w-full space-y-4">
            <div className="text-left space-y-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Payment Account / Service</span>
              <p className="text-sm font-black text-slate-800 leading-none">{formData.name || formData.operator || formData.upi || activeFlow}</p>
            </div>
            <div className="h-px bg-slate-200/50"></div>
            <div className="text-left space-y-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Transfer Amount</span>
              <p className="text-3xl font-black text-primary-600">₹{parseFloat(formData.amount || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>

          <button
            onClick={resetFlow}
            className="w-full py-4.5 bg-slate-900 hover:bg-primary-600 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl transition-all"
          >
            Go Back
          </button>
        </div>
      );
    }

    // 2. PIN Entry Screen
    if (step === 4) {
      return (
        <form onSubmit={handleUpiPinVerifyAndSubmit} className="p-8 lg:p-10 space-y-8">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mx-auto">
              <ShieldCheck size={24} />
            </div>
            <h4 className="text-lg font-black text-slate-950 tracking-tight leading-none">Security PIN Authorization</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-normal max-w-[260px] mx-auto">
              Confirm this payment of ₹{parseFloat(formData.amount || 0).toLocaleString('en-IN')} with your 6-digit PIN
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <input
              required
              type="password"
              maxLength="6"
              value={upiPin}
              onChange={(e) => setUpiPin(e.target.value)}
              placeholder="••••••"
              autoFocus
              className="w-56 text-center py-5 bg-slate-50 border-2 border-slate-100 focus:border-primary-500/20 focus:bg-white rounded-2xl text-3xl font-black tracking-[0.5em] outline-none transition-all"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 py-4.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-2xl font-black text-[11px] uppercase tracking-widest border border-slate-100/60 transition-all"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || upiPin.length < 4}
              className="flex-1 py-4.5 bg-slate-900 hover:bg-primary-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <RefreshCcw className="animate-spin" size={14} /> : 'Authorize'}
            </button>
          </div>
        </form>
      );
    }

    // 3. Dynamic Form Selector by Flow Type
    switch (activeFlow) {
      case 'Bank Transfer':
      case 'To Bank Account':
        return (
          <form onSubmit={(e) => { e.preventDefault(); setStep(4); }} className="p-8 lg:p-10 space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Beneficiary Credentials</label>
              <input
                required
                placeholder="Beneficiary Full Name"
                className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-primary-500/40 transition-all"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                required
                type="number"
                placeholder="Account Number"
                className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-primary-500/40 transition-all"
                value={formData.acc || ''}
                onChange={(e) => setFormData({ ...formData, acc: e.target.value })}
              />
              <input
                required
                placeholder="IFSC Code (e.g. BARB0COLOUR)"
                className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-primary-500/40 transition-all uppercase"
                value={formData.ifsc || ''}
                onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Amount to Transfer</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₹</span>
                <input
                  required
                  type="number"
                  placeholder="0.00"
                  className="w-full pl-14 pr-6 py-6 bg-slate-50 border-2 border-transparent focus:border-primary-500/20 focus:bg-white rounded-[2rem] text-4xl font-black text-slate-900 outline-none transition-all placeholder:text-slate-200"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <input
                placeholder="Add Note (Optional)"
                className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-primary-500/40 transition-all"
                value={formData.note || ''}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="w-full py-5 bg-slate-900 hover:bg-primary-600 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl transition-all"
            >
              Continue to PIN
            </button>
          </form>
        );

      case 'UPI ID / Phone':
      case 'To Mobile / UPI':
        return (
          <div className="p-8 lg:p-10 space-y-6">
            {step === 1 ? (
              <>
                <div className="relative group">
                  <Search className={`absolute left-4.5 top-1/2 -translate-y-1/2 transition-colors ${searching ? 'text-primary-600 animate-pulse' : 'text-slate-400'}`} size={16} />
                  <input
                    type="text"
                    placeholder="Enter recipient UPI ID or phone number..."
                    value={searchQuery}
                    className="w-full pl-12 pr-4 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-primary-500 text-xs font-bold text-slate-900 outline-none transition-all"
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>

                {searchResults.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 bg-slate-50 p-4.5 rounded-2xl border border-slate-100">
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Global Directory Matches</h4>
                    <div className="space-y-1">
                      {searchResults.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => {
                            setFormData({ ...formData, upi: user.upi_id, name: user.full_name });
                            setStep(2);
                          }}
                          className="w-full flex items-center gap-3 p-3.5 hover:bg-white rounded-xl transition-all text-left group"
                        >
                          <div className="w-9 h-9 bg-slate-950 text-white rounded-lg flex items-center justify-center font-black text-xs shrink-0">
                            {user.full_name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-slate-900 leading-none truncate">{user.full_name}</p>
                            <p className="text-[10px] font-bold text-slate-400 truncate mt-1">{user.upi_id}</p>
                          </div>
                          <ShieldCheck size={14} className="text-primary-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div className="space-y-3">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Registered Payees</h4>
                  <div className="grid grid-cols-4 gap-4">
                    {beneficiaries.slice(0, 4).map((b, i) => (
                      <button key={i} onClick={() => {
                        setFormData({ name: b.beneficiary_name, upi: b.upi_id });
                        setStep(2);
                      }} className="flex flex-col items-center gap-2 group">
                        <div className="w-12 h-12 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center font-black text-xs shadow-inner transition-colors">
                          {b.beneficiary_name?.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate w-full text-center">{b.beneficiary_name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setStep(4); }} className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs">
                    {(formData.name || 'UP').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-slate-950 leading-none">{formData.name}</h5>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">{formData.upi}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Enter Split/Pay Amount</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₹</span>
                    <input
                      required
                      type="number"
                      placeholder="0.00"
                      autoFocus
                      className="w-full pl-14 pr-6 py-6 bg-slate-50 border-2 border-transparent focus:border-primary-500/20 focus:bg-white rounded-[2rem] text-4xl font-black text-slate-900 outline-none transition-all placeholder:text-slate-200"
                      value={formData.amount || ''}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                  <input
                    placeholder="Message / Note (Optional)"
                    className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-primary-500/40 transition-all"
                    value={formData.note || ''}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-5 bg-slate-900 hover:bg-primary-600 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl transition-all"
                >
                  Continue
                </button>
              </form>
            )}
          </div>
        );

      case 'To Self Account':
        return (
          <form onSubmit={(e) => { e.preventDefault(); setStep(4); }} className="p-8 lg:p-10 space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Source Account</label>
              <select
                className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-700 outline-none cursor-pointer"
                onChange={(e) => setFormData({ ...formData, sourceAccountNo: e.target.value })}
              >
                <option value={accounts[0]?.account_number}>Savings Account (₹{Number(balance || 0).toLocaleString('en-IN')})</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Destination Account</label>
              <select
                required
                className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-700 outline-none cursor-pointer"
                onChange={(e) => setFormData({ 
                  ...formData, 
                  destAccountNo: e.target.value, 
                  destAccountType: e.target.options[e.target.selectedIndex].text.split(' ')[0]
                })}
              >
                <option value="">Select Destination Account</option>
                <option value="10992384758">Current Account (Virtual)</option>
                <option value="10992384799">Fixed Deposit (Virtual)</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Amount to Transfer</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₹</span>
                <input
                  required
                  type="number"
                  placeholder="0.00"
                  className="w-full pl-14 pr-6 py-6 bg-slate-50 border-2 border-transparent focus:border-primary-500/20 focus:bg-white rounded-[2rem] text-4xl font-black text-slate-900 outline-none transition-all placeholder:text-slate-200"
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!formData.destAccountNo}
              className="w-full py-5 bg-slate-900 hover:bg-primary-600 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl transition-all disabled:opacity-50"
            >
              Continue to PIN
            </button>
          </form>
        );

      case 'Split & Groups':
        return (
          <form onSubmit={handleSplitSubmit} className="p-8 lg:p-10 space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Split Details</label>
              <input
                required
                placeholder="What is this split for? (e.g. Rent, Dinner)"
                className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-primary-500/40 transition-all"
                value={splitName}
                onChange={(e) => setSplitName(e.target.value)}
              />
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300">₹</span>
                <input
                  required
                  type="number"
                  placeholder="Total Split Amount"
                  className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-slate-900 outline-none focus:bg-white focus:border-primary-500/40 transition-all"
                  value={splitAmount}
                  onChange={(e) => setSplitAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Select Group Members</label>
              <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-1">
                {platformUsers.filter(u => u.id !== user.id).map((member) => {
                  const isSelected = splitGroup.some(g => g.id === member.id);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleGroupMember(member)}
                      className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        isSelected 
                          ? 'bg-primary-50 border-primary-500 text-primary-900' 
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold leading-none truncate max-w-[100px]">{member.full_name}</span>
                      {isSelected ? <CheckCircle2 size={12} className="text-primary-600 shrink-0" /> : <Plus size={12} className="text-slate-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {splitGroup.length > 0 && splitAmount && (
              <div className="p-4.5 bg-violet-50/50 border border-violet-100 rounded-2xl">
                <p className="text-[10px] font-black text-violet-900 uppercase tracking-widest">Split Math Summary</p>
                <div className="flex justify-between items-center mt-2.5">
                  <span className="text-xs font-bold text-violet-800">Share per user ({splitGroup.length + 1} ways)</span>
                  <span className="text-sm font-black text-violet-950">₹{(parseFloat(splitAmount) / (splitGroup.length + 1)).toFixed(2)}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || splitGroup.length === 0 || !splitAmount || !splitName}
              className="w-full py-5 bg-slate-900 hover:bg-primary-600 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? <RefreshCcw className="animate-spin mx-auto" size={16} /> : 'Split Bill & Request'}
            </button>
          </form>
        );

      case 'Mobile Recharge':
        return (
          <form onSubmit={(e) => { e.preventDefault(); setStep(4); }} className="p-8 lg:p-10 space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Subscriber Details</label>
              <input
                required
                type="tel"
                maxLength="10"
                placeholder="10-digit Mobile Number"
                className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-primary-500/40 transition-all"
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              />
              <select
                required
                className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-600 outline-none cursor-pointer"
                onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
              >
                <option value="">Choose Service Provider</option>
                <option value="Jio Prepaid">Jio Prepaid</option>
                <option value="Airtel Postpaid">Airtel Postpaid</option>
                <option value="Vi Prepaid">Vi Prepaid</option>
                <option value="BSNL Recharge">BSNL Special Recharge</option>
              </select>
            </div>

            {formData.operator && (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Choose Top Recharge Plans</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { a: '299', d: '1.5GB/day • 28 Days' },
                    { a: '719', d: '2GB/day • 84 Days' },
                    { a: '999', d: '3GB/day • 84 Days' },
                    { a: '2999', d: '2.5GB/day • 365 Days' }
                  ].map((plan) => (
                    <button
                      key={plan.a}
                      type="button"
                      onClick={() => setFormData({ ...formData, amount: plan.a })}
                      className={`p-4 rounded-2xl border text-left space-y-1.5 transition-all ${
                        formData.amount === plan.a 
                          ? 'bg-primary-50 border-primary-500 text-primary-950' 
                          : 'bg-white border-slate-100 hover:border-slate-200 text-slate-700'
                      }`}
                    >
                      <p className="text-lg font-black leading-none">₹{plan.a}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mt-1">{plan.d}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!formData.amount || !formData.mobile}
              className="w-full py-5 bg-slate-900 hover:bg-primary-600 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl transition-all disabled:opacity-50"
            >
              Continue to PIN
            </button>
          </form>
        );

      case 'DTH Recharge':
        return (
          <form onSubmit={(e) => { e.preventDefault(); setStep(4); }} className="p-8 lg:p-10 space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Subscriber Details</label>
              <select
                required
                className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-600 outline-none cursor-pointer"
                onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
              >
                <option value="">Select DTH Provider</option>
                <option value="Tata Play">Tata Play</option>
                <option value="Airtel Digital TV">Airtel Digital TV</option>
                <option value="Dish TV">Dish TV</option>
                <option value="Sun Direct">Sun Direct</option>
              </select>
              <input
                required
                placeholder="Smart Card / Subscriber ID"
                className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-primary-500/40 transition-all"
                onChange={(e) => setFormData({ ...formData, subscriberId: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Recharge Amount</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300">₹</span>
                <input
                  required
                  type="number"
                  placeholder="0.00"
                  className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-slate-900 outline-none focus:bg-white focus:border-primary-500/40 transition-all"
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!formData.operator || !formData.subscriberId}
              className="w-full py-5 bg-slate-900 hover:bg-primary-600 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl transition-all disabled:opacity-50"
            >
              Continue to PIN
            </button>
          </form>
        );

      case 'Electricity':
      case 'Water':
      case 'Gas':
      case 'Broadband':
      case 'FASTag':
        return (
          <form onSubmit={(e) => { e.preventDefault(); setStep(4); }} className="p-8 lg:p-10 space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Biller Details</label>
              <select
                required
                className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-600 outline-none cursor-pointer"
                onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
              >
                <option value="">Select Biller Operator</option>
                {activeFlow === 'Electricity' && (
                  <>
                    <option value="BESCOM (Bengaluru)">BESCOM (Bengaluru)</option>
                    <option value="Tata Power">Tata Power</option>
                    <option value="Adani Electricity">Adani Electricity</option>
                  </>
                )}
                {activeFlow === 'Water' && (
                  <>
                    <option value="BWSSB (Bengaluru)">BWSSB (Bengaluru)</option>
                    <option value="Delhi Jal Board">Delhi Jal Board</option>
                  </>
                )}
                {activeFlow === 'Gas' && (
                  <>
                    <option value="Indane Gas">Indane Gas Booking</option>
                    <option value="Mahanagar Gas">Mahanagar Gas Ltd</option>
                  </>
                )}
                {activeFlow === 'Broadband' && (
                  <>
                    <option value="Airtel Fiber">Airtel Xstream Fiber</option>
                    <option value="ACT Fibernet">ACT Fibernet</option>
                  </>
                )}
                {activeFlow === 'FASTag' && (
                  <>
                    <option value="SBI FASTag">SBI FASTag</option>
                    <option value="ICICI FASTag">ICICI FASTag</option>
                  </>
                )}
              </select>
              <input
                required
                placeholder={activeFlow === 'FASTag' ? 'Vehicle Registration Number' : 'Consumer ID / Customer ID'}
                className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-primary-500/40 transition-all uppercase"
                onChange={(e) => setFormData({ ...formData, subscriberId: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Payment Amount</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300">₹</span>
                <input
                  required
                  type="number"
                  placeholder="0.00"
                  className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-slate-900 outline-none focus:bg-white focus:border-primary-500/40 transition-all"
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!formData.operator || !formData.subscriberId}
              className="w-full py-5 bg-slate-900 hover:bg-primary-600 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl transition-all disabled:opacity-50"
            >
              Continue to PIN
            </button>
          </form>
        );

      case 'Schedule':
        return (
          <form onSubmit={handleScheduleSubmit} className="p-8 lg:p-10 space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Auto-Pay Provider</label>
              <input
                required
                placeholder="Provider Name (e.g. Netflix, Rent)"
                className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-primary-500/40 transition-all"
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Scheduled Date</label>
              <div className="relative">
                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  required
                  type="date"
                  className="w-full pl-12 pr-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:bg-white transition-all"
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Due Amount</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300">₹</span>
                <input
                  required
                  type="number"
                  placeholder="0.00"
                  className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-slate-900 outline-none focus:bg-white focus:border-primary-500/40 transition-all"
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.provider || !formData.dueDate || !formData.amount}
              className="w-full py-5 bg-slate-900 hover:bg-primary-600 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? <RefreshCcw className="animate-spin mx-auto" size={16} /> : 'Save auto-pay schedule'}
            </button>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 lg:p-4 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetFlow}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 50 }}
            className="relative w-full h-full lg:h-auto lg:max-w-md bg-white rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-100/50"
          >
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{activeFlow}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Secured by Finova Shield</p>
              </div>
              <button onClick={resetFlow} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
              <ErrorAlert />
              {renderContent()}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PaymentFlows;
