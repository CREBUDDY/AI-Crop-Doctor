import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Menu, Bell } from "lucide-react";
import { useAuthStore } from "../../lib/useAuthStore";
import { LanguageSelector } from "../ui/LanguageSelector";
import { useFarmStore } from "../../lib/useFarmStore";
import { FarmSetupModal } from "../farms/FarmSetupModal";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { MapPin } from "lucide-react";

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isGuest } = useAuthStore();
  const { farmsList, activeFarm, setFarms } = useFarmStore();

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

            <button className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="w-9 h-9 rounded-full bg-mint-100 text-mint-700 flex items-center justify-center font-bold shadow-sm border border-mint-200 cursor-pointer hidden sm:flex">
              {isGuest ? 'G' : (user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U')}
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
