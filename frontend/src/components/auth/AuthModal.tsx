import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  linkWithPopup, 
  GoogleAuthProvider, 
  linkWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuthStore } from '../../lib/useAuthStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X, Sparkles, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export function AuthModal({ isOpen, onClose, title, subtitle }: AuthModalProps) {
  const { t } = useTranslation();
  const { user, isGuest } = useAuthStore();
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setError('');
      const provider = new GoogleAuthProvider();
      
      if (isGuest && user) {
        await linkWithPopup(user, provider);
        // Force-refresh so the new Google provider is embedded in the JWT
        await user.getIdToken(true);
        // Small delay to let Firebase propagate the newly linked identity
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        throw new Error("Invalid guest state");
      }
      
      await api.post('/auth/sync');
      onClose();
      // Hard reload to refresh all user state cleanly
      window.location.href = '/dashboard';
    } catch (err: any) {
      if (err.code === 'auth/credential-already-in-use') {
         setError("This Google account is already registered. Please log in directly.");
      } else {
         setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      if (isGuest && user) {
        if (isLogin) {
          setError("To log into an existing account, please log out of Guest Mode first.");
          return;
        } else {
          const credential = EmailAuthProvider.credential(email, password);
          await linkWithCredential(user, credential);
          // Force-refresh so the new email provider is embedded in the JWT
          await user.getIdToken(true);
          // Small delay to let Firebase propagate the newly linked identity
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      await api.post('/auth/sync');
      onClose();
      // Hard reload to refresh all user state cleanly
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative w-full max-w-[420px] bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/20"
          >
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />

            <button 
              onClick={onClose}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-900 bg-white/50 hover:bg-white/80 backdrop-blur-sm rounded-full transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="relative p-8">
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-emerald-100/50">
                  <Sparkles className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                  {title || "Unlock Premium"}
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {subtitle || "Create your free account to save your progress and access unlimited crop analysis forever."}
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-red-50/80 border border-red-100 text-red-600 text-sm text-center font-medium backdrop-blur-sm"
                >
                  {error}
                </motion.div>
              )}

              <Button 
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full h-12 mb-6 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm rounded-xl font-medium flex items-center justify-center gap-3 transition-all hover:shadow-md"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200/60"></div>
                </div>
                <div className="relative flex justify-center text-xs font-medium uppercase tracking-wider">
                  <span className="px-3 bg-white text-gray-400">Or use email</span>
                </div>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-white/50 backdrop-blur-sm border-gray-200 rounded-xl focus:bg-white transition-colors"
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-white/50 backdrop-blur-sm border-gray-200 rounded-xl focus:bg-white transition-colors"
                  required
                />
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-lg shadow-emerald-600/20 transition-all hover:shadow-emerald-600/30 group"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Please wait...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {isLogin ? "Sign In" : "Create Account"}
                      <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
