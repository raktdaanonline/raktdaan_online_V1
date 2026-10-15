import axios from "axios";

/**
 * Sends an OTP SMS via Dreamz Technology / DLT SMS gateway.
 * Approved DLT Template:
 * "Welcome to RaktDaan! Your login OTP is {#num#}. It is valid for 5 minutes. Please do not share this OTP with anyone. - RaktDaan"
 *
 * @param {string} mobile - 10-digit Indian mobile number
 * @param {string|number} otp - 6-digit OTP code
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string, raw?: any }>}
 */
export const sendOtpSms = async (mobile, otp) => {
  try {
    const cleanMobile = (mobile || "").toString().replace(/\D/g, "").slice(-10);

    if (!cleanMobile || cleanMobile.length !== 10) {
      return {
        success: false,
        error: "Invalid mobile number. Please provide a 10-digit mobile number.",
      };
    }

    const apiUrl = process.env.SMS_API_URL || "http://trans.dreamztechnolgy.org/smsstatuswithid.aspx";
    const username = process.env.SMS_USERNAME;
    const password = process.env.SMS_PASSWORD;
    const senderId = process.env.SMS_SENDER_ID || "RAKDAN";
    const templateId = process.env.SMS_TEMPLATE_ID || "1777179206543626430";

    if (!username || !password) {
      console.error("[SMS Gateway] Missing SMS_USERNAME or SMS_PASSWORD in environment variables.");
      return {
        success: false,
        error: "SMS gateway credentials not configured on server.",
      };
    }

    // Exact DLT template:
    const messageText = `Welcome to RaktDaan! Your login OTP is ${otp}. It is valid for 5 minutes. Please do not share this OTP with anyone. - RaktDaan`;

    console.log(`[SMS Gateway] Dispatching OTP SMS to +91 ${cleanMobile} (Sender: ${senderId}, Template: ${templateId})...`);

    const response = await axios.get(apiUrl, {
      params: {
        mobile: username,
        pass: password,
        senderid: senderId,
        to: cleanMobile,
        msg: messageText,
        templateid: templateId,
      },
      timeout: 15000,
    });

    const responseData = typeof response.data === "string" ? response.data : JSON.stringify(response.data);
    console.log(`[SMS Gateway Response]:`, responseData);

    // Expected success string: "1 SMS Sent. Message Id: 694638972"
    if (
      responseData.toLowerCase().includes("sms sent") ||
      responseData.toLowerCase().includes("message id")
    ) {
      const match = responseData.match(/Message Id:\s*([^\s,]+)/i);
      const messageId = match ? match[1] : undefined;
      return {
        success: true,
        messageId,
        raw: responseData,
      };
    }

    if (responseData.toLowerCase().includes("error")) {
      console.error(`[SMS Gateway Error]: ${responseData}`);
      return {
        success: false,
        error: responseData,
        raw: responseData,
      };
    }

    return {
      success: true,
      raw: responseData,
    };
  } catch (error) {
    console.error("[SMS Gateway Exception]:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message || "Failed to reach SMS gateway.",
    };
  }
};
