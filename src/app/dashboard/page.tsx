
import { DashboardOverview } from '@/app/dashboard/overview/dashboard-overview';
import { Metadata } from 'next/types';

export const metadata = { title: `Overview | Dashboard ` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return <DashboardOverview />;
}