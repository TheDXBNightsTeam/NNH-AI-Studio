/**
 * Email Client Wrapper
 * This module provides a clean interface for sending emails from client-side code
 * by calling the appropriate API routes. This ensures Edge Runtime compatibility.
 */

export type EmailProvider = 'nodemailer' | 'sendgrid';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string; // Optional, will use default if not provided
  provider?: EmailProvider; // Specify which email service to use
}

export interface EmailResponse {
  success: boolean;
  message?: string;
  messageId?: string;
  statusCode?: number;
  error?: string;
  details?: any;
  isConfigError?: boolean;
}

/**
 * Send an email using the specified provider
 * @param options Email options including recipient, subject, and HTML content
 * @returns Promise with the result of the email send operation
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResponse> {
  const { to, subject, html, from, provider = 'nodemailer' } = options;

  // Validate input
  if (!to || !subject || !html) {
    throw new Error('Missing required fields: to, subject, and html are required');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    throw new Error('Invalid email address format');
  }

  // Determine which API route to use based on provider
  const apiEndpoint = provider === 'sendgrid' 
    ? '/api/email/sendgrid' 
    : '/api/email/send';

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        html,
        from,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Return error response with details
      return {
        success: false,
        error: data.error || 'Failed to send email',
        details: data.details,
        isConfigError: data.isConfigError,
        statusCode: response.status,
      };
    }

    // Return success response
    return {
      success: true,
      message: data.message || 'Email sent successfully',
      messageId: data.messageId,
      statusCode: data.statusCode || response.status,
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    
    // Handle network errors or other exceptions
    return {
      success: false,
      error: 'Network error or service unavailable',
      details: error instanceof Error ? error.message : 'Unknown error',
      isConfigError: false,
    };
  }
}

/**
 * Send an email using Nodemailer (SMTP)
 * @param to Recipient email address
 * @param subject Email subject
 * @param html HTML content of the email
 * @param from Optional sender email address
 */
export async function sendEmailWithNodemailer(
  to: string,
  subject: string,
  html: string,
  from?: string
): Promise<EmailResponse> {
  return sendEmail({ to, subject, html, from, provider: 'nodemailer' });
}

/**
 * Send an email using SendGrid
 * @param to Recipient email address
 * @param subject Email subject
 * @param html HTML content of the email
 * @param from Optional sender email address
 */
export async function sendEmailWithSendGrid(
  to: string,
  subject: string,
  html: string,
  from?: string
): Promise<EmailResponse> {
  return sendEmail({ to, subject, html, from, provider: 'sendgrid' });
}

/**
 * Batch send emails to multiple recipients
 * @param recipients Array of email addresses
 * @param subject Email subject
 * @param html HTML content of the email
 * @param provider Email provider to use
 * @returns Promise with results for each recipient
 */
export async function sendBatchEmails(
  recipients: string[],
  subject: string,
  html: string,
  provider: EmailProvider = 'nodemailer'
): Promise<{ recipient: string; result: EmailResponse }[]> {
  const results = await Promise.all(
    recipients.map(async (recipient) => {
      const result = await sendEmail({
        to: recipient,
        subject,
        html,
        provider,
      });
      return { recipient, result };
    })
  );
  
  return results;
}

/**
 * Helper function to create HTML email templates
 * @param title Email title
 * @param content Main content of the email
 * @param footer Optional footer content
 */
export function createEmailTemplate(
  title: string,
  content: string,
  footer?: string
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color: #2563eb;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div>${content}</div>
      ${footer ? `<div class="footer">${footer}</div>` : ''}
    </body>
    </html>
  `;
}