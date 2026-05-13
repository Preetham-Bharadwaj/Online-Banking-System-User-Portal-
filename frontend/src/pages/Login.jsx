
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

import { useState, useEffect } from 'react';

import authService from '../services/authService';
import useStore from '../store/useStore';

const getErrorMessage = (err) => {
  const responseError = err.response?.data?.error;
  if (typeof responseError === 'string') return responseError;
  if (responseError?.message) return responseError.message;
  return err.message || 'Invalid credentials or connection error';
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const navigate = useNavigate();
  const { setAuth, logout } = useStore();

  // Clear any stale session when the login page is opened
  useEffect(() => {
    logout();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    setLocalError(null);

    try {
      const data = await authService.login({ email, password });
      setAuth(data.user, data.token);
      navigate('/app/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      setLocalError(getErrorMessage(err));
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Left Side - Brand Info */}
      <div className="hidden lg:flex relative w-5/12 bg-[#e8f0fe] flex-col justify-center px-16">
        <div className="absolute top-12 left-16 flex items-center gap-3 text-slate-900 font-bold text-xl cursor-pointer" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="Finova Logo" className="h-12 w-auto object-contain" />
          Finova Bank
        </div>

        <div className="space-y-6">
          <h2 className="text-5xl font-bold text-slate-900 leading-tight">
            Institutional Stability.<br />
            Technological Precision.
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed max-w-md">
            Access your secure portal to manage accounts, execute transfers, and monitor your financial ecosystem with absolute clarity.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-white/20 to-transparent"></div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Sign In</h2>
            <p className="mt-2 text-slate-500">
              Enter your credentials to access the secure portal.
            </p>
          </div>

          {localError && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex gap-3 items-center text-rose-800 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm font-medium">{localError}</p>
            </div>
          )}

          <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-sm text-primary-800">
            <p className="font-bold mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-pulse"></span>
              Welcome back
            </p>
            <p>Sign in with the email and password you used during registration.</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                    placeholder="alexander.mehta@company.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-bold text-slate-700">
                    Password
                  </label>
                  <a href="#" className="text-sm font-bold text-primary-600 hover:text-primary-700">
                    Forgot password?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-11 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4.5 w-4.5 text-primary-600 focus:ring-primary-500 border-slate-300 rounded-md cursor-pointer transition-all"
                  defaultChecked
                />
                <label htmlFor="remember-me" className="ml-2.5 block text-sm font-medium text-slate-600 cursor-pointer">
                  Remember device
                </label>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <Lock size={12} /> Encrypted
              </div>
            </div>

            <button
              type="submit"
              disabled={localLoading}
              className="w-full bg-slate-900 hover:bg-primary-600 disabled:bg-slate-300 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-200 hover:shadow-primary-200 transition-all active:scale-[0.98] flex justify-center items-center gap-3 text-sm uppercase tracking-widest"
            >
              {localLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Processing...
                </>
              ) : (
                <>
                  Sign In <ArrowRightIcon />
                </>
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-slate-100 text-center text-sm">
            <span className="text-slate-500 font-medium">Don't have an account? </span>
            <Link to="/register" className="font-black text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline">
              Contact Administration
            </Link>

            <div className="mt-8 flex justify-center gap-6 text-slate-400 text-[11px] font-bold">
              <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"></path>
    <path d="m12 5 7 7-7 7"></path>
  </svg>
);

export default Login;
