import { Layers, ShieldCheck } from "lucide-react";
import React from "react";

function Header() {
  return (
    <header className="border-b border-stone-300 bg-[#FBFBF3] px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-stone-900 text-white flex items-center justify-center font-bold text-lg rounded-md">
            <Layers className="w-5 h-5 text-amber-400" />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-stone-900">
              EnvDiff
            </h1>
            <p className="text-xs text-stone-600">
              Environment Variable Inspection Engine
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-100/80 border border-emerald-300 text-emerald-900 px-3 py-1.5 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>100% Client-Side • Secrets Never Leave Browser</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
