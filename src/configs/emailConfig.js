const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const {
  emailHost,
  emailPass,
  emailUser,
  emailPort
} = require('./envConfig');

// Log config for debugging

// Create transporter with explicit SSL settings
const transporter = nodemailer.createTransport({
  host: emailHost, // 'mail.247activetrading.com'
  port: emailPort, // 465
  secure: true,    // Use implicit TLS for port 465
  auth: {
    user: emailUser, // '_mainaccount@247activetrading.com'
    pass: emailPass, // Your cPanel password
  },
  debug: true,     // Enable debug output
  logger: true,    // Log to console
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
const sendEmail = async ({ to, subject, template, data }) => {
  try {
    const templatePath = path.join(__dirname, `../public/emailTemplates/${template}.ejs`);
    const html = await ejs.renderFile(templatePath, data);

    const mailOptions = {
      from: `"Horizon App" <${emailUser}>`,
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

module.exports = { sendEmail };