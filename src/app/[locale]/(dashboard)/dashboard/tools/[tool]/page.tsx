import { getUserInfo } from '@/shared/models/user';
import { getAstroUserTier } from '@/lib/astrokline/user-tier';
import { getMyKline } from '@/shared/models/kline';
import { EnergyTool } from '@/components/astrokline/tools/energy-tool';
import { CompatibilityTool } from '@/components/astrokline/tools/compatibility-tool';
import { ToolBreadcrumb } from '@/components/astrokline/tools/tool-breadcrumb';
import { redirect } from 'next/navigation';

interface ToolPageProps {
  params: Promise<{ locale: string; tool: string }>;
}

const TOOL_MAP: Record<string, { title: string; component: string }> = {
  energy: { title: 'Energy Forecast', component: 'energy' },
  compatibility: { title: 'Compatibility Check', component: 'compatibility' },
};

export default async function DashboardToolPage({ params }: ToolPageProps) {
  const { tool } = await params;

  const meta = TOOL_MAP[tool];
  if (!meta) redirect('/dashboard');

  const user = await getUserInfo();
  if (!user) redirect('/sign-in');

  const tier = await getAstroUserTier(user);
  const myKline = await getMyKline(user.id);

  if (!myKline?.klineResult) {
    redirect('/dashboard/kline');
  }

  return (
    <div className="space-y-0 pb-24">
      <ToolBreadcrumb title={meta.title} />
      {meta.component === 'energy' && (
        <EnergyTool tier={tier} klineResult={myKline.klineResult} />
      )}
      {meta.component === 'compatibility' && (
        <CompatibilityTool tier={tier} klineResult={myKline.klineResult} />
      )}
    </div>
  );
}
