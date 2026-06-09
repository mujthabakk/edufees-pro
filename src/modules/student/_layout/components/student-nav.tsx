"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GraduationCap, Home, CreditCard, FileText, User, Bell, LogOut } from "lucide-react";

const NAV = [
  { label: "Home",     href: "/student/dashboard", icon: Home },
  { label: "My Fees",  href: "/student/fees",      icon: CreditCard },
  { label: "Invoices", href: "/student/invoices",   icon: FileText },
  { label: "Profile",  href: "/student/profile",    icon: User },
];

export function StudentNav() {
  const pathname = usePathname();
  const router   = useRouter();

  return (
    <>
      {/* Top header */}
      <header className="bg-indigo-700 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">EduFees Pro</span>
              <span className="hidden sm:inline text-indigo-300 text-xs ml-2">Student Portal</span>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-1">
            {NAV.map(({ label, href, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link key={href} href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-white/20 text-white" : "text-indigo-200 hover:text-white hover:bg-white/10"}`}>
                  <Icon className="w-4 h-4" />{label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button className="p-1.5 text-indigo-200 hover:text-white relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-400 rounded-full" />
            </button>
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
            <button onClick={() => router.push("/")} className="hidden md:block p-1.5 text-indigo-200 hover:text-red-300" title="Sign Out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 flex safe-bottom">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${active ? "text-indigo-700" : "text-gray-400"}`}>
              <Icon className={`w-5 h-5 ${active ? "text-indigo-600" : "text-gray-400"}`} />
              {label}
              {active && <span className="w-1 h-1 bg-indigo-600 rounded-full" />}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
