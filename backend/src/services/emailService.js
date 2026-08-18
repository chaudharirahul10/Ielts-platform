const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_PORT == 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const brandColor = "#2563eb";

function emailTemplate(title, message, buttonText, buttonLink) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
  </head>

  <body style="font-family:Arial;background:#f5f7fb;padding:40px;">

    <div style="max-width:600px;margin:auto;background:white;
      border-radius:12px;padding:40px;box-shadow:0 5px 20px rgba(0,0,0,.08);">

      <h1 style="color:${brandColor};margin-top:0;">
        IELTSPro
      </h1>

      <h2>${title}</h2>

      <p style="font-size:16px;color:#444;">
        ${message}
      </p>

      ${
        buttonLink
          ? `
      <a href="${buttonLink}"
      style="
      display:inline-block;
      margin-top:25px;
      background:${brandColor};
      color:white;
      text-decoration:none;
      padding:14px 26px;
      border-radius:8px;
      font-weight:bold;">
      ${buttonText}
      </a>`
          : ""
      }

      <hr style="margin:35px 0">

      <p style="font-size:13px;color:#888;">
      If you didn't request this email, you can safely ignore it.
      </p>

      <p style="font-size:13px;color:#888;">
      © ${new Date().getFullYear()} IELTSPro
      </p>

    </div>

  </body>
  </html>
  `;
}

exports.sendOTPEmail = async (to, otp) => {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Verify your IELTSPro Account",
    html: emailTemplate(
      "Email Verification",
      `Your verification code is <b style="font-size:24px;">${otp}</b><br><br>This code will expire in 10 minutes.`,
      "",
      ""
    ),
  });
};

exports.sendVerificationEmail = async (to, link) => {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Verify Your IELTSPro Email",
    html: emailTemplate(
      "Verify Email",
      "Click the button below to verify your email address.",
      "Verify Email",
      link
    ),
  });
};

exports.sendPasswordResetEmail = async (to, link) => {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Reset Your Password",
    html: emailTemplate(
      "Reset Password",
      "Click the button below to reset your password. This link expires in 30 minutes.",
      "Reset Password",
      link
    ),
  });
};

exports.sendWelcomeEmail = async (to, name) => {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Welcome to IELTSPro 🎉",
    html: emailTemplate(
      `Welcome ${name}!`,
      "Your account has been successfully created. We are excited to help you achieve your target IELTS band score.",
      "Start Learning",
      process.env.FRONTEND_URL
    ),
  });
};