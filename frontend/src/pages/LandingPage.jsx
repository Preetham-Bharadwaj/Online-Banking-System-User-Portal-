import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Zap, 
  PieChart, 
  TrendingUp, 
  CreditCard, 
  Bell, 
  Smartphone, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  Menu,
  X,
  ChevronDown,
  Users,
  Globe,
  Clock,
  Shield,
  Eye,
  Settings
} from 'lucide-react';
import { useState, useEffect } from 'react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      {/* 1. Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary-600 font-bold text-2xl">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-200">
              <span className="text-lg">V</span>
            </div>
            Vertex Bank
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Features</a>
            <a href="#security" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Security</a>
            <a href="#analytics" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Analytics</a>
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">About</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-primary-600 transition-colors px-4 py-2">
              Login
            </Link>
            <Link to="/register" className="btn-primary px-6 py-2.5 text-sm font-bold shadow-lg shadow-primary-200">
              Get Started
            </Link>
          </div>

          <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-slate-100 p-6 space-y-4 shadow-xl">
            <a href="#features" className="block text-lg font-medium text-slate-600" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#security" className="block text-lg font-medium text-slate-600" onClick={() => setIsMenuOpen(false)}>Security</a>
            <a href="#analytics" className="block text-lg font-medium text-slate-600" onClick={() => setIsMenuOpen(false)}>Analytics</a>
            <div className="pt-4 flex flex-col gap-3">
              <Link to="/login" className="text-center py-3 font-semibold text-slate-700 border border-slate-200 rounded-xl">Login</Link>
              <Link to="/register" className="text-center py-3 font-bold text-white bg-primary-600 rounded-xl shadow-lg">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-primary-50 rounded-full blur-3xl -z-10 opacity-60"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl -z-10 opacity-60"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-primary-100">
              <Zap size={14} /> Coming Soon: The Future of Banking
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
              Smart Banking for <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-500">
                The Digital Age.
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Experience the next generation of banking. Instant transfers, AI-powered insights, and bank-grade security—all in one 100% free platform designed for your lifestyle.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-xl shadow-primary-200 transition-all hover:scale-105 flex items-center justify-center gap-2">
                Open Free Account <ArrowRight size={20} />
              </Link>
              <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-slate-200 hover:border-primary-600 text-slate-700 hover:text-primary-600 font-bold rounded-2xl transition-all">
                Sign In to Portal
              </Link>
            </div>
            <p className="text-sm text-slate-400 flex items-center justify-center lg:justify-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" /> No hidden fees • Complete KYC in 5 mins • RBI Compliant
            </p>
          </div>

          <div className="flex-1 relative">
            <div className="relative z-10 animate-float">
               {/* Dummy Dashboard UI Preview */}
               <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 transform lg:rotate-2 hover:rotate-0 transition-transform duration-700">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                    </div>
                    <div className="h-2 w-32 bg-slate-100 rounded-full"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-40 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
                      <p className="text-xs opacity-80">Total Balance</p>
                      <p className="text-3xl font-bold mt-1">₹4,25,600.00</p>
                      <div className="mt-8 flex justify-between items-end">
                        <p className="font-mono tracking-widest text-sm">**** **** **** 8821</p>
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-white/20"></div>
                          <div className="w-6 h-6 rounded-full bg-white/20"></div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-20 bg-emerald-50 rounded-2xl p-4">
                        <p className="text-[10px] text-emerald-600 font-bold uppercase">Monthly Income</p>
                        <p className="text-lg font-bold text-slate-900">₹85,000</p>
                      </div>
                      <div className="h-20 bg-rose-50 rounded-2xl p-4">
                        <p className="text-[10px] text-rose-600 font-bold uppercase">Monthly Spent</p>
                        <p className="text-lg font-bold text-slate-900">₹32,400</p>
                      </div>
                    </div>
                  </div>
               </div>
               
               {/* Small floating badges */}
               <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-pulse delay-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                      <Zap size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Instant Transfer</p>
                      <p className="text-sm font-bold text-slate-900">Success!</p>
                    </div>
                  </div>
               </div>
               
               <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-bounce">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                      <PieChart size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Savings Goal</p>
                      <p className="text-sm font-bold text-slate-900">85% Completed</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Trusted Statistics Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center space-y-2">
              <p className="text-4xl font-extrabold text-primary-600">99.99%</p>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Uptime Guarantee</p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-4xl font-extrabold text-primary-600">₹0</p>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Hidden Charges</p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-4xl font-extrabold text-primary-600">AES-256</p>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Military Security</p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-4xl font-extrabold text-primary-600">24/7</p>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Expert Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section id="features" className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-primary-600 font-bold uppercase tracking-widest text-sm">Product Features</h2>
            <h3 className="text-4xl lg:text-5xl font-extrabold text-slate-900">Banking that adapts to you.</h3>
            <p className="text-lg text-slate-600 leading-relaxed">
              We've reimagined banking from the ground up to provide features that actually help you save time and money.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {[
              { icon: Zap, title: "Instant Fund Transfers", desc: "Send money to any bank account or UPI ID instantly, 24/7.", highlight: "Real-time" },
              { icon: PieChart, title: "Budget Planner", desc: "Automate your savings and track spending effortlessly.", highlight: "AI-Powered" },
              { icon: TrendingUp, title: "Smart Analytics", desc: "Deep insights into your spending habits and financial health.", highlight: "Deep Insights" },
              { icon: Smartphone, title: "Bill Payments", desc: "One-click payments for all your utilities and subscriptions.", highlight: "Auto-Pay" },
              { icon: CreditCard, title: "Virtual Cards", desc: "Create instant virtual cards for safer online shopping.", highlight: "Zero-Risk" },
              { icon: Lock, title: "Card Controls", desc: "Freeze, unfreeze, or set limits on your cards instantly.", highlight: "Instant Control" },
              { icon: Shield, title: "Fraud Detection", desc: "Advanced AI that monitors for suspicious activity in real-time.", highlight: "Bank-Grade" },
              { icon: Bell, title: "Smart Alerts", desc: "Personalized notifications for every transaction and insight.", highlight: "Real-time" },
            ].map((feature, i) => (
              <div key={i} className="p-5 md:p-8 rounded-2xl md:rounded-3xl border border-slate-100 hover:border-primary-100 hover:bg-primary-50/30 transition-all duration-300 group">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 mb-4 md:mb-6">
                  <feature.icon className="w-5 h-5 md:w-7 md:h-7" />
                </div>
                <div className="inline-block px-2 py-0.5 bg-primary-100 text-primary-700 text-[9px] md:text-[10px] font-bold rounded uppercase mb-2 md:mb-3">
                  {feature.highlight}
                </div>
                <h4 className="text-base md:text-xl font-bold text-slate-900 mb-2 md:mb-3 leading-tight">{feature.title}</h4>
                <p className="text-slate-600 text-[11px] md:text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Analytics Showcase Section */}
      <section id="analytics" className="py-32 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/20 rounded-full blur-[120px]"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <h3 className="text-4xl lg:text-5xl font-extrabold leading-tight">
                Watch your money <br/>
                <span className="text-primary-400">grow with intelligence.</span>
              </h3>
              <div className="space-y-6">
                {[
                  { title: "Smart Spending Categories", desc: "Automatically categorizes every transaction using our proprietary AI engine." },
                  { title: "Monthly Financial Health Score", desc: "Get a detailed report on your saving, spending, and investment patterns." },
                  { title: "Trend Predictions", desc: "Our algorithm predicts your next month's expenses based on historical data." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center mt-1">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">{item.title}</h4>
                      <p className="text-slate-400 text-sm mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl relative">
                 <div className="flex justify-between items-center mb-8">
                    <p className="font-bold">Spending Overview</p>
                    <div className="px-3 py-1 bg-slate-700 rounded-lg text-xs">Last 30 Days</div>
                 </div>
                 {/* Dummy Chart Mockup */}
                 <div className="flex items-end gap-3 h-48 mb-8">
                    {[40, 65, 35, 85, 55, 95, 75].map((h, i) => (
                      <div key={i} className="flex-1 bg-primary-500 rounded-t-lg transition-all duration-1000" style={{ height: `${h}%` }}></div>
                    ))}
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-700/50 rounded-2xl">
                       <p className="text-xs text-slate-400">Top Category</p>
                       <p className="font-bold text-primary-400 mt-1">Dining & Lifestyle</p>
                    </div>
                    <div className="p-4 bg-slate-700/50 rounded-2xl">
                       <p className="text-xs text-slate-400">Potential Savings</p>
                       <p className="font-bold text-emerald-400 mt-1">₹12,400 / mo</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Security Section */}
      <section id="security" className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-primary-600 rounded-[3rem] p-8 lg:p-20 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            
            <div className="flex flex-col lg:flex-row items-center gap-16 relative z-10">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest">
                  <ShieldCheck size={14} /> Security First
                </div>
                <h3 className="text-4xl lg:text-5xl font-extrabold leading-tight">
                  Your security is our <br/> highest priority.
                </h3>
                <p className="text-lg text-primary-100 leading-relaxed">
                  We use the same encryption standards as top global financial institutions. Your money and data are always protected.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                   <div className="flex items-center gap-3">
                      <Lock className="text-primary-300" />
                      <span className="font-bold">AES-256 Encryption</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <Smartphone className="text-primary-300" />
                      <span className="font-bold">Multi-factor Auth</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <CheckCircle2 className="text-primary-300" />
                      <span className="font-bold">RBI Compliant</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <Eye className="text-primary-300" />
                      <span className="font-bold">Fraud Monitoring</span>
                   </div>
                </div>
              </div>
              <div className="flex-1 flex justify-center">
                 <div className="w-64 h-64 lg:w-80 lg:h-80 relative">
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                    <div className="absolute inset-4 bg-white/20 rounded-full"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Shield size={120} className="text-white drop-shadow-2xl" />
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. How It Works Section */}
      <section className="py-32 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
             <h2 className="text-4xl font-extrabold text-slate-900">Start your journey in minutes.</h2>
          </div>
          <div className="flex md:grid overflow-x-auto md:overflow-visible no-scrollbar snap-x snap-mandatory md:snap-none md:grid-cols-4 gap-6 md:gap-12 pb-8 md:pb-0">
            {[
              { step: "01", title: "Create Account", desc: "Download the app or sign up on web with your mobile number." },
              { step: "02", title: "Complete KYC", desc: "Quick paperless verification using your Aadhar and PAN card." },
              { step: "03", title: "Add Funds", desc: "Transfer money from any existing bank account instantly." },
              { step: "04", title: "Start Banking", desc: "Enjoy instant transfers, payments, and smart insights." }
            ].map((item, i) => (
              <div key={i} className="relative flex-none w-[75vw] md:w-auto snap-center">
                <p className="text-6xl md:text-7xl font-black text-slate-200 mb-4">{item.step}</p>
                <div className="relative -mt-10 pl-4">
                  <h4 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-px bg-slate-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Testimonials Section */}
      <section className="py-32 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl font-extrabold text-slate-900">What early testers say.</h2>
            <p className="text-slate-600">Join the waitlist to be part of the future of banking.</p>
          </div>
          <div className="flex md:grid overflow-x-auto md:overflow-visible no-scrollbar snap-x snap-mandatory md:snap-none md:grid-cols-3 gap-6 md:gap-8 pb-8 md:pb-0">
            {[
              { name: "Rahul Sharma", role: "Student, IIT Bombay", quote: "As a student, tracking expenses was a nightmare. Vertex changed that with its smart categorisation and zero hidden charges.", avatar: "RS" },
              { name: "Priya Varma", role: "Software Engineer", quote: "The interface is beautiful and the instant UPI transfers are actually instant. It's the only banking app I enjoy using.", avatar: "PV" },
              { name: "Amit Goel", role: "Small Business Owner", quote: "Managing my business expenses and personal savings in one place with such deep analytics has been a game changer for me.", avatar: "AG" }
            ].map((item, i) => (
              <div key={i} className="flex-none w-[85vw] md:w-auto snap-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                <div className="flex text-amber-400 gap-1 mb-4">
                   {[...Array(5)].map((_, j) => <CheckCircle2 size={16} key={j} className="fill-current" />)}
                </div>
                <p className="text-slate-700 italic mb-8">"{item.quote}"</p>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold">
                      {item.avatar}
                   </div>
                   <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{item.role}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FAQ Section */}
      <section className="py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-extrabold text-slate-900">Got questions?</h2>
            <p className="text-slate-600">We have answers to everything you need to know.</p>
          </div>
          <div className="space-y-4">
            {[
              { q: "How secure is my money?", a: "Your money is protected by bank-grade AES-256 encryption and multi-factor authentication. We are also fully RBI compliant and partner with scheduled commercial banks." },
              { q: "Is the KYC process entirely digital?", a: "Yes, our KYC process is 100% paperless and digital. It usually takes less than 5 minutes to complete using your mobile app." },
              { q: "Are there any hidden charges?", a: "None at all. We believe in transparent banking. All our charges are clearly mentioned in our schedule of charges available on the app." },
              { q: "Can I use UPI for all transfers?", a: "Yes, Vertex Bank supports UPI, IMPS, NEFT, and RTGS, giving you the flexibility to transfer money however you like." }
            ].map((faq, i) => (
              <details key={i} className="group border border-slate-100 rounded-2xl bg-white hover:bg-slate-50 transition-all cursor-pointer overflow-hidden">
                 <summary className="flex items-center justify-between p-6 list-none [&::-webkit-details-marker]:hidden">
                    <h4 className="font-bold text-slate-900">{faq.q}</h4>
                    <ChevronDown size={20} className="text-slate-400 group-open:rotate-180 transition-transform duration-300" />
                 </summary>
                 <div className="px-6 pb-6 text-slate-600 text-sm leading-relaxed animate-fadeIn">
                    {faq.a}
                 </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* New About Section */}
      <section id="about" className="py-32 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 relative">
               <div className="w-full aspect-square bg-primary-100 rounded-[3rem] overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/20 to-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="text-center p-12">
                        <p className="text-7xl font-black text-primary-600/10 mb-4">SINCE 2024</p>
                        <h4 className="text-3xl font-bold text-slate-800">Mission Driven. <br/> Tech Powered.</h4>
                     </div>
                  </div>
               </div>
               {/* Floating elements for visual interest */}
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
            </div>
            <div className="flex-1 space-y-8">
              <h2 className="text-primary-600 font-bold uppercase tracking-widest text-sm">About Vertex</h2>
              <h3 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">We're on a mission to democratize modern banking for free.</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                At Vertex, we believe that everyone deserves access to world-class financial tools. We're building a banking experience that isn't just about storing money, but about helping you understand and grow it.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                   <p className="text-3xl font-black text-slate-900">100%</p>
                   <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Free Forever</p>
                </div>
                <div>
                   <p className="text-3xl font-black text-slate-900">₹0</p>
                   <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Min Balance</p>
                </div>
                <div>
                   <p className="text-3xl font-black text-slate-900">Bengaluru</p>
                   <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Made In</p>
                </div>
                <div>
                   <p className="text-3xl font-black text-slate-900">24/7</p>
                   <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Security</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center bg-gradient-to-br from-primary-700 to-blue-900 rounded-[3rem] p-12 lg:p-24 text-white relative overflow-hidden">
           <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
           <div className="relative z-10 space-y-8">
              <h2 className="text-4xl lg:text-6xl font-extrabold leading-tight">
                 Ready to upgrade <br/> your banking?
              </h2>
              <p className="text-xl text-primary-100 max-w-2xl mx-auto">
                 Be among the first smart users to experience Vertex. Open your free account in less than 5 minutes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register" className="w-full sm:w-auto px-10 py-5 bg-white text-primary-700 font-black rounded-2xl shadow-2xl transition-all hover:scale-105">
                   Get Started Now
                </Link>
                <Link to="/login" className="w-full sm:w-auto px-10 py-5 bg-primary-600/50 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl transition-all hover:bg-primary-600">
                   Sign In to Portal
                </Link>
              </div>
           </div>
        </div>
      </section>

      {/* 11. Footer Content */}
      <footer className="pt-20 pb-10 bg-white border-t border-slate-100 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-20">
            <div className="col-span-2 space-y-6">
              <div className="flex items-center gap-2 text-primary-600 font-bold text-2xl">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white">
                  <span className="text-sm">V</span>
                </div>
                Vertex Bank
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                The modern banking platform designed for India's digital future. Safe, smart, and stunningly simple.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-primary-600 cursor-pointer transition-colors"><Globe size={18} /></div>
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-primary-600 cursor-pointer transition-colors"><Settings size={18} /></div>
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-primary-600 cursor-pointer transition-colors"><Users size={18} /></div>
              </div>
            </div>
            <div className="space-y-6">
              <h5 className="font-bold text-slate-900 uppercase text-xs tracking-widest">Product</h5>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li><a href="#" className="hover:text-primary-600 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Cards</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">UPI Payments</a></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h5 className="font-bold text-slate-900 uppercase text-xs tracking-widest">Company</h5>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li><a href="#" className="hover:text-primary-600 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Newsroom</a></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h5 className="font-bold text-slate-900 uppercase text-xs tracking-widest">Legal</h5>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li><a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Terms of Use</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-8 flex flex-col md:row items-center justify-between gap-4 text-slate-400 text-xs">
            <p>© 2026 Vertex Digital Bank Limited. All rights reserved.</p>
            <div className="flex gap-6">
               <p>Banking services provided by our Partner Banks.</p>
               <p>RBI Registered NBFC-P2P.</p>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Important Note for the user */}
      <div className="hidden">
        This landing page is displayed before user authentication/login/signup pages.
      </div>
    </div>
  );
};

export default LandingPage;
