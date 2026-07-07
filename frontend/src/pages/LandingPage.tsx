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
