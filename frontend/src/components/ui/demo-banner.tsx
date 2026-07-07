import { Link } from "react-router-dom";
import { Info } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 sm:px-6 lg:px-8 w-full z-50">
      <div className="flex items-center justify-center gap-x-6 max-w-7xl mx-auto">
        <p className="text-sm/6 text-amber-900 flex items-center gap-2">
          <Info className="h-4 w-4" />
          <strong className="font-semibold">Demo Mode</strong>
          <svg viewBox="0 0 2 2" className="hidden sm:inline mx-2 h-0.5 w-0.5 fill-current" aria-hidden="true">
            <circle cx={1} cy={1} r={1} />
          </svg>
          You are viewing sample data. 
          <Link to="/login" className="ml-2 font-bold hover:underline underline-offset-2">
            Log in
          </Link>
          <span className="mx-1">or</span>
          <Link to="/register" className="font-bold hover:underline underline-offset-2">
            Sign up
          </Link>
          <span className="ml-1">to track your own farm.</span>
        </p>
      </div>
    </div>
  );
}
