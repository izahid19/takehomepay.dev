"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calculator as CalcIcon } from "lucide-react";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="w-full top-0 z-50 absolute lg:flex lg:items-center lg:px-8 lg:py-4">
      <div className="flex max-w-5xl mx-auto w-full items-center relative justify-between h-16 px-4 p-2 bg-zinc-950 border border-neutral-800 rounded-b-xl lg:rounded-xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <CalcIcon className="h-5 w-5 text-primary" />
          <span className="text-xl font-bold text-white tracking-tight">
            takehomepay.dev
          </span>
        </Link>

        {/* Right Side Actions */}
        <nav className="flex items-center gap-3">
          <Link href="/pricing">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-gray-300 hover:text-white hover:bg-zinc-800/80 ${
                pathname === "/pricing" ? "text-primary bg-primary/10" : ""
              }`}
            >
              Pricing
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
