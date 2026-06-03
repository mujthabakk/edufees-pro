import { SuperAdminLayout } from "@/modules/super-admin/_layout";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <SuperAdminLayout>{children}</SuperAdminLayout>;
}
