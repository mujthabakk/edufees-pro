import { SchoolAdminLayout } from "@/modules/school-admin/_layout";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <SchoolAdminLayout>{children}</SchoolAdminLayout>;
}
