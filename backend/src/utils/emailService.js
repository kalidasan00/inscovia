// backend/src/utils/emailService.js
import fetch from 'node-fetch';

const ZEPTOMAIL_API_URL = 'https://api.zeptomail.in/v1.1/email';
const ZEPTOMAIL_TOKEN = process.env.ZEPTOMAIL_API_TOKEN;
const FROM_EMAIL = 'noreply@inscovia.com';
const FROM_NAME = 'Inscovia';

export const sendOTPEmail = async (email, otp, instituteName) => {
  try {
    const response = await fetch(ZEPTOMAIL_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': ZEPTOMAIL_TOKEN
      },
      body: JSON.stringify({
        from: {
          address: FROM_EMAIL,
          name: FROM_NAME
        },
        to: [
          {
            email_address: {
              address: email,
              name: instituteName
            }
          }
        ],
        subject: 'Verify Your Email - Inscovia Registration',
        htmlbody: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
              .otp-box { background: #f3f4f6; border: 2px dashed #2563eb; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
              .otp-code { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
              .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎓 Welcome to Inscovia!</h1>
              </div>
              <div class="content">
                <h2>Hello ${instituteName},</h2>
                <p>Thank you for registering your institute with Inscovia. To complete your registration, please verify your email address using the OTP code below:</p>

                <div class="otp-box">
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">Your Verification Code</p>
                  <div class="otp-code">${otp}</div>
                  <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">Valid for 10 minutes</p>
                </div>

                <p><strong>Important:</strong></p>
                <ul>
                  <li>This code will expire in <strong>10 minutes</strong></li>
                  <li>Do not share this code with anyone</li>
                  <li>If you didn't request this, please ignore this email</li>
                </ul>

                <p>Once verified, you can start managing your institute profile and reach thousands of potential students!</p>

                <p>Best regards,<br><strong>The Inscovia Team</strong></p>
              </div>
              <div class="footer">
                <p>© 2025 Inscovia. All rights reserved.</p>
                <p>This is an automated email. Please do not reply to this message.</p>
              </div>
            </div>
          </body>
          </html>
        `
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('ZeptoMail API Error:', data);
      throw new Error(data.message || 'Failed to send email');
    }

    console.log('OTP Email sent successfully:', data);
    return { success: true, data };

  } catch (error) {
    console.error('Email Service Error:', error);
    throw error;
  }
};