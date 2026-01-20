// backend/src/utils/emailService.js - GOOGLE WORKSPACE VERSION
import nodemailer from 'nodemailer';

const FROM_EMAIL = 'noreply@inscovia.com';
const FROM_NAME = 'Inscovia';
const LOGO_URL = 'https://res.cloudinary.com/dwddvakdf/image/upload/v1768211226/Inscovia_-_1_2_zbkogh.png';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // noreply@inscovia.com
    pass: process.env.GMAIL_APP_PASSWORD // uzer wygh sebs ozyw
  }
});

// Simple email template
const getEmailTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #2563eb;
      color: white;
      padding: 30px;
      text-align: center;
    }
    .logo {
      max-width: 180px;
      height: auto;
      margin-bottom: 15px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: normal;
    }
    .content {
      padding: 30px;
    }
    .content p {
      margin: 0 0 15px 0;
      color: #555;
    }
    .code-box {
      background-color: #f8f9fa;
      border: 2px solid #2563eb;
      border-radius: 6px;
      padding: 20px;
      text-align: center;
      margin: 25px 0;
    }
    .code {
      font-size: 32px;
      font-weight: bold;
      color: #2563eb;
      letter-spacing: 8px;
      font-family: monospace;
    }
    .expiry {
      color: #666;
      font-size: 13px;
      margin-top: 10px;
    }
    .button {
      display: inline-block;
      padding: 14px 35px;
      background-color: #2563eb;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .note {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      font-size: 14px;
      color: #856404;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 12px;
      border-top: 1px solid #e0e0e0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${LOGO_URL}" alt="Inscovia" class="logo" />
      <h1>Inscovia</h1>
    </div>
    ${content}
    <div class="footer">
      <p><strong>Inscovia</strong></p>
      <p>This is an automated message, please do not reply.</p>
      <p style="margin-top: 10px;">Need help? Contact us at support@inscovia.com</p>
    </div>
  </div>
</body>
</html>
`;

// OTP Email
export const sendOTPEmail = async (email, otp, instituteName) => {
  try {
    const content = `
      <div class="content">
        <p>Hello ${instituteName},</p>
        <p>Thank you for registering with Inscovia.</p>
        <p>Please use the verification code below to complete your registration:</p>

        <div class="code-box">
          <div class="code">${otp}</div>
          <div class="expiry">Valid for 10 minutes</div>
        </div>

        <div class="note">
          <p><strong>Important:</strong></p>
          <p>• This code expires in 10 minutes<br/>
          • Never share this code with anyone<br/>
          • If you didn't request this, please ignore this email</p>
        </div>

        <p>Best regards,<br/>
        <strong>The Inscovia Team</strong></p>
      </div>
    `;

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: 'Verify Your Email - Inscovia',
      html: getEmailTemplate(content)
    });

    console.log('✅ OTP email sent successfully to:', email);
    return { success: true };

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
};

// Password Reset Email
export const sendPasswordResetEmail = async (email, resetToken, instituteName) => {
  try {
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${FRONTEND_URL}/institute/reset-password?token=${resetToken}`;

    const content = `
      <div class="content">
        <p>Hello ${instituteName},</p>
        <p>We received a request to reset your password.</p>
        <p>Click the button below to create a new password:</p>

        <div style="text-align: center;">
          <a href="${resetLink}" class="button">Reset Password</a>
        </div>

        <div class="note">
          <p><strong>Important:</strong></p>
          <p>• This link expires in 1 hour<br/>
          • Link can only be used once<br/>
          • If you didn't request this, please ignore this email</p>
        </div>

        <p style="font-size: 13px; color: #666;">If the button doesn't work, copy and paste this link:<br/>
        <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a></p>

        <p>Best regards,<br/>
        <strong>The Inscovia Team</strong></p>
      </div>
    `;

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: 'Reset Your Password - Inscovia',
      html: getEmailTemplate(content)
    });

    console.log('✅ Password reset email sent successfully to:', email);
    return { success: true };

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
};