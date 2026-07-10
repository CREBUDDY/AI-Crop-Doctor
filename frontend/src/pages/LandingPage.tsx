import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, ScanLine, Bug, Pill, Droplets, CloudLightning, Activity, LineChart, Bell, Mic, Camera, Brain, ShieldCheck, CloudRain, Sprout, Play, X, ChevronRight, Loader2 } from "lucide-react";
import { signInAnonymously } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuthStore } from "../lib/useAuthStore";
import { LanguageSelector } from "../components/ui/LanguageSelector";
import { useTranslation } from "react-i18next";

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 2000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export function LandingPage() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleTryGuest = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      navigate('/dashboard');
      return;
    }
    try {
      setIsAuthenticating(true);
      const credential = await signInAnonymously(auth);
      const token = await credential.user.getIdToken();
      
      // Update store immediately to prevent race condition redirection to /login
      useAuthStore.getState().setUser(credential.user);
      useAuthStore.getState().setToken(token);
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Guest login failed", error);
      
      // If it's an operation-not-allowed or admin-restricted-operation error, give a helpful message
      if (error.code === 'auth/operation-not-allowed' || error.code === 'auth/admin-restricted-operation') {
        alert("Anonymous authentication is not enabled in Firebase.\n\nPlease go to your Firebase Console -> Authentication -> Sign-in methods, and enable 'Anonymous'. Then click Save.");
      } else {
        alert(`Failed to start guest trial: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-mint-200 selection:text-mint-900 w-full overflow-x-hidden">
      
      {/* Navbar - Glass Strong */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <img src="/logo.jpg" alt="AI Crop Doctor Logo" className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover shadow-md group-hover:scale-105 transition-transform" />
              <span className="font-extrabold text-lg sm:text-xl text-slate-800 whitespace-nowrap hidden sm:block tracking-tight">AI Crop Doctor</span>
            </Link>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1 min-w-0">
              <a href="#features" className="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap text-slate-500 hover:text-mint-700 hover:bg-mint-50 transition-all">{t('nav.features')}</a>
              <a href="#how-it-works" className="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap text-slate-500 hover:text-mint-700 hover:bg-mint-50 transition-all">{t('nav.howItWorks')}</a>
              <a href="#stats" className="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap text-slate-500 hover:text-mint-700 hover:bg-mint-50 transition-all">{t('nav.stats')}</a>
              <a href="#blog" className="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap text-slate-500 hover:text-mint-700 hover:bg-mint-50 transition-all">{t('nav.blog')}</a>
              <a href="#faq" className="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap text-slate-500 hover:text-mint-700 hover:bg-mint-50 transition-all">{t('nav.faq')}</a>
            </div>
            
            {/* Right side CTA & Translation */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="hidden lg:block">
                <LanguageSelector />
              </div>
              {!user && (
                <Link to="/login" className="hidden sm:inline-flex items-center px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap text-slate-600 bg-white/70 border border-slate-200 hover:border-mint-300 hover:text-mint-700 hover:bg-mint-50 transition-all">
                  {t('nav.signIn')}
                </Link>
              )}
              <button 
                onClick={handleTryGuest}
                disabled={isAuthenticating}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-mint-500 hover:bg-mint-600 text-white font-bold text-sm whitespace-nowrap shadow-lg shadow-mint-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isAuthenticating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {user ? t('nav.goToDashboard') : t('nav.tryOnline')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex items-center min-h-[90vh]">
        {/* Background blobs matching the target site */}
        <div className="absolute top-1/4 -right-64 w-[600px] h-[600px] bg-gradient-to-br from-mint-100 to-mint-200 rounded-full blur-[80px] opacity-70 animate-pulse pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-64 w-[600px] h-[600px] bg-gradient-to-tr from-peach-200 to-peach-300 rounded-full blur-[80px] opacity-60 pointer-events-none"></div>
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-b from-lavender-200 to-lavender-100 rounded-full blur-[100px] opacity-50 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Text Content */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center lg:text-left space-y-6 sm:space-y-8"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-white/50 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-mint-500 animate-pulse"></span>
                <span className="text-sm font-bold text-slate-600 tracking-wide">Your plants deserve the best care</span>
              </div>
              
              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight text-slate-800 drop-shadow-sm">
                Detect Crop Diseases Early.<br/>
                <span className="bg-gradient-to-r from-mint-500 via-mint-400 to-lavender-400 bg-clip-text text-transparent gradient-animate">
                  Get AI Treatment.
                </span>
              </h1>
              
              {/* Subtitle */}
              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-slate-500 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
                {t('hero.subtitle')}
              </p>
              
              {/* Web CTA Buttons */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 justify-center lg:justify-start pt-2">
                <button 
                  onClick={handleTryGuest}
                  disabled={isAuthenticating}
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-xl hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isAuthenticating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                  {user ? t('nav.goToDashboard') : t('hero.cta')}
                  {!isAuthenticating && <ChevronRight className="ml-2 h-5 w-5" />}
                </button>
                <button onClick={() => setIsDemoOpen(true)} className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-bold text-lg border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
                  <Play className="mr-2 h-5 w-5 text-mint-500 fill-mint-500" />
                  {t('hero.secondary')}
                </button>
              </div>
            </motion.div>

            {/* Mockup Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mx-auto w-full max-w-md lg:max-w-full drop-shadow-2xl"
            >
              <div className="relative rounded-[3rem] overflow-hidden border-[8px] border-white shadow-2xl bg-white">
                <img src="/hero-mockup.png" alt="App interface mockup showing AI scanning a leaf" className="w-full h-auto object-cover" />
              </div>
              {/* Floating element for depth */}
              <div className="absolute -left-8 top-1/4 bg-white p-4 rounded-2xl shadow-xl border border-mint-50 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="w-10 h-10 rounded-full bg-mint-100 flex items-center justify-center text-mint-600">
                  <CheckCircleIcon />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">Diagnosis</p>
                  <p className="text-sm font-black text-slate-800">Healthy Leaf</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 text-center">
            <span className="text-mint-600 font-extrabold tracking-widest uppercase text-xs">{t('landing.howItWorks.badge')}</span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight text-slate-800">
              {t('landing.howItWorks.title')}
            </h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto font-medium">{t('landing.howItWorks.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {[
              { icon: Camera, title: t('landing.howItWorks.step1.title'), desc: t('landing.howItWorks.step1.desc') },
              { icon: Brain, title: t('landing.howItWorks.step2.title'), desc: t('landing.howItWorks.step2.desc') },
              { icon: ShieldCheck, title: t('landing.howItWorks.step3.title'), desc: t('landing.howItWorks.step3.desc') }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                className="flex flex-col text-center items-center group"
              >
                <div className="relative mb-8">
                  <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-mint-50 text-mint-500 group-hover:scale-110 group-hover:bg-mint-100 transition-all duration-300">
                    <step.icon className="h-12 w-12" strokeWidth={2.5} />
                  </div>
                  <div className="absolute -top-4 -right-4 h-10 w-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-black text-lg shadow-lg border-4 border-white">
                    {i + 1}
                  </div>
                </div>
                <h3 className="mb-3 text-2xl font-black text-slate-800">{step.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-lavender-100/50 to-transparent rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="mb-20 text-center">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-800">
              {t('landing.features.title')}
            </h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: ScanLine, title: t('landing.features.f1.title'), desc: t('landing.features.f1.desc') },
              { icon: Bug, title: t('landing.features.f2.title'), desc: t('landing.features.f2.desc') },
              { icon: Pill, title: t('landing.features.f3.title'), desc: t('landing.features.f3.desc') },
              { icon: Droplets, title: t('landing.features.f4.title'), desc: t('landing.features.f4.desc') },
              { icon: CloudLightning, title: t('landing.features.f5.title'), desc: t('landing.features.f5.desc') },
              { icon: LineChart, title: t('landing.features.f6.title'), desc: t('landing.features.f6.desc') }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.1, duration: 0.5 }}
                className="flex flex-col items-start p-8 rounded-3xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-mint-100 to-mint-50 text-mint-600 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-8 w-8" strokeWidth={2} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-800">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="stats" className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1592841200221-a6898f307baa?q=80&w=2000&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: t('landing.stats.acc'), value: 95, suffix: "%+" },
              { label: t('landing.stats.crops'), value: 50, suffix: "+" },
              { label: t('landing.stats.disease'), value: 200, suffix: "+" },
              { label: t('landing.stats.monitoring'), value: 24, suffix: "/7" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex flex-col items-center justify-center p-6"
              >
                <div className="text-5xl md:text-6xl font-black text-white mb-4 drop-shadow-md">
                  {stat.value === 24 ? "24/7" : <AnimatedCounter value={stat.value} suffix={stat.suffix} />}
                </div>
                <div className="text-mint-400 font-bold text-sm md:text-base tracking-widest uppercase">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}

      {/* ── Blog Section ── */}
      <section id="blog" className="py-24 bg-slate-50 relative overflow-hidden w-full">
        {/* Subtle glow matching Features section */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-bl from-emerald-100/40 to-transparent rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold uppercase tracking-widest mb-4 border border-emerald-100">{t('landing.blog.tag')}</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              {t('landing.blog.title1')} <span className="text-emerald-600">{t('landing.blog.title2')}</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">{t('landing.blog.subtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {(t('landing.blog.posts', { returnObjects: true }) as any[]).map((post, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={i === 0 ? "/blog-disease.jpg" : i === 1 ? "/blog-farming.jpg" : "/blog-ai.jpg"}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold border ${i === 0 ? "bg-red-50 text-red-600 border-red-100" : i === 1 ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-blue-50 text-blue-600 border-blue-100"}`}>{post.tag}</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium mb-3">
                    <span>{post.date}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg leading-snug mb-3 group-hover:text-emerald-700 transition-colors">{post.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-5 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {post.author[0]}
                      </div>
                      <span className="text-xs font-semibold text-slate-600">{post.author}</span>
                    </div>
                    <span className="text-emerald-600 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                      {t('common.read')} <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/blog" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 text-slate-700 font-semibold hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-all">
              {t('landing.blog.viewAll')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section id="faq" className="py-24 relative overflow-hidden w-full" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 30%, #047857 60%, #0f766e 100%)' }}>
        {/* Decorative blobs */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #34d399, transparent 70%)' }} />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #2dd4bf, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, #a7f3d0, transparent 70%)' }} />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-emerald-200 text-sm font-bold uppercase tracking-widest mb-4 border border-white/20">{t('landing.faq.tag')}</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              {t('landing.faq.title1')} <span className="text-emerald-300">{t('landing.faq.title2')}</span>
            </h2>
            <p className="text-emerald-100/80 text-lg max-w-xl mx-auto">{t('landing.faq.subtitle')}</p>
          </motion.div>

          <FAQAccordion />

          <div className="text-center mt-12">
            <p className="text-emerald-200/70 text-sm mb-4">{t('landing.faq.stillHaveQuestions')}</p>
            <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-emerald-800 hover:bg-emerald-50 font-semibold shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5">
              {t('landing.faq.contactTeam')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-12 w-full text-center">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6 group">
          <img src="/logo.jpg" alt="AI Crop Doctor Logo" className="h-8 w-8 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform" />
          <span className="font-extrabold text-xl text-slate-800 tracking-tight">AI Crop Doctor</span>
        </Link>
        <p className="text-slate-500 font-medium">{t('landing.footer.copy')}</p>
      </footer>


      {/* Video Demo Modal */}
      <AnimatePresence>
        {isDemoOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setIsDemoOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] bg-slate-900 shadow-2xl border border-slate-700"
            >
              <div className="absolute right-4 top-4 z-10">
                <button
                  onClick={() => setIsDemoOpen(false)}
                  className="rounded-full bg-black/50 p-2 text-white hover:bg-black/80 transition-colors backdrop-blur-md"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="relative aspect-video w-full flex items-center justify-center">
                <iframe 
                  className="absolute inset-0 h-full w-full"
                  src="https://www.youtube.com/embed/AcukSILlvuU?autoplay=1&mute=0&start=0&end=10&rel=0" 
                  title="Smart Farming Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


function CheckCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

const FAQ_ITEMS = []; // We will get items from translation now


function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  const { t } = useTranslation();
  const faqItems = (t('landing.faq.items', { returnObjects: true }) as any[]);
  return (
    <div className="space-y-3">
      {faqItems.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
          className={`rounded-2xl border transition-all duration-200 overflow-hidden backdrop-blur-sm ${
            open === i
              ? "border-white/30 bg-white/20 shadow-lg shadow-black/10"
              : "border-white/15 bg-white/10 hover:bg-white/15 hover:border-white/25"
          }`}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
          >
            <span className="font-semibold text-base text-white">
              {item.q}
            </span>
            <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
              open === i
                ? "bg-white text-emerald-700 rotate-45"
                : "bg-white/20 text-white"
            }`}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <p className="px-6 pb-5 text-emerald-100/90 leading-relaxed">{item.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}



