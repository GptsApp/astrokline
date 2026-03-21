const { Resend } = require('resend');

// Standard Resend initiation with user's key
const resend = new Resend('re_ZxiAN2vx_5Nczq52ioVxYx7pQWdJQTAdv');
const toEmail = 'aoove@qq.com';

async function sendTest() {
  console.log(
    `[TEST 1] Attempting to send from custom domain (noreply@astrokline.com)...`
  );
  try {
    const { data: data1, error: error1 } = await resend.emails.send({
      from: 'AstroKline <noreply@astrokline.com>',
      to: [toEmail],
      subject: 'AstroKline - Custom Domain Test',
      html: '<strong>Success!</strong> Your AstroKline Resend configuration is working perfectly.',
    });

    if (error1) {
      console.error(`[TEST 1] Failed:`, error1.message);

      console.log(
        `\n[TEST 2] Domain might not be verified. Falling back to sandbox domain (onboarding@resend.dev)...`
      );
      const { data: data2, error: error2 } = await resend.emails.send({
        from: 'AstroKline Test <onboarding@resend.dev>',
        to: [toEmail],
        subject: 'AstroKline - Sandbox Test',
        html: '<strong>Success!</strong> Your API key works, but you need to verify astrokline.com in your Resend dashboard before sending from it.',
      });

      if (error2) {
        console.error(`[TEST 2] Failed:`, error2.message);
      } else {
        console.log(`[TEST 2] Success! Email sent via sandbox:`, data2);
      }
    } else {
      console.log(`[TEST 1] Success! Custom domain is working:`, data1);
    }
  } catch (err) {
    console.error('Fatal error setting up resend:', err);
  }
}

sendTest();
