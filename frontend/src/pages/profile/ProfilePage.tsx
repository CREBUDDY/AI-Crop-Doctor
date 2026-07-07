import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Settings, MapPin, LogOut, ChevronRight, HelpCircle,
  ShieldCheck, Globe, Ruler, Sprout, X, Mail, Lock,
  Bell, Phone, CheckCircle, ExternalLink
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useAuthStore } from "../../lib/useAuthStore";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "../../components/ui/card";
import { auth } from "../../lib/firebase";
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { useFarmStore } from "../../lib/useFarmStore";

// ----- Modal Wrapper -----
function Modal({ isOpen, onClose, title, children }: {
  isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ type: "spring", duration: 0.4, bounce: 0.25 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
}

// ----- Row Item -----
function SettingsRow({ icon, iconBg, iconColor, title, subtitle, onClick }: {
  icon: React.ReactNode; iconBg: string; iconColor: string;
  title: string; subtitle: string; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="p-4 hover:bg-gray-50 flex items-center justify-between cursor-pointer transition-colors last:border-0 border-b border-gray-100"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 ${iconBg} ${iconColor} rounded-xl`}>{icon}</div>
        <div>
          <span className="font-semibold text-gray-900 block">{title}</span>
          <span className="text-sm text-gray-500">{subtitle}</span>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
    </div>
  );
}

export function ProfilePage() {
  const { user, role, logout } = useAuthStore();
  const { farmsList } = useFarmStore();
  const navigate = useNavigate();

  // Modal states
  const [showFarms, setShowFarms] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  // Account Settings form
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [accountMsg, setAccountMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [accountLoading, setAccountLoading] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    logout();
    navigate("/");
  };

  const handleSaveAccount = async () => {
    setAccountLoading(true);
    setAccountMsg(null);
    try {
      if (user) {
        if (displayName && displayName !== user.displayName) {
          await updateProfile(user, { displayName });
        }
        if (newPassword && currentPassword) {
          const credential = EmailAuthProvider.credential(user.email!, currentPassword);
          await reauthenticateWithCredential(user, credential);
          await updatePassword(user, newPassword);
        }
        setAccountMsg({ type: "success", text: "Profile updated successfully!" });
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch (err: any) {
      setAccountMsg({ type: "error", text: err.message || "Update failed." });
    } finally {
      setAccountLoading(false);
    }
  };

  const languages = [
    { code: "en", label: "English", native: "English" },
    { code: "hi", label: "Hindi", native: "हिंदी" },
    { code: "mr", label: "Marathi", native: "मराठी" },
    { code: "ta", label: "Tamil", native: "தமிழ்" },
    { code: "te", label: "Telugu", native: "తెలుగు" },
    { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
    { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
    { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  ];

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 pb-24 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Profile</h1>
        {role === "admin" && (
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full text-sm font-semibold border border-emerald-200">
            <ShieldCheck className="w-4 h-4" /> Administrator
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="md:col-span-1 space-y-6">
          <Card className="p-8 text-center border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600" />
            <div className="relative mx-auto h-32 w-32 mt-4 mb-4 rounded-full border-4 border-white shadow-xl bg-white overflow-hidden">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || "Farmer"}`}
                alt="Profile"
                className="h-full w-full object-cover bg-emerald-50"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{user?.displayName || "Farmer"}</h2>
            <div className="flex items-center justify-center text-sm text-gray-500 mt-2 font-medium">
              <Mail className="mr-1 h-4 w-4 text-emerald-500" />
              {user?.email || "—"}
            </div>
            {user?.phoneNumber && (
              <div className="flex items-center justify-center text-sm text-gray-500 mt-1 font-medium">
                <Phone className="mr-1 h-4 w-4 text-emerald-500" />
                {user.phoneNumber}
              </div>
            )}
          </Card>

          <Card className="p-1 border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl bg-white overflow-hidden">
            <Button
              variant="ghost"
              className="w-full h-14 justify-start text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-2xl"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span className="font-semibold text-base">Sign Out</span>
            </Button>
          </Card>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2 space-y-6">

          {/* Farm Info */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 ml-1">Farm Information</h3>
            <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl bg-white overflow-hidden">
              <SettingsRow
                icon={<Sprout className="h-6 w-6" />}
                iconBg="bg-emerald-50" iconColor="text-emerald-600"
                title="My Farms"
                subtitle={farmsList.length > 0 ? farmsList.map(f => f.name).join(", ") : "No farms added yet"}
                onClick={() => setShowFarms(true)}
              />
              <SettingsRow
                icon={<Ruler className="h-6 w-6" />}
                iconBg="bg-amber-50" iconColor="text-amber-600"
                title="Farm Size"
                subtitle={farmsList.length > 0 ? `${farmsList.length} farm(s) registered` : "Set up your farm first"}
                onClick={() => setShowFarms(true)}
              />
            </Card>
          </div>

          {/* Preferences */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 ml-1">Preferences</h3>
            <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl bg-white overflow-hidden">
              <SettingsRow
                icon={<Globe className="h-6 w-6" />}
                iconBg="bg-blue-50" iconColor="text-blue-600"
                title="Language"
                subtitle="English, Hindi, Marathi & more"
                onClick={() => setShowLanguage(true)}
              />
              <SettingsRow
                icon={<Settings className="h-6 w-6" />}
                iconBg="bg-purple-50" iconColor="text-purple-600"
                title="Account Settings"
                subtitle="Display name, password & more"
                onClick={() => setShowAccount(true)}
              />
            </Card>
          </div>

          {/* More */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 ml-1">More</h3>
            <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl bg-white overflow-hidden">
              {role === "admin" && (
                <Link
                  to="/admin/dashboard"
                  className="p-4 hover:bg-gray-50 flex items-center justify-between cursor-pointer transition-colors block border-b border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-900 text-white rounded-xl">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 block">Admin Dashboard</span>
                      <span className="text-sm text-gray-500">Manage users and platform data</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </Link>
              )}
              <SettingsRow
                icon={<HelpCircle className="h-6 w-6" />}
                iconBg="bg-sky-50" iconColor="text-sky-600"
                title="Help & Support"
                subtitle="Contact our agronomy team"
                onClick={() => setShowSupport(true)}
              />
            </Card>
          </div>
        </div>
      </div>

      {/* ── My Farms Modal ── */}
      <AnimatePresence>
        {showFarms && (
          <Modal isOpen={showFarms} onClose={() => setShowFarms(false)} title="My Farms">
            {farmsList.length === 0 ? (
              <div className="text-center py-8">
                <Sprout className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No farms added yet.</p>
                <Button
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                  onClick={() => { setShowFarms(false); navigate("/dashboard"); }}
                >
                  Add Farm from Dashboard
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {farmsList.map((farm: any) => (
                  <div key={farm.id} className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {farm.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{farm.name}</p>
                      <p className="text-sm text-gray-500">{farm.village || farm.city || "—"}</p>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full mt-2 rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  onClick={() => { setShowFarms(false); navigate("/dashboard"); }}
                >
                  Manage Farms on Dashboard
                </Button>
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Language Modal ── */}
      <AnimatePresence>
        {showLanguage && (
          <Modal isOpen={showLanguage} onClose={() => setShowLanguage(false)} title="Select Language">
            <div className="space-y-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    // Language change: dispatch i18n change event
                    document.dispatchEvent(new CustomEvent("changeLanguage", { detail: lang.code }));
                    setShowLanguage(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all group"
                >
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{lang.label}</p>
                    <p className="text-sm text-gray-500">{lang.native}</p>
                  </div>
                  <Globe className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                </button>
              ))}
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Account Settings Modal ── */}
      <AnimatePresence>
        {showAccount && (
          <Modal isOpen={showAccount} onClose={() => setShowAccount(false)} title="Account Settings">
            <div className="space-y-5">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="pl-10 h-11 rounded-xl"
                  />
                </div>
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={user?.email || ""}
                    disabled
                    className="pl-10 h-11 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
              </div>

              {user?.providerData?.[0]?.providerId === "password" && (
                <>
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Change Password</p>
                    <div className="space-y-3">
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Current password"
                          className="pl-10 h-11 rounded-xl"
                        />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="New password"
                          className="pl-10 h-11 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {accountMsg && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${accountMsg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                  {accountMsg.type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <X className="w-4 h-4 flex-shrink-0" />}
                  {accountMsg.text}
                </div>
              )}

              <Button
                onClick={handleSaveAccount}
                disabled={accountLoading}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold"
              >
                {accountLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : "Save Changes"}
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Help & Support Modal ── */}
      <AnimatePresence>
        {showSupport && (
          <Modal isOpen={showSupport} onClose={() => setShowSupport(false)} title="Help & Support">
            <div className="space-y-3">
              <a
                href="mailto:support@aicropdoctor.com"
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-sky-50 border border-transparent hover:border-sky-100 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Email Support</p>
                  <p className="text-sm text-gray-500">support@aicropdoctor.com</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-sky-500 ml-auto transition-colors" />
              </a>

              <Link
                to="/faq"
                onClick={() => setShowSupport(false)}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-sky-50 border border-transparent hover:border-sky-100 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">FAQ</p>
                  <p className="text-sm text-gray-500">Find answers to common questions</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-sky-500 ml-auto transition-colors" />
              </Link>

              <Link
                to="/contact"
                onClick={() => setShowSupport(false)}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-sky-50 border border-transparent hover:border-sky-100 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Contact Us</p>
                  <p className="text-sm text-gray-500">Reach out to our agronomy team</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-sky-500 ml-auto transition-colors" />
              </Link>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 mt-2">
                <Bell className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <p className="text-sm text-emerald-700 font-medium">Our team typically responds within 24 hours.</p>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
