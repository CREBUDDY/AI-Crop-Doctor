import { motion } from "framer-motion";
import { User, Settings, MapPin, LogOut, ChevronRight, HelpCircle, ShieldCheck, Globe, Ruler, Sprout } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useAuthStore } from "../../lib/useAuthStore";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "../../components/ui/card";

export function ProfilePage() {
  const { user, role, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 pb-24 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Profile</h1>
        {role === 'admin' && (
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full text-sm font-semibold border border-emerald-200">
            <ShieldCheck className="w-4 h-4" /> Administrator
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Basic Info */}
        <div className="md:col-span-1 space-y-6">
          <Card className="p-8 text-center border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-primary-400 to-emerald-600" />
            
            <div className="relative mx-auto h-32 w-32 mt-4 mb-4 rounded-full border-4 border-white shadow-xl bg-white overflow-hidden">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'Farmer'}`} 
                alt="Profile" 
                className="h-full w-full object-cover bg-primary-50"
              />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900">{user?.displayName || "John Farmer"}</h2>
            <div className="flex items-center justify-center text-sm text-gray-500 mt-2 font-medium">
              <MapPin className="mr-1 h-4 w-4 text-primary-500" />
              {user?.email || "Maharashtra, India"}
            </div>
          </Card>

          <Card className="p-1 border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl bg-white overflow-hidden">
            <Button variant="ghost" className="w-full h-14 justify-start text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-2xl" onClick={handleLogout}>
              <LogOut className="mr-3 h-5 w-5" />
              <span className="font-semibold text-base">Sign Out</span>
            </Button>
          </Card>
        </div>

        {/* Right Column: Settings & Details */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Farm Details */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 ml-1">Farm Information</h3>
            <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl bg-white overflow-hidden">
              <div className="p-4 hover:bg-gray-50 flex items-center justify-between cursor-pointer transition-colors border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Sprout className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 block text-lg">My Farms</span>
                    <span className="text-sm text-gray-500">Tomato Field A, Wheat Field B</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="p-4 hover:bg-gray-50 flex items-center justify-between cursor-pointer transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                    <Ruler className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 block text-lg">Farm Size</span>
                    <span className="text-sm text-gray-500">12.5 Acres Total</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </Card>
          </div>

          {/* App Preferences */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 ml-1">Preferences</h3>
            <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl bg-white overflow-hidden">
              <div className="p-4 hover:bg-gray-50 flex items-center justify-between cursor-pointer transition-colors border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 block text-lg">Language</span>
                    <span className="text-sm text-gray-500">English (Change to Hindi/Marathi)</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="p-4 hover:bg-gray-50 flex items-center justify-between cursor-pointer transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <Settings className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 block text-lg">Account Settings</span>
                    <span className="text-sm text-gray-500">Password, Notifications</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </Card>
          </div>

          {/* Admin / Support */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 ml-1">More</h3>
            <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl bg-white overflow-hidden">
              {role === 'admin' && (
                <Link to="/admin/dashboard" className="p-4 hover:bg-gray-50 flex items-center justify-between cursor-pointer transition-colors block border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-900 text-white rounded-xl">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 block text-lg">Admin Dashboard</span>
                      <span className="text-sm text-gray-500">Manage users and platform data</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </Link>
              )}
              <div className="p-4 hover:bg-gray-50 flex items-center justify-between cursor-pointer transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                    <HelpCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 block text-lg">Help & Support</span>
                    <span className="text-sm text-gray-500">Contact our agronomy team</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
