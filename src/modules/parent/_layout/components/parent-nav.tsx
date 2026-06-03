"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GraduationCap, Home, CreditCard, FileText, User, Bell, LogOut } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/parent/dashboard", icon: Home },
  { label: "Fee Details", href: "/parent/fees", icon: CreditCard },
  { label: "Invoices", href: "/parent/invoices", icon: FileText },
  { label: "Profile", href: "/parent/profile", icon: User },
];

export function ParentNav() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">EduFees Pro</span>
        </div>
        <nav className="flex gap-1">
          {navLinks.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-teal-50 text-teal-700" : "text-gray-600 hover:text-teal-700 hover:bg-teal-50"}`}>
                <Icon className="w-4 h-4" />{label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-gray-400 hover:text-gray-600 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>
          <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold">S</div>
          <button onClick={() => router.push("/")} className="p-1.5 text-gray-400 hover:text-red-500" title="Sign Out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
