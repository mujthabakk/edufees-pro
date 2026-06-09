"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, CreditCard, FileText, BarChart3, Bell, LogOut, GraduationCap, Phone, Tag, CalendarDays } from "lucide-react";

const nav = [
  { label: "Dashboard",   href: "/accountant/dashboard", icon: LayoutDashboard },
  { label: "Students",    href: "/accountant/students",  icon: Users },
  { label: "Payments",    href: "/accountant/payments",  icon: CreditCard },
  { label: "Invoices",    href: "/accountant/invoices",  icon: FileText },
  { label: "Coupons",     href: "/accountant/coupons",   icon: Tag },
  { label: "Academic",    href: "/accountant/academic",  icon: CalendarDays },
  { label: "Reports",     href: "/accountant/reports",   icon: BarChart3 },
  { label: "Call Log",    href: "/accountant/calls",     icon: Phone },
  { label: "Reminders",   href: "/accountant/reminders", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-gray-900 flex flex-col z-10">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
        <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm">EduFees Pro</p>
          <p className="text-gray-400 text-xs">Accountant Portal</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors", active ? "bg-green-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800")}>
              <Icon className="w-[18px] h-[18px] shrink-0" />{label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-gray-800 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold">RA</div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium">Ravi Accountant</p>
            <p className="text-gray-400 text-xs truncate">accounts@greenfield.edu</p>
          </div>
        </div>
        <button onClick={() => router.push("/")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 w-full transition-colors">
          <LogOut className="w-[18px] h-[18px] shrink-0" />Sign Out
        </button>
      </div>
    </aside>
  );
}
