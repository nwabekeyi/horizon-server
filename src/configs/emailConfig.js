const nodemailer = require("nodemailer");
const {
    emailHost,
    emailPass,
    emailUser,
    emailPort
} = require('./envConfig')

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: emailHost, // e.g., smtp.gmail.com
  port: emailPort, // e.g., 587 for TLS, 465 for SSL
  secure: emailPort == 465, // true for 465 (SSL), false for 587 (TLS)
  auth: {
    user: emailUser, // Your email address
    pass: emailPass, // Your email password or app-specific password
  },
});

// Verify the transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Nodemailer configuration error:", error);
  } else {
    console.log("Nodemailer is ready to send emails");
  }
});

// Function to send emails
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `"Horizon App" <${process.env.EMAIL_USER}>`, // Sender address
      to: options.to, // Recipient(s)
      subject: options.subject, // Subject line
      text: options.text, // Plain text body
      html: options.html, // HTML body (optional)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Re-throw to handle in the calling code
  }
};

module.exports = { sendEmail };