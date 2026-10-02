import nodemailer from 'nodemailer';

const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpUser = process.env.SMTP_USER;
const smtpPassword = process.env.SMTP_PASSWORD;
const sender = process.env.EMAIL_FROM || smtpUser;

function getTransporter() {
  if (!process.env.SMTP_HOST || !smtpUser || !smtpPassword || !sender) {
    throw new Error('SMTP email settings are missing. Configure SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and EMAIL_FROM.');
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: process.env.SMTP_SECURE !== 'false',
    auth: { user: smtpUser, pass: smtpPassword },
  });
}

export async function sendOtpEmail(to: string, code: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const transporter = getTransporter();

  await transporter.sendMail({
    from: sender,
    to,
    subject: `${code} is your House of Ramyaa verification code`,
    text: `Your House of Ramyaa verification code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
    html: `
      <div style="margin:0;background:#fdfbf7;padding:32px 16px;font-family:Arial,sans-serif;color:#1a2332">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #faF4eb;border-radius:18px;overflow:hidden">
          <div style="background:#1e65b3;padding:26px 28px;text-align:center">
            <div style="color:#ffffff;font-family:Georgia,serif;font-size:26px;font-weight:700">House of Ramyaa</div>
            <div style="color:#fbe9f1;font-size:12px;margin-top:6px;letter-spacing:1px">AUTHENTIC RAJASTHANI CRAFT</div>
          </div>
          <div style="padding:32px 28px">
            <p style="margin:0 0 8px;color:#e785b1;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase">Email verification</p>
            <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:28px;color:#1a2332">Welcome to House of Ramyaa</h1>
            <p style="margin:0;color:#5d6570;font-size:15px;line-height:1.6">Use the verification code below to finish creating your account.</p>
            <div style="margin:26px 0;padding:18px;text-align:center;background:#fdf5f8;border:1px dashed #e785b1;border-radius:12px">
              <div style="color:#6d2244;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase">Your verification code</div>
              <div style="margin-top:8px;color:#1e65b3;font-size:34px;font-weight:700;letter-spacing:8px">${code}</div>
            </div>
            <p style="margin:0;color:#5d6570;font-size:13px;line-height:1.6">This code expires in <strong>10 minutes</strong>. For your security, never share it with anyone.</p>
            <p style="margin:24px 0 0;color:#8a9099;font-size:12px;line-height:1.5">If you did not request this code, no action is needed. Your account will not be created without verification.</p>
          </div>
          <div style="border-top:1px solid #f1eee8;padding:18px 28px;text-align:center;color:#8a9099;font-size:11px">
            <a href="${siteUrl}" style="color:#1e65b3;text-decoration:none">houseoframyaa.com</a><br />Handcrafted with pride in Rajasthan
          </div>
        </div>
      </div>
    `,
  });
}
