const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // If SMTP isn't fully configured in .env, we gracefully mock the email sending.
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('\n========================================================');
    console.log(`[SIMULATED EMAIL] To: ${options.email}`);
    console.log(`[SIMULATED EMAIL] Subject: ${options.subject}`);
    console.log(`[SIMULATED EMAIL] Message:\n${options.message}`);
    console.log('========================================================\n');
    console.log('Note: Configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in .env to send real emails.');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const message = {
      from: `${process.env.FROM_NAME || 'RecurPay Admin'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    const info = await transporter.sendMail(message);
    console.log('Email sent: %s', info.messageId);
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

module.exports = sendEmail;
