import { SchoolsDetailPage } from "@/modules/super-admin/schools-detail";

export const dynamicParams = false;

export async function generateStaticParams() {
  return ["1", "2", "3", "4", "5"].map((id) => ({ id }));
}

export default function Page() {
  return <SchoolsDetailPage />;
}
