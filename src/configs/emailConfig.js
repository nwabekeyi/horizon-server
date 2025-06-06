import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import { emailHost, emailPass, emailUser, emailPort } from './envConfig.js';


// Create transporter with explicit SSL settings
const transporter = nodemailer.createTransport({
  host: emailHost,
  port: 465,
  secure: true,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
  tls: {
    rejectUnauthorized: false,
  },
  debug: true,
  logger: true,
});

// Verify configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("Nodemailer configuration error:", error);
  } else {
    console.log("Nodemailer is ready to send emails");
  }
});

// Send email using EJS template
export const sendEmail = async ({ to, subject, template, data }) => {
  try {
    const templatePath = path.join(process.cwd(), 'src', 'public', 'emailTemplates', `${template}.ejs`);
    const html = await ejs.renderFile(templatePath, data);

    const mailOptions = {
      from: `"247AT Support" <${emailUser}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// Test SMTP connection
// const testSMTPConnection = async () => {
//   try {
//     await transporter.verify();
//     console.log("SMTP connection test successful");
//   } catch (error) {
//     console.error("SMTP connection test failed:", error);
//   }
// };

// testSMTPConnection();