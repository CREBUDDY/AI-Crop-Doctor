import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Mail, ArrowLeft } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import toast from "react-hot-toast";

export function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setIsSent(true);
      toast.success("Password reset link sent to your email");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl shadow-gray-200/50"
      >
        <div className="bg-primary-500 p-8 text-center text-white relative">
          <Link to="/login" className="absolute left-4 top-4 rounded-full p-2 hover:bg-white/20 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Link to="/" className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm shadow-md hover:scale-105 transition-transform overflow-hidden cursor-pointer mt-4">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </Link>
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="mt-1 text-primary-100">We'll send you a recovery link</p>
        </div>
        
        <div className="p-8">
          {!isSent ? (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <Input 
                  type="email" 
                  placeholder="Enter your registered email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="h-5 w-5" />}
                  required
                />
              </div>

              <Button type="submit" className="mt-6 w-full" isLoading={isLoading}>
                Send Reset Link
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <Mail className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Check your email</h3>
              <p className="text-sm text-gray-600">
                We've sent a password reset link to <br />
                <span className="font-medium text-gray-900">{email}</span>
              </p>
              <Button className="w-full mt-4" variant="outline" onClick={() => setIsSent(false)}>
                Try another email
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
