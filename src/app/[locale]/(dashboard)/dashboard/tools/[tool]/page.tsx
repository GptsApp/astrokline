import { getUserInfo } from '@/shared/models/user';
import { getAstroUserTier } from '@/lib/astrokline/user-tier';
import { getMyKline } from '@/shared/models/kline';
import { EnergyTool } from '@/components/astrocurve/tools/energy-tool';
import { CompatibilityTool } from '@/components/astrocurve/tools/compatibility-tool';
import { ToolBreadcrumb } from '@/components/astrocurve/tools/tool-breadcrumb';
import { redirect } from '@/core/i18n/navigation';
import { notFound } from 'next/navigation';

interface ToolPageProps {
  params: Promise<{ locale: string; tool: string }>;
}

const TOOL_MAP: Record<string, { title: string; component: string }> = {
  energy: { title: 'Energy Forecast', component: 'energy' },
  compatibility: { title: 'Compatibility Check', component: 'compatibility' },
};

export default async function DashboardToolPage({ params }: ToolPageProps) {
  const { locale, tool } = await params;

  const meta = TOOL_MAP[tool];
  if (!meta) notFound();

  const user = await getUserInfo();
  if (!user) redirect({ href: '/sign-in', locale });
  const currentUser = user!;

  const tier = await getAstroUserTier(currentUser);
  const myKline = await getMyKline(currentUser.id);

  if (!myKline?.klineResult) {
    redirect({ href: '/dashboard/kline', locale });
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
