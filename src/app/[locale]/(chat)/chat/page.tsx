import { redirect } from '@/core/i18n/navigation';
import { getUserInfo } from '@/shared/models/user';

export default async function ChatPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getUserInfo();

  redirect({ href: user ? '/dashboard/ask-chart' : '/kline', locale });
}
