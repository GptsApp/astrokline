import { getCurrentSubscription } from '@/shared/models/subscription';
import { getUserInfo } from '@/shared/models/user';

export async function GET() {
  try {
    const user = await getUserInfo();
    if (!user) {
      return Response.json({ code: -1, message: 'no auth' });
    }

    const currentSubscription = await getCurrentSubscription(user.id);

    return Response.json({
      code: 0,
      message: 'ok',
      data: currentSubscription ?? null,
    });
  } catch (error) {
    console.log('get current subscription failed:', error);
    return Response.json(
      { code: -1, message: 'get current subscription failed' },
      { status: 500 }
    );
  }
}