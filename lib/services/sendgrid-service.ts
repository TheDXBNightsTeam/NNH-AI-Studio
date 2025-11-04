/**
 * IMPORTANT: This service uses Node.js APIs (SendGrid) that are not compatible with Edge Runtime.
 * For client-side usage or Edge Runtime compatibility, please use the API route at:
 * /api/email/sendgrid
 * 
 * Or use the email-client.ts wrapper which calls the API route properly.
 * This file should only be imported in Node.js runtime contexts (API routes with runtime: 'nodejs')
 */

import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export async function sendEmail(to: string, subject: string, html: string) {
  const msg = {
    to,
    from: 'noreply@nnh.ae', // بريدك الإلكتروني المسجل في SendGrid
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }
}