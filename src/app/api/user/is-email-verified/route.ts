import { respData, respErr } from '@/shared/lib/resp';
import { isEmailVerified, getSignUser } from '@/shared/models/user';

export async function POST(req: Request) {
  try {
    const user = await getSignUser();
    if (!user) {
      return respErr('not login');
    }

    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || '')
      .trim()
      .toLowerCase();
    if (!email) {
      return respErr('email is required');
    }

    // Only allow users to check their own email verification status
    if (user.email?.toLowerCase() !== email) {
      return respErr('email is required');
    }

    const emailVerified = await isEmailVerified(email);

    return respData({ emailVerified });
  } catch (e) {
    console.error('check email verified failed:', e);
    return respErr('check email verified failed');
  }
}
