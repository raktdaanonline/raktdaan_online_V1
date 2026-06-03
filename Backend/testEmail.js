import dotenv from "dotenv";
import transporter from "./config/emailConfig.js";

dotenv.config();

const runTest = async () => {
  console.log("Testing Nodemailer setup...");
  console.log("Using EMAIL_USER:", process.env.EMAIL_USER);
  
  if (!process.env.EMAIL_PASS) {
    console.error("ERROR: EMAIL_PASS is not defined in .env");
    process.exit(1);
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to self
      subject: "Test Email from Raktdaan 🩸",
      html: "<h1>Success!</h1><p>Nodemailer is correctly configured with Gmail App Password.</p>"
    });
    
    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Failed to send email.");
    console.error("Error details:", error.message);
    if (error.code === 'EAUTH') {
      console.error("\nTIP: Make sure you are using a 16-digit Gmail App Password in EMAIL_PASS, not your regular password.");
    }
  }
  process.exit();
};

runTest();
