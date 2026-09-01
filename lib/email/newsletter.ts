/**
 * Newsletter Email Service
 * Sends verification and unsubscribe emails using Resend
 */

import { Resend } from "resend";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const FROM_EMAIL = process.env.EMAIL_FROM || "newsletter@vntv.tv";
const FROM_NAME = "VNTV";

// Initialize Resend (will be undefined if no API key - for development)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Send newsletter verification email
 */
export async function sendVerificationEmail(
  email: string,
  verificationToken: string
): Promise<boolean> {
  const verificationUrl = `${SITE_URL}/newsletter/verify?token=${verificationToken}`;

  const emailContent = {
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: email,
    subject: "Verify your VNTV newsletter subscription",
    html: generateVerificationEmailHTML(verificationUrl),
  };

  try {
    // If Resend is configured, send email
    if (resend) {
      const { data, error } = await resend.emails.send(emailContent);
      
      if (error) {
        console.error("Resend error:", error);
        return false;
      }
      
      console.log("✅ Verification email sent via Resend:", { to: email, id: data?.id });
      return true;
    } else {
      // Development mode - log to console
      console.log("📧 Newsletter verification email (DEV MODE - no API key):", {
        to: email,
        verificationUrl,
      });
      return true;
    }
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return false;
  }
}

/**
 * Generate verification email HTML
 */
function generateVerificationEmailHTML(verificationUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your VNTV Subscription</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background-color: #DC2626; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">VNTV</h1>
              <p style="margin: 8px 0 0; color: #ffffff; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Africa. Our Stories. Our Way.</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">Verify Your Subscription</h2>
              
              <p style="margin: 0 0 16px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Thank you for subscribing to the VNTV newsletter! To complete your subscription and start receiving the latest African news, please verify your email address.
              </p>
              
              <div style="margin: 32px 0; text-align: center;">
                <a href="${verificationUrl}" style="display: inline-block; padding: 16px 32px; background-color: #DC2626; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">
                  Verify Email Address
                </a>
              </div>
              
              <p style="margin: 24px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                If you didn't subscribe to our newsletter, you can safely ignore this email.
              </p>
              
              <p style="margin: 16px 0 0; color: #a0aec0; font-size: 12px; line-height: 1.6;">
                This link will expire in 7 days. If the button doesn't work, copy and paste this URL into your browser:<br>
                <a href="${verificationUrl}" style="color: #DC2626; word-break: break-all;">${verificationUrl}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f7fafc; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                © ${new Date().getFullYear()} VNTV. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate verification email plain text
 */
function generateVerificationEmailText(verificationUrl: string): string {
  return `
VNTV - Verify Your Subscription

Thank you for subscribing to the VNTV newsletter!

To complete your subscription and start receiving the latest African news, please verify your email address by clicking the link below:

${verificationUrl}

If you didn't subscribe to our newsletter, you can safely ignore this email.

This link will expire in 7 days.

---
© ${new Date().getFullYear()} VNTV. All rights reserved.
  `.trim();
}

/**
 * Send unsubscribe confirmation email (optional)
 */
export async function sendUnsubscribeConfirmationEmail(
  email: string
): Promise<boolean> {
  const emailContent = {
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: email,
    subject: "You've been unsubscribed from VNTV newsletter",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #1a1a1a; margin-bottom: 20px;">You've been unsubscribed</h2>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
          You have successfully unsubscribed from the VNTV newsletter.
        </p>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
          We're sorry to see you go. If this was a mistake, you can resubscribe anytime at 
          <a href="${SITE_URL}" style="color: #DC2626; text-decoration: none;">vntv.tv</a>
        </p>
        <p style="margin-top: 32px; color: #a0aec0; font-size: 12px;">
          © ${new Date().getFullYear()} VNTV. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    if (resend) {
      const { error } = await resend.emails.send(emailContent);
      if (error) {
        console.error("Resend error:", error);
        return false;
      }
      console.log("✅ Unsubscribe confirmation sent via Resend:", { to: email });
      return true;
    } else {
      console.log("📧 Unsubscribe confirmation email (DEV MODE):", { to: email });
      return true;
    }
  } catch (error) {
    console.error("Failed to send unsubscribe confirmation:", error);
    return false;
  }
}
