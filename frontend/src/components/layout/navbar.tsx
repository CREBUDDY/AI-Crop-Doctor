import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Leaf, Bell, Settings, ArrowLeft } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../lib/useAuthStore";

export function Navbar() {
  const { role, user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  const showBackButton = location.pathname !== "/";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <button 
              onClick={() => navigate(-1)} 
              className="mr-1 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
              title="Go Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <img src="/logo.jpg" alt="AI Crop Doctor Logo" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform" />
            <span className="text-xl font-bold tracking-tight text-gray-900 hidden sm:block">
              AI Crop Doctor
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              cn(
                "text-sm font-medium transition-colors hover:text-primary-600",
                isActive ? "text-primary-600" : "text-gray-600"
              )
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              cn(
                "text-sm font-medium transition-colors hover:text-primary-600",
                isActive ? "text-primary-600" : "text-gray-600"
              )
            }
          >
            History
          </NavLink>
          <NavLink
            to="/weather"
            className={({ isActive }) =>
              cn(
                "text-sm font-medium transition-colors hover:text-primary-600",
                isActive ? "text-primary-600" : "text-gray-600"
              )
            }
          >
            Weather
          </NavLink>
        </nav>

        <div className="flex items-center gap-4">
          {role === 'admin' && (
            <Link 
              to="/admin/dashboard" 
              className="hidden md:flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full"
            >
              <Settings className="h-4 w-4" />
              Admin Panel
            </Link>
          )}
          <Link
            to="/notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 border-2 border-white" />
          </Link>
          <Link to="/profile" className="hidden md:block h-8 w-8 rounded-full bg-gray-200 border border-gray-300 overflow-hidden hover:opacity-80 transition">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'Felix'}`} alt="avatar" />
          </Link>
        </div>
      </div>
    </header>
  );
}
