import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight, Loader2, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

import authService from '../services/authService';
import useStore from '../store/useStore';

const getErrorMessage = (err) => {
  const responseError = err.response?.data?.error;

  if (typeof responseError === 'string') {
    return responseError;
  }

  if (responseError?.message) {
    return responseError.message;
  }

  return err.message || 'Registration failed. Please try again.';
};

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    account_type: 'savings',
    date_of_birth: '',
    address: '',
    aadhaar_last4: '',
    pan_number: '',
    password: '',
    confirmPassword: '',
    upi_pin: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { setAuth } = useStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    setError(null);

    try {
      const data = await authService.register({
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number,
        account_type: formData.account_type,
        date_of_birth: formData.date_of_birth,
        address: formData.address,
        aadhaar_last4: formData.aadhaar_last4 || undefined,
        pan_number: formData.pan_number || undefined,
        password: formData.password,
        upi_pin: formData.upi_pin
      });

      // Save token + user so ProtectedRoute lets us through
      setAuth(data.user, data.token);
      setSuccess(true);
      setTimeout(() => navigate('/app/dashboard'), 2000);
    } catch (err) {
      console.error('Registration failed:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Account Created!</h2>
          <p className="text-slate-500 font-medium mb-8">Your secure banking profile has been successfully initialized. Redirecting you to your dashboard...</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full animate-[progress_2s_linear]"></div>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes progress { from { width: 0%; } to { width: 100%; } }` }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Left Side - Brand Info */}
      <div className="hidden lg:flex relative w-5/12 bg-primary-900 flex-col justify-center px-16 text-white overflow-hidden">
        <div className="absolute top-12 left-16 flex items-center gap-3 font-bold text-xl cursor-pointer" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="Finova Logo" className="h-12 w-auto object-contain" />
          Finova Bank
        </div>

        <div className="relative z-10 space-y-6">
          <div className="w-16 h-1 bg-primary-400 rounded-full"></div>
          <h2 className="text-5xl font-black leading-tight tracking-tight">
            Join the Next<br />
            Generation of<br />
            Private Banking.
          </h2>
          <p className="text-lg text-primary-100 leading-relaxed max-w-md opacity-80">
            Experience institutional-grade security with the agility of a modern fintech platform.
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-primary-800 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-20 -left-10 w-40 h-40 bg-primary-700 rounded-full blur-2xl opacity-30"></div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Register</h2>
            <p className="mt-3 text-slate-500 font-medium">
              Initialize your secure banking profile.
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex gap-3 items-center text-rose-800 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 font-bold focus:bg-white focus:border-primary-500 transition-all outline-none"
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 font-bold focus:bg-white focus:border-primary-500 transition-all outline-none"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  Phone Number
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    name="phone_number"
                    required
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 font-bold focus:bg-white focus:border-primary-500 transition-all outline-none"
                    placeholder="+91 00000 00000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Account Type
                  </label>
                  <select
                    name="account_type"
                    required
                    value={formData.account_type}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3.5 px-4 text-slate-900 font-bold focus:bg-white focus:border-primary-500 transition-all outline-none"
                  >
                    <option value="savings">Savings</option>
                    <option value="salary">Salary</option>
                    <option value="current">Current</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    DOB
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    required
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3.5 px-4 text-slate-900 font-bold focus:bg-white focus:border-primary-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3.5 px-4 text-slate-900 font-bold focus:bg-white focus:border-primary-500 transition-all outline-none"
                  placeholder="Residential address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Aadhaar Last 4
                  </label>
                  <input
                    type="text"
                    name="aadhaar_last4"
                    maxLength="4"
                    value={formData.aadhaar_last4}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3.5 px-4 text-slate-900 font-bold focus:bg-white focus:border-primary-500 transition-all outline-none"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    PAN
                  </label>
                  <input
                    type="text"
                    name="pan_number"
                    value={formData.pan_number}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3.5 px-4 text-slate-900 font-bold focus:bg-white focus:border-primary-500 transition-all outline-none"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 font-bold focus:bg-white focus:border-primary-500 transition-all outline-none"
                      placeholder="••••"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Confirm
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 font-bold focus:bg-white focus:border-primary-500 transition-all outline-none"
                      placeholder="••••"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  6-Digit UPI PIN (For Transactions)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                    <ShieldCheck size={18} />
                  </div>
                  <input
                    type="password"
                    name="upi_pin"
                    required
                    maxLength="6"
                    pattern="\d{6}"
                    value={formData.upi_pin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, upi_pin: val });
                    }}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 font-black tracking-[0.5em] focus:bg-white focus:border-primary-500 transition-all outline-none"
                    placeholder="••••••"
                  />
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-2 ml-1">This PIN will be required for all your UPI transfers.</p>
              </div>
            </div>


            <div className="flex items-start gap-3 py-2">
              <input
                id="terms"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 text-primary-600 border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="terms" className="text-[11px] font-bold text-slate-500 leading-tight cursor-pointer uppercase tracking-wider">
                I agree to the <span className="text-primary-600">Institutional Terms of Service</span> and <span className="text-primary-600">Privacy Protocols</span>.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-primary-600 disabled:bg-slate-200 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-200 hover:shadow-primary-300 transition-all active:scale-[0.98] flex justify-center items-center gap-3 text-sm uppercase tracking-widest mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Initializing...
                </>
              ) : (
                <>
                  Register Account <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <span className="text-slate-500 font-bold text-xs">Already have an account? </span>
            <Link to="/login" className="font-black text-primary-600 hover:text-primary-700 text-xs uppercase tracking-widest ml-1">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
