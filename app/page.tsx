import { DashboardV9 } from "@/features/dashboard/components/DashboardV9";
import { getDashboardV9Action } from "@/features/dashboard/actions/dashboard-v9.actions";

export default async function Home() {
  const data = await getDashboardV9Action();
  return <DashboardV9 data={data} />;
}
