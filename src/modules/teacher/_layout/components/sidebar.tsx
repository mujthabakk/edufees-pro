"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, LogOut, GraduationCap, Bell, UserPlus } from "lucide-react";

const nav = [
  { label: "My Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
  { label: "My Students", href: "/teacher/students", icon: Users },
  { label: "Add Student", href: "/teacher/add-student", icon: UserPlus },
  { label: "Notifications", href: "/teacher/notifications", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-gray-900 flex flex-col z-10">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
        <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm">EduFees Pro</p>
          <p className="text-gray-400 text-xs">Teacher Portal</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors", active ? "bg-orange-500 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800")}>
              <Icon className="w-[18px] h-[18px] shrink-0" />{label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-gray-800 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">PT</div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium">Priya Teacher</p>
            <p className="text-gray-400 text-xs truncate">teacher@greenfield.edu</p>
          </div>
        </div>
        <button onClick={() => router.push("/")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 w-full transition-colors">
          <LogOut className="w-[18px] h-[18px] shrink-0" />Sign Out
        </button>
      </div>
    </aside>
  );
}
