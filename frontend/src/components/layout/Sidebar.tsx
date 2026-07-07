import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  ScanLine, 
  History, 
  CloudRain, 
  Settings, 
  LogOut,
  Sprout,
  Menu,
  X
} from "lucide-react";
import { useAuthStore } from "../../lib/useAuthStore";
import { cn } from "../../lib/utils";
import { useTranslation } from "react-i18next";

export function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean, setMobileOpen: (open: boolean) => void }) {
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const { t } = useTranslation();
  
  const navItems = [
    { name: t('sidebar.dashboard'), path: "/dashboard", icon: LayoutDashboard },
    { name: t('sidebar.analyze'), path: "/analyze", icon: ScanLine },
    { name: t('sidebar.history'), path: "/history", icon: History },
    { name: t('sidebar.weather'), path: "/weather", icon: CloudRain },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-xl border-r border-slate-200 w-64 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-mint-400 to-mint-600 flex items-center justify-center text-white shadow-lg shadow-mint-500/20 group-hover:shadow-mint-500/40 transition-all group-hover:scale-105">
            <Sprout className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            AI Crop Doctor
          </span>
        </Link>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200",
                isActive 
                  ? "bg-mint-50 text-mint-700 shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-mint-600" : "text-slate-400")} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-mint-100 text-mint-700 flex items-center justify-center font-bold text-sm">
              {user.displayName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user.displayName || 'User'}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user.email}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => {
            logout();
            setMobileOpen(false);
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 opacity-80" />
          {t('sidebar.signOut')}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-50">
        <NavContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <NavContent />
      </div>
    </>
  );
}
