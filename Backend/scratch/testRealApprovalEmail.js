import dotenv from "dotenv";
import { sendEmail } from "../utils/sendEmail.js";

dotenv.config();

const runTest = async () => {
  console.log("Testing real approval email sending...");
  console.log("Using SMTP_USER:", process.env.SMTP_USER);
  
  try {
    const rawToken = "TEST_TOKEN_XYZ";
    const setupLink = `http://localhost:5173/blood-bank/set-password?token=${rawToken}&email=rdhayatidak%40gmail.com`;
    
    const info = await sendEmail({
      to: "rdhayatidak@gmail.com",
      subject: "Your Blood Bank Account Has Been Approved",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #22c55e;">Account Approved!</h2>
          <p>Hello Test Manager,</p>
          <p>Congratulations! Your blood bank registration for <strong>Test Blood Bank</strong> has been approved.</p>
          <p>Please setup your secure login password using the link below:</p>
          <p><a href="${setupLink}" style="display: inline-block; padding: 12px 24px; background-color: #22c55e; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Set Password</a></p>
          <p>This link is valid for 24 hours.</p>
        </div>
      `,
    });
    
    console.log("Result:", info);
  } catch (error) {
    console.error("Error:", error.message);
  }
  process.exit();
};

runTest();
