import { getSignUser } from '@/shared/models/user';
import { VerificationCode } from '@/shared/blocks/email/verification-code';
import { respData, respErr } from '@/shared/lib/resp';
import { getEmailService } from '@/shared/services/email';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const user = await getSignUser();
    if (!user) {
      return respErr('not login');
    }
    const { emails, subject } = await req.json();

    // Validate input
    if (!emails || !Array.isArray(emails) || emails.length === 0 || emails.length > 5) {
      return respErr('invalid emails');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of emails) {
      if (typeof email !== 'string' || !emailRegex.test(email)) {
        return respErr('invalid email address');
      }
    }
    if (!subject || typeof subject !== 'string' || subject.length > 200) {
      return respErr('invalid subject');
    }

    // Generate a real random verification code
    const code = crypto.randomInt(100000, 999999).toString();

    const emailService = await getEmailService();

    const result = await emailService.sendEmail({
      to: emails,
      subject: subject,
      react: VerificationCode({ code }),
    });

    return respData(result);
  } catch (e) {
    console.error('send email failed:', e);
    return respErr('send email failed');
  }
}
