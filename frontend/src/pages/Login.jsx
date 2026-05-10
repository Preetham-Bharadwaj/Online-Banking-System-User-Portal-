import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login
    navigate('/app/dashboard');
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Left Side - Brand Info */}
      <div className="hidden lg:flex relative w-5/12 bg-[#e8f0fe] flex-col justify-center px-16">
        <div className="absolute top-12 left-16 flex items-center gap-2 text-slate-900 font-bold text-xl">
          <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center text-white">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 3L4 9v12h16V9l-8-6zm0 2.5L18 10v9H6v-9l6-4.5zM11 11h2v6h-2v-6z"/></svg>
          </div>
          Vertex Bank
        </div>

        <div className="space-y-6">
          <h2 className="text-5xl font-bold text-slate-900 leading-tight">
            Institutional Stability.<br/>
            Technological Precision.
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed max-w-md">
            Access your secure portal to manage accounts, execute transfers, and monitor your financial ecosystem with absolute clarity.
          </p>
        </div>
        
        {/* Subtle decorative pattern */}
        <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-white/20 to-transparent"></div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Sign In</h2>
            <p className="mt-2 text-slate-500">
              Enter your credentials to access the secure portal.
            </p>
          </div>

          <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-sm text-primary-800">
            <p className="font-semibold mb-1">Dummy Credentials:</p>
            <p>Email: <span className="font-mono">alexander.mehta@company.com</span></p>
            <p>Password: <span className="font-mono">any-password</span></p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    defaultValue="alexander.mehta@company.com"
                    className="input-field pl-11 py-3 text-slate-900"
                    placeholder="alexander.mehta@company.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <a href="#" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
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
                    defaultValue="password123"
                    className="input-field pl-11 pr-11 py-3 text-slate-900"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
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
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded cursor-pointer"
                  defaultChecked
                />
                <label htmlFor="remember-me" className="ml-2.5 block text-sm text-slate-600 cursor-pointer">
                  Remember device
                </label>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <Lock size={12} /> Encrypted
              </div>
            </div>

            <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-200 transition-all active:scale-[0.98] flex justify-center items-center gap-2 text-lg">
              Sign In
              <ArrowRightIcon />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-sm">
            <span className="text-slate-500">Don't have an account? </span>
            <Link to="/register" className="font-bold text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline">
              Contact Administration
            </Link>
            
            <div className="mt-8 flex justify-center gap-6 text-slate-400 text-xs">
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
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"></path>
    <path d="m12 5 7 7-7 7"></path>
  </svg>
);

export default Login;
