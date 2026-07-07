import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  linkWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword,
  linkWithCredential,
  EmailAuthProvider,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuthStore } from '../../lib/useAuthStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X } from 'lucide-react';
import { api } from '../../lib/api';

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
        // Link anonymous account to preserve data
        await linkWithPopup(user, provider);
      } else {
        // Fallback if not guest, shouldn't normally happen in this flow
        throw new Error("Invalid guest state");
      }
      
      // Sync the new role
      await api.post('/auth/sync');
      onClose();
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
          // You generally can't link to an existing account with just credentials directly if they already exist, 
          // without having the user sign in first. But standard flow is signup:
          setError("To log into an existing account, please log out of Guest Mode first. You can only create a new account to save guest data.");
          return;
        } else {
          // Link new email/password
          const credential = EmailAuthProvider.credential(email, password);
          await linkWithCredential(user, credential);
        }
      }
      
      await api.post('/auth/sync');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {title || "Save Your Progress"}
            </h2>
            <p className="text-gray-500">
              {subtitle || "Create a free account to unlock unlimited scans and save your crop history permanently."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <Button 
            onClick={handleGoogleAuth}
            disabled={loading}
            variant="outline" 
            className="w-full h-12 mb-6 font-medium"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12"
              required
            />
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 font-medium"
            >
              {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
            </Button>
          </form>

          {/* We hide the toggle since for guest merging, signup is what they need to do 
              If they already have an account, they shouldn't have started as a guest. */}
        </div>
      </div>
    </div>
  );
}
