import { EmailManager, ResendProvider, SendflareProvider } from '@/extensions/email';
import { Configs, getAllConfigs } from '@/shared/models/config';

/**
 * get email service with configs
 */
export function getEmailServiceWithConfigs(configs: Configs) {
  const emailManager = new EmailManager();

  // Sendflare provider (preferred)
  if (configs.sendflare_api_key) {
    emailManager.addProvider(
      new SendflareProvider({
        apiKey: configs.sendflare_api_key,
        defaultFrom: configs.sendflare_sender_email || configs.resend_sender_email,
      })
    );
  }

  // Resend provider (fallback)
  if (configs.resend_api_key) {
    emailManager.addProvider(
      new ResendProvider({
        apiKey: configs.resend_api_key,
        defaultFrom: configs.resend_sender_email,
      })
    );
  }

  return emailManager;
}

/**
 * global email service
 */
let emailService: EmailManager | null = null;

/**
 * get email service instance
 */
export async function getEmailService(
  configs?: Configs
): Promise<EmailManager> {
  if (!configs) {
    configs = await getAllConfigs();
  }
  emailService = getEmailServiceWithConfigs(configs);

  return emailService;
}
