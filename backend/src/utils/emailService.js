// backend/src/utils/emailService.js
import fetch from 'node-fetch';

const ZEPTOMAIL_API_URL = 'https://api.zeptomail.in/v1.1/email';
const ZEPTOMAIL_TOKEN = process.env.ZEPTOMAIL_API_TOKEN;
const FROM_EMAIL = 'noreply@inscovia.com';
const FROM_NAME = 'Inscovia';
const LOGO_URL = 'https://res.cloudinary.com/dwddvakdf/image/upload/v1768211226/Inscovia_-_1_2_zbkogh.png';

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
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
              }
              .email-wrapper {
                background-color: #f5f5f5;
                padding: 40px 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
              .header {
                background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
              }
              .logo {
                max-width: 200px;
                height: auto;
                margin-bottom: 20px;
                display: block;
                margin-left: auto;
                margin-right: auto;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
              }
              .content {
                background: #ffffff;
                padding: 40px 30px;
              }
              .content h2 {
                color: #1f2937;
                font-size: 22px;
                margin-top: 0;
                margin-bottom: 20px;
              }
              .content p {
                color: #4b5563;
                margin-bottom: 16px;
                font-size: 15px;
              }
              .otp-box {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border: 2px solid #2563eb;
                border-radius: 12px;
                padding: 30px 20px;
                text-align: center;
                margin: 30px 0;
              }
              .otp-label {
                margin: 0;
                color: #6b7280;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-weight: 600;
              }
              .otp-code {
                font-size: 36px;
                font-weight: 700;
                color: #2563eb;
                letter-spacing: 10px;
                margin: 15px 0;
                font-family: 'Courier New', monospace;
              }
              .otp-expiry {
                margin: 10px 0 0 0;
                color: #6b7280;
                font-size: 13px;
              }
              .info-box {
                background-color: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 16px;
                margin: 25px 0;
                border-radius: 4px;
              }
              .info-box p {
                margin: 0 0 8px 0;
                font-size: 14px;
                color: #78350f;
                font-weight: 600;
              }
              .info-box ul {
                margin: 8px 0 0 0;
                padding-left: 20px;
                color: #92400e;
              }
              .info-box li {
                margin-bottom: 6px;
                font-size: 14px;
              }
              .footer {
                text-align: center;
                padding: 30px 20px;
                background-color: #f9fafb;
                color: #6b7280;
                font-size: 13px;
                border-top: 1px solid #e5e7eb;
              }
              .footer p {
                margin: 5px 0;
              }
              .divider {
                height: 1px;
                background: linear-gradient(to right, transparent, #e5e7eb, transparent);
                margin: 30px 0;
              }
            </style>
          </head>
          <body>
            <div class="email-wrapper">
              <div class="container">
                <div class="header">
                  <img src="${LOGO_URL}" alt="Inscovia Logo" class="logo" />
                  <h1>Welcome to Inscovia! 🎓</h1>
                </div>
                <div class="content">
                  <h2>Hello ${instituteName},</h2>
                  <p>Thank you for registering with Inscovia! We're excited to have you join our community of educational institutions.</p>

                  <p>To complete your registration and verify your email address, please use the verification code below:</p>

                  <div class="otp-box">
                    <p class="otp-label">Verification Code</p>
                    <div class="otp-code">${otp}</div>
                    <p class="otp-expiry">⏱️ Valid for 10 minutes</p>
                  </div>

                  <div class="info-box">
                    <p>🔒 Important Security Information:</p>
                    <ul>
                      <li>This code will expire in <strong>10 minutes</strong></li>
                      <li>Never share this code with anyone</li>
                      <li>Our team will never ask for this code</li>
                      <li>If you didn't request this, please ignore this email</li>
                    </ul>
                  </div>

                  <div class="divider"></div>

                  <p>Once verified, you'll be able to:</p>
                  <p style="padding-left: 20px;">
                    ✨ Create and manage your institute profile<br/>
                    📊 Track student engagement and inquiries<br/>
                    🎯 Reach thousands of potential students<br/>
                    📈 Grow your institute's visibility
                  </p>

                  <div class="divider"></div>

                  <p style="color: #6b7280; font-size: 14px;">
                    Need help? Contact us at <a href="mailto:support@inscovia.com" style="color: #2563eb; text-decoration: none;">support@inscovia.com</a>
                  </p>

                  <p style="margin-top: 30px; margin-bottom: 0;">
                    Best regards,<br>
                    <strong style="color: #2563eb;">The Inscovia Team</strong>
                  </p>
                </div>
                <div class="footer">
                  <p><strong>© 2025 Inscovia</strong> - All rights reserved</p>
                  <p style="margin-top: 10px; font-size: 12px;">
                    This is an automated message. Please do not reply to this email.
                  </p>
                </div>
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

    console.log('✅ OTP Email sent successfully');
    return { success: true, data };

  } catch (error) {
    console.error('❌ Email Service Error:', error);
    throw error;
  }
};