import { Sidebar } from "./sidebar";
import { MobileMenuProvider } from "@/modules/shared/layout/mobile-menu-context";

export function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileMenuProvider>
      <div className="flex h-full">
        <Sidebar />
        <div className="flex-1 md:ml-64 flex flex-col min-h-screen min-w-0">{children}</div>
      </div>
    </MobileMenuProvider>
  );
}
