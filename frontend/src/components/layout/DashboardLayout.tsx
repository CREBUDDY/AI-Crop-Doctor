import { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Menu, Bell, LogOut, User } from "lucide-react";
import { useAuthStore } from "../../lib/useAuthStore";
import { auth } from "../../lib/firebase";
import { LanguageSelector } from "../ui/LanguageSelector";
import { useFarmStore } from "../../lib/useFarmStore";
import { FarmSetupModal } from "../farms/FarmSetupModal";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, isGuest, logout } = useAuthStore();
  const { farmsList, activeFarm, setFarms } = useFarmStore();
  const navigate = useNavigate();
  
  // Close dropdowns when clicking outside
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    logout();
    navigate("/");
  };

  const { isLoading: isLoadingFarms } = useQuery({
    queryKey: ['user-farms'],
    queryFn: async () => {
      const res = await api.get('/farms/');
      setFarms(res.data);
      return res.data;
    },
    enabled: !!user
  });

  // Only show modal if finished loading and no farms exist
  const showSetupModal = !isLoadingFarms && !!user && farmsList.length === 0;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 transition-all duration-300">
        {/* Top Header */}
        <header className="h-16 flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-slate-800 hidden sm:block">
              {isGuest ? (
                <span className="flex items-center gap-2">
                  Welcome, Guest 👋
                  <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wide">Trial Mode</span>
                </span>
              ) : (
                <>Welcome back, {user?.displayName?.split(' ')[0] || 'Farmer'} 👋</>
              )}
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {activeFarm && (
              <div className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100 text-sm font-medium mr-2">
                <MapPin className="w-4 h-4" />
                {activeFarm.village || activeFarm.name}
              </div>
            )}
            
            {/* Language Selector */}
            <LanguageSelector />

            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></span>
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h3 className="font-semibold text-slate-800">Notifications</h3>
                      <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-medium">1 New</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      <div className="p-4 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-800 font-medium">Welcome to AI Crop Doctor!</p>
                          <p className="text-xs text-slate-500 mt-1">Get started by analyzing your first crop image or setting up your farm profile.</p>
                          <p className="text-xs text-slate-400 mt-2">Just now</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="relative" ref={profileRef}>
              <div 
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className={`w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-sm border border-emerald-200 cursor-pointer transition-transform hover:scale-105 ${showProfileMenu ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
              >
                {isGuest ? 'G' : (user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U')}
              </div>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                      <p className="font-semibold text-slate-800 truncate">
                        {isGuest ? 'Guest User' : (user?.displayName || 'Farmer')}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {isGuest ? 'Trial Mode' : user?.email}
                      </p>
                    </div>
                    <div className="p-2">
                      <button 
                        onClick={() => {
                          navigate("/profile");
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <User className="w-4 h-4" /> Profile Settings
                      </button>
                      <div className="h-px bg-slate-100 my-1 mx-2"></div>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 rounded-xl hover:bg-red-50 transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4" /> Log out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </main>
      </div>
      <FarmSetupModal isOpen={showSetupModal} />
    </div>
  );
}
