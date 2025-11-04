/**
 * IMPORTANT: This service uses Node.js APIs (nodemailer) that are not compatible with Edge Runtime.
 * For client-side usage or Edge Runtime compatibility, please use the API route at:
 * /api/email/send
 * 
 * Or use the email-client.ts wrapper which calls the API route properly.
 * This file should only be imported in Node.js runtime contexts (API routes with runtime: 'nodejs')
 */

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465, // أو 587 إذا كنت تستخدم TLS
  secure: true, // true إذا كنت تستخدم SSL
  auth: {
    user: 'noreply@nnh.ae', // بريدك الإلكتروني
    pass: 'your_email_password', // كلمة المرور
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  const mailOptions = {
    from: '"NNH AI Studio" <noreply@nnh.ae>',
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }
}