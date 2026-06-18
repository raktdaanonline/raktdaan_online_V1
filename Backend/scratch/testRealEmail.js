import dotenv from "dotenv";
import transporter from "../config/emailConfig.js";

dotenv.config();

const runTest = async () => {
  console.log("Testing Nodemailer config setup...");
  console.log("Using SMTP_USER:", process.env.SMTP_USER);
  
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to self
      subject: "Test Email from Raktdaan 🩸",
      html: "<h1>Success!</h1><p>Nodemailer is correctly configured with Gmail App Password.</p>"
    });
    
    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Failed to send email.");
    console.error("Error details:", error.message);
  }
  process.exit();
};

runTest();
