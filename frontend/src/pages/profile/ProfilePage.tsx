import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Settings, LogOut, HelpCircle, ShieldCheck, Globe, X, Mail,
  Lock, Bell, CheckCircle, ExternalLink, ChevronRight, Phone,
  Zap, BarChart2, AlertTriangle, Trash2, Crown, ScanLine
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useAuthStore } from "../../lib/useAuthStore";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "../../components/ui/card";
import { auth } from "../../lib/firebase";
import {
  updateProfile, updatePassword, reauthenticateWithCredential,
  EmailAuthProvider, deleteUser, GoogleAuthProvider, reauthenticateWithPopup
} from "firebase/auth";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { LanguageSelector } from "../../components/ui/LanguageSelector";

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

// ----- Settings Row -----
function SettingsRow({ icon, iconBg, iconColor, title, subtitle, onClick, right }: {
  icon: React.ReactNode; iconBg: string; iconColor: string;
  title: string; subtitle: string; onClick?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      className={`p-4 flex items-center justify-between last:border-0 border-b border-gray-100 ${onClick ? "hover:bg-gray-50 cursor-pointer transition-colors" : ""}`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 ${iconBg} ${iconColor} rounded-xl`}>{icon}</div>
        <div>
          <span className="font-semibold text-gray-900 block">{title}</span>
          <span className="text-sm text-gray-500">{subtitle}</span>
        </div>
      </div>
      {right ?? (onClick && <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />)}
    </div>
  );
}

export function ProfilePage() {
  const { user, role, logout, isGuest } = useAuthStore();
  const navigate = useNavigate();

  // Modal states
  const [showAccount, setShowAccount] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Account Settings form
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [accountMsg, setAccountMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [accountLoading, setAccountLoading] = useState(false);

  // Delete account
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Fetch scan history to show usage
  const { data: history = [] } = useQuery({
    queryKey: ["history-for-profile"],
    queryFn: async () => {
      const res = await api.get("/analyze/history/list");
      return res.data;
    },
    enabled: !!user,
  });

  const scansUsed = history.length;
  const GUEST_LIMIT = 2;

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

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError("");
    try {
      if (user) {
        const providerId = user.providerData?.[0]?.providerId;

        if (providerId === "password") {
          // Email/password: re-auth with credential
          if (!deletePassword) {
            setDeleteError("Please enter your password to confirm.");
            setDeleteLoading(false);
            return;
          }
          const credential = EmailAuthProvider.credential(user.email!, deletePassword);
          await reauthenticateWithCredential(user, credential);
        } else if (providerId === "google.com") {
          // Google sign-in: re-auth with popup
          const provider = new GoogleAuthProvider();
          await reauthenticateWithPopup(user, provider);
        }
        // Now safe to delete
        await deleteUser(user);
        logout();
        navigate("/");
      }
    } catch (err: any) {
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setDeleteError("Incorrect password. Please try again.");
      } else if (err.code === "auth/popup-closed-by-user") {
        setDeleteError("Re-authentication cancelled. Please try again.");
      } else {
        setDeleteError(err.message || "Failed to delete account.");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6 pb-24 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Profile Settings</h1>
        {role === "admin" && (
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full text-sm font-semibold border border-emerald-200">
            <ShieldCheck className="w-4 h-4" /> Administrator
          </div>
        )}
      </div>

      {/* User Card */}
      <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden">
        <div className="flex items-center gap-4 p-5">
          <div className="relative flex-shrink-0">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || "Farmer"}`}
              alt="Profile"
              className="w-14 h-14 rounded-full border-2 border-emerald-100 bg-emerald-50"
            />
            {isGuest && (
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">GUEST</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-lg leading-tight truncate">
              {isGuest ? "Guest User" : (user?.displayName || "Farmer")}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {isGuest ? "Trial Mode — No account yet" : user?.email}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="flex-shrink-0 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl gap-2 text-sm font-semibold"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        </div>
      </Card>

      {/* ── Plan & Usage ── */}
      <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-gray-900 text-base">Plan & Usage</h2>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${isGuest ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
            {isGuest ? "GUEST" : "FREE"}
          </span>
        </div>

        <div className="divide-y divide-gray-50">
          {/* Scans */}
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ScanLine className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 font-medium">
                {isGuest ? "Trial scans used" : "Total scans done"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-sm">
                {isGuest ? `${scansUsed} of ${GUEST_LIMIT}` : scansUsed}
              </span>
              {isGuest && (
                <div className="flex gap-0.5">
                  {Array.from({ length: GUEST_LIMIT }).map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i < scansUsed ? "bg-emerald-500" : "bg-gray-200"}`} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Plan type */}
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 font-medium">Plan type</span>
            </div>
            <span className="font-bold text-gray-900 text-sm">
              {isGuest ? "Trial (No account)" : "Free — Unlimited scans"}
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="px-5 pb-5 pt-2 flex gap-3">
          {isGuest ? (
            <Button
              onClick={() => navigate("/analyze")}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold h-10 gap-2"
            >
              <Crown className="w-4 h-4" /> Create Free Account
            </Button>
          ) : (
            <div className="flex-1 flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <p className="text-sm text-emerald-700 font-medium">You have unlimited AI crop analysis on your free account.</p>
            </div>
          )}
        </div>
      </Card>

      {/* ── Language ── */}
      <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <span className="font-semibold text-gray-900 block">Language</span>
              <span className="text-sm text-gray-500">App display language</span>
            </div>
          </div>
          {/* Uses same LanguageSelector as the navbar — i18n works immediately */}
          <LanguageSelector />
        </div>
      </Card>

      {/* ── Preferences ── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 ml-1">Preferences</h2>
        <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden">
          <SettingsRow
            icon={<Settings className="h-5 w-5" />}
            iconBg="bg-purple-50" iconColor="text-purple-600"
            title="Account Settings"
            subtitle="Display name, password & security"
            onClick={isGuest ? undefined : () => setShowAccount(true)}
            right={isGuest ? (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Sign in required</span>
            ) : undefined}
          />
        </Card>
      </div>

      {/* ── More ── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 ml-1">More</h2>
        <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden">
          {role === "admin" && (
            <Link
              to="/admin/dashboard"
              className="p-4 hover:bg-gray-50 flex items-center justify-between cursor-pointer transition-colors block border-b border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-900 text-white rounded-xl">
                  <ShieldCheck className="h-5 w-5" />
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
            icon={<HelpCircle className="h-5 w-5" />}
            iconBg="bg-sky-50" iconColor="text-sky-600"
            title="Help & Support"
            subtitle="Contact our agronomy team"
            onClick={() => setShowSupport(true)}
          />
          <SettingsRow
            icon={<Bell className="h-5 w-5" />}
            iconBg="bg-orange-50" iconColor="text-orange-500"
            title="Notifications"
            subtitle="Manage alerts and reminders"
            onClick={() => navigate("/notifications")}
          />
        </Card>
      </div>

      {/* ── Danger Zone ── */}
      {!isGuest && (
        <div>
          <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3 ml-1">Danger Zone</h2>
          <Card className="border border-red-100 shadow-sm rounded-3xl bg-white overflow-hidden">
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-50 text-red-500 rounded-xl flex-shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">Delete Account</p>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    Permanently deletes your account, all crop scan history, reports and data. This action <strong>cannot be undone</strong>.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="mt-4 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl font-semibold gap-2 h-9"
                  >
                    <Trash2 className="w-4 h-4" /> Delete account
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── Account Settings Modal ── */}
      <AnimatePresence>
        {showAccount && (
          <Modal isOpen={showAccount} onClose={() => setShowAccount(false)} title="Account Settings">
            <div className="space-y-5">
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input value={user?.email || ""} disabled className="pl-10 h-11 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
              </div>

              {user?.providerData?.[0]?.providerId === "password" && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Change Password</p>
                  <div className="space-y-3">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" className="pl-10 h-11 rounded-xl" />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="pl-10 h-11 rounded-xl" />
                    </div>
                  </div>
                </div>
              )}

              {accountMsg && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${accountMsg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                  {accountMsg.type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <X className="w-4 h-4 flex-shrink-0" />}
                  {accountMsg.text}
                </div>
              )}

              <Button onClick={handleSaveAccount} disabled={accountLoading} className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold">
                {accountLoading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</span> : "Save Changes"}
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
              <a href="mailto:support@aicropdoctor.com" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-sky-50 border border-transparent hover:border-sky-100 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0"><Mail className="w-5 h-5" /></div>
                <div><p className="font-semibold text-gray-900">Email Support</p><p className="text-sm text-gray-500">support@aicropdoctor.com</p></div>
                <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-sky-500 ml-auto transition-colors" />
              </a>
              <Link to="/faq" onClick={() => setShowSupport(false)} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-sky-50 border border-transparent hover:border-sky-100 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0"><HelpCircle className="w-5 h-5" /></div>
                <div><p className="font-semibold text-gray-900">FAQ</p><p className="text-sm text-gray-500">Find answers to common questions</p></div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-sky-500 ml-auto transition-colors" />
              </Link>
              <Link to="/contact" onClick={() => setShowSupport(false)} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-sky-50 border border-transparent hover:border-sky-100 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0"><Phone className="w-5 h-5" /></div>
                <div><p className="font-semibold text-gray-900">Contact Us</p><p className="text-sm text-gray-500">Reach out to our agronomy team</p></div>
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

      {/* ── Delete Account Confirmation Modal ── */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Account">
            <div className="space-y-5">
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-100">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 leading-relaxed">
                  This will <strong>permanently delete</strong> your account, all crop scan history, AI reports and data across all devices. <strong>This cannot be undone.</strong>
                </p>
              </div>

              {user?.providerData?.[0]?.providerId === "password" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm your password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Enter your password to confirm"
                      className="pl-10 h-11 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {user?.providerData?.[0]?.providerId === "google.com" && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <p className="text-sm text-blue-700 font-medium">A Google sign-in popup will open to verify your identity.</p>
                </div>
              )}

              {deleteError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-sm text-red-600 font-medium">
                  <X className="w-4 h-4 flex-shrink-0" /> {deleteError}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1 rounded-xl h-11 font-semibold">
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 font-semibold gap-2"
                >
                  {deleteLoading
                    ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting...</span>
                    : <><Trash2 className="w-4 h-4" /> Delete forever</>
                  }
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
