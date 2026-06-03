import { Sidebar } from "./sidebar";
export function AccountantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">{children}</div>
    </div>
  );
}
