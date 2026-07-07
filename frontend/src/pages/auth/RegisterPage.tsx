import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Mail, Lock, User, MapPin, ArrowLeft } from "lucide-react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import toast from "react-hot-toast";

export function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: name
      });
      // In a real app, you would also save the state and name to your PostgreSQL database via an API call here.
      toast.success("Account created successfully");
      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 py-12">
      <Link to="/" className="absolute top-6 left-6 flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm hover:shadow transition-all z-10">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl shadow-gray-200/50"
      >
        <div className="bg-primary-500 p-8 text-center text-white">
          <Link to="/" className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm shadow-md hover:scale-105 transition-transform overflow-hidden cursor-pointer">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </Link>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="mt-1 text-primary-100">Join AI Crop Doctor today</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <Input 
                type="text" 
                placeholder="Enter your name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<User className="h-5 w-5" />}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input 
                type="email" 
                placeholder="Enter email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="h-5 w-5" />}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">State / Region</label>
              <Input 
                type="text" 
                placeholder="Enter your state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                icon={<MapPin className="h-5 w-5" />}
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <Input 
                type="password" 
                placeholder="Create a password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="h-5 w-5" />}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="mt-6 w-full" isLoading={isLoading}>
              Sign Up
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
