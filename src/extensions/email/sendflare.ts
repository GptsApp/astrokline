import { render } from '@react-email/components';

import type {
  EmailConfigs,
  EmailMessage,
  EmailProvider,
  EmailSendResult,
} from '.';

/**
 * Sendflare email provider configs
 * @docs https://docs.sendflare.com/
 */
export interface SendflareConfigs extends EmailConfigs {
  apiKey: string;
  defaultFrom?: string;
}

/**
 * Sendflare email provider implementation
 * Uses the Sendflare REST API directly (no SDK dependency for Workers compatibility)
 * @website https://sendflare.com/
 */
export class SendflareProvider implements EmailProvider {
  readonly name = 'sendflare';
  configs: SendflareConfigs;

  constructor(configs: SendflareConfigs) {
    this.configs = configs;
  }

  async sendEmail(email: EmailMessage): Promise<EmailSendResult> {
    try {
      // Build HTML content from react component if provided
      let htmlContent = email.html || '';
      if (email.react) {
        htmlContent = await render(email.react);
      }

      // If still no HTML, use plain text wrapped in basic HTML
      if (!htmlContent && email.text) {
        htmlContent = `<pre>${email.text}</pre>`;
      }

      const to = Array.isArray(email.to) ? email.to[0] : email.to;

      // Sendflare API request body
      const body: Record<string, unknown> = {
        from: email.from || this.configs.defaultFrom || '',
        to,
        subject: email.subject,
        body: htmlContent,
      };

      // Optional fields
      if (email.cc) {
        body.cc = Array.isArray(email.cc) ? email.cc : [email.cc];
      }
      if (email.bcc) {
        body.bcc = Array.isArray(email.bcc) ? email.bcc : [email.bcc];
      }

      const response = await fetch('https://api.sendflare.com/v1/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.configs.apiKey}`,
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json() as {
        success?: boolean;
        code?: number;
        message?: string;
        requestId?: string;
        data?: Record<string, unknown>;
      };

      console.log('sendflare email result', result);

      if (!result.success || result.code !== 0) {
        return {
          success: false,
          error: result.message || 'Sendflare API error',
          provider: this.name,
        };
      }

      return {
        success: true,
        messageId: result.requestId,
        provider: this.name,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.name,
      };
    }
  }
}

/**
 * Create Sendflare provider with configs
 */
export function createSendflareProvider(configs: SendflareConfigs): SendflareProvider {
  return new SendflareProvider(configs);
}
