import dotenv from "dotenv";
import transporter from "../config/emailConfig.js";

dotenv.config();

const runTest = async () => {
  console.log("Testing Nodemailer config setup to target...");
  console.log("Using SMTP_USER:", process.env.SMTP_USER);
  
  try {
    const info = await transporter.sendMail({
      from: `"Raktdaan" <${process.env.SMTP_USER}>`,
      to: "rdhayatidak@gmail.com",
      subject: "Test Email from Raktdaan to Blood Bank 🩸",
      html: "<h1>Success!</h1><p>Nodemailer was able to send to rdhayatidak@gmail.com.</p>"
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
