export const emailTemplates = {
  enquiryConfirmation: (organizerName, campDetails) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #E11D48;">Raktdaan - Camp Request Received! ✅</h2>
      <p>Hello ${organizerName},</p>
      <p>Thank you for initiating a blood donation camp with Raktdaan.</p>
      <p>We have received your request for a camp at <strong>${campDetails.area}</strong> on <strong>${new Date(campDetails.preferredDate).toDateString()}</strong>.</p>
      <p>Our team will review your request within 24-48 hours and contact you shortly.</p>
      <br/>
      <p>For any queries, contact us at: support@bloodinfo.in</p>
      <p>Regards,<br/>Raktdaan Team</p>
    </div>
  `,

  newEnquiryAlert: (organizerName, campDetails) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #E11D48;">New Camp Request Received</h2>
      <p><strong>Organizer:</strong> ${organizerName}</p>
      <p><strong>Phone:</strong> ${campDetails.phone}</p>
      <p><strong>Email:</strong> ${campDetails.email}</p>
      <p><strong>Organization Type:</strong> ${campDetails.organizationType}</p>
      <p><strong>Area:</strong> ${campDetails.area}</p>
      <p><strong>Preferred Date:</strong> ${new Date(campDetails.preferredDate).toDateString()}</p>
      <p><strong>Expected Donors:</strong> ${campDetails.expectedDonors || 'N/A'}</p>
      <br/>
      <p>Please review this request in the Admin Panel.</p>
    </div>
  `,

  approvalEmail: (organizerName, campDetails, email, tempPassword) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #111; color: #eee; border-radius: 8px;">
      <h2 style="color: #E11D48;">🎉 Camp Approved - Login Credentials</h2>
      <p>Congratulations ${organizerName}, Your camp is approved!</p>
      
      <div style="background-color: #222; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Camp Details</h3>
        <p><strong>Date:</strong> ${new Date(campDetails.date).toDateString()}</p>
        <p><strong>Venue:</strong> ${campDetails.venue}</p>
        <p><strong>Area:</strong> ${campDetails.area}</p>
      </div>

      <div style="background-color: #222; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #E11D48;">
        <h3 style="margin-top: 0; color: #E11D48;">Login Credentials</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> <span style="color: #E11D48; font-weight: bold; font-size: 18px;">${tempPassword}</span></p>
      </div>

      <p>Please login to your Organizer Dashboard using the button below:</p>
      <a href="${process.env.FRONTEND_URL}/organizer-login" style="display: inline-block; padding: 10px 20px; background-color: #E11D48; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Dashboard</a>
      
      <p style="color: #ffcc00; margin-top: 20px;"><strong>⚠️ Important Note:</strong> Please login karke apna password change zaroor karein.</p>
    </div>
  `,

  rejectionEmail: (organizerName, reason) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #E11D48;">Raktdaan - Camp Request Update</h2>
      <p>Hello ${organizerName},</p>
      <p>We appreciate your interest in organizing a blood donation camp with Raktdaan.</p>
      <p>However, we are unable to approve your request at this time.</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #E11D48; margin: 20px 0;">
        <p><strong>Reason:</strong> ${reason}</p>
      </div>
      <p>You can request again in the future or join an existing camp.</p>
      <p>Regards,<br/>Raktdaan Team</p>
    </div>
  `,

  postCampReport: (organizerName, campDetails, stats) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd;">
      <div style="text-align: center; border-bottom: 2px solid #E11D48; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="color: #E11D48; margin: 0;">Raktdaan</h1>
        <h3 style="margin: 5px 0 0 0; color: #555;">Camp Completion Report</h3>
      </div>
      
      <p><strong>Organizer:</strong> ${organizerName}</p>
      <p><strong>Camp:</strong> ${campDetails.title}</p>
      <p><strong>Date:</strong> ${new Date(campDetails.date).toDateString()}</p>
      <p><strong>Venue:</strong> ${campDetails.venue}, ${campDetails.city}</p>
      
      <div style="background-color: #fff; border: 2px dashed #E11D48; border-radius: 10px; padding: 20px; text-align: center; margin: 30px 0;">
        <h3 style="margin-top: 0; color: #E11D48;">IMPACT SUMMARY</h3>
        <p style="font-size: 18px; margin: 10px 0;">👥 <strong>${stats.totalDonors}</strong> Donors Attended</p>
        <p style="font-size: 18px; margin: 10px 0;">🩸 <strong>${stats.totalUnitsCollected}</strong> Units Collected</p>
        <p style="font-size: 18px; margin: 10px 0; color: #E11D48;">❤️ <strong>${stats.livesSaved}</strong> Lives Saved</p>
      </div>
      
      <p style="text-align: center; font-size: 18px; font-style: italic;">"Your one step has made a difference in the lives of ${stats.livesSaved} people."</p>
      
      <div style="text-align: center; margin-top: 30px;">
        <p>Thank you ${organizerName} - Same time next year? 🎂</p>
      </div>
    </div>
  `,

  donorCertificate: (donorName, campDetails, badge, nextDate) => `
    <div style="font-family: Arial, sans-serif; padding: 30px; background-color: #fff; color: #333; max-width: 600px; margin: 0 auto; border: 8px solid #E11D48; text-align: center;">
      <h1 style="color: #E11D48; margin-bottom: 5px;">CERTIFICATE OF APPRECIATION</h1>
      <p style="font-size: 16px; color: #666; margin-top: 0;">Presented by Raktdaan</p>
      
      <p style="font-size: 18px; margin-top: 40px;">This certificate is proudly presented to</p>
      <h2 style="font-size: 28px; color: #E11D48; border-bottom: 2px solid #ccc; display: inline-block; padding-bottom: 5px;">${donorName}</h2>
      
      <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">
        For your generous blood donation at the<br/>
        <strong>${campDetails.title}</strong><br/>
        held at ${campDetails.venue} on ${new Date(campDetails.date).toDateString()}.
      </p>
      
      <div style="background-color: #f8f9fa; padding: 15px; margin-top: 30px; border-radius: 5px; border-left: 4px solid #E11D48; text-align: left;">
        <p style="margin: 5px 0;"><strong>Badge Status:</strong> ${badge.toUpperCase()} DONOR</p>
        <p style="margin: 5px 0;"><strong>Next Eligible Date:</strong> ${new Date(nextDate).toDateString()}</p>
      </div>
      
      <div style="margin-top: 40px;">
        <p style="font-style: italic; color: #666;">"Your blood donation is a lifesaver."</p>
      </div>
    </div>
  `,

  bloodBankInvite: (bloodBankName, managerName, licenseNumber, inviteLink) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <p>Hello ${managerName},</p>
      <p>You have been invited to register your blood bank on our Raktdaan platform.</p>
      <p><strong>Blood Bank Name:</strong> ${bloodBankName}</p>
      <p><strong>License Number:</strong> ${licenseNumber}</p>
      <p>Please complete your registration using the secure link below:</p>
      <p><a href="${inviteLink}" style="display: inline-block; padding: 10px 20px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Complete Registration</a></p>
      <p>Or copy this link to your browser:</p>
      <p>${inviteLink}</p>
      <p>This link will expire in 24 hours.</p>
      <br/>
      <p>Thank you,<br/>Raktdaan Team</p>
    </div>
  `,

  bloodBankApproval: (bloodBankName, managerName, email, setupLink) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <p>Hello ${managerName},</p>
      <p>Congratulations! Your blood bank registration for <strong>${bloodBankName}</strong> has been approved by the admin.</p>
      <p>Please set your account password using the secure link below:</p>
      <p><a href="${setupLink}" style="display: inline-block; padding: 10px 20px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Set My Password</a></p>
      <p>Or copy this link to your browser:</p>
      <p>${setupLink}</p>
      <p>This link will expire in 24 hours.</p>
      <p>After setting your password, you can login from the Blood Bank Login page.</p>
      <br/>
      <p>Thank you,<br/>Raktdaan Team</p>
    </div>
  `,

  bloodBankRejection: (bloodBankName, managerName, reason) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <p>Hello ${managerName},</p>
      <p>Your blood bank registration for <strong>${bloodBankName}</strong> has been rejected by the admin.</p>
      ${reason ? `<p><strong>Reason for rejection:</strong> ${reason}</p>` : ''}
      <p>Please contact support/admin for more details.</p>
      <br/>
      <p>Thank you,<br/>Raktdaan Team</p>
    </div>
  `,

  hospitalInvitation: (hospitalName, registrationUrl) => `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 24px; text-align: center; border-bottom: 3px solid #e11d48;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
          Raktdaan <span style="color: #f43f5e;">LifeDrop</span> Network
        </h1>
        <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">Clinical Healthcare & Trauma Support Integration</p>
      </div>

      <div style="padding: 32px 28px; color: #1e293b; line-height: 1.6;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 18px; font-weight: 700;">You Are Invited to Register Your Hospital</h2>
        <p style="color: #475569; font-size: 15px;">Hello,</p>
        <p style="color: #475569; font-size: 15px;">
          You have been officially invited to join our nationwide <strong>Blood Donation & Trauma Response Platform</strong>.
        </p>

        <div style="background-color: #f8fafc; border-left: 4px solid #e11d48; padding: 14px 18px; border-radius: 6px; margin: 20px 0;">
          <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Designated Hospital Entity</div>
          <div style="font-size: 17px; font-weight: 700; color: #0f172a; margin-top: 2px;">${hospitalName}</div>
        </div>

        <p style="color: #475569; font-size: 14px;">
          Please click the button below to complete your hospital registration, enter your exact geographical coordinates, and configure clinical access credentials.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${registrationUrl}" style="display: inline-block; background-color: #e11d48; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 8px; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.25);">
            Complete Hospital Registration &rarr;
          </a>
        </div>

        <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
          Direct registration link: <br/>
          <a href="${registrationUrl}" style="color: #e11d48; word-break: break-all;">${registrationUrl}</a>
        </p>

        <div style="margin-top: 24px; padding: 12px; background-color: #fff1f2; border-radius: 6px; border: 1px solid #ffe4e6; font-size: 12px; color: #9f1239;">
          ⏱️ <strong>Security Notice:</strong> This invitation token is secure, unique, and expires in <strong>48 hours</strong>. It will become invalid automatically after successful registration.
        </div>
      </div>

      <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; text-align: center; font-size: 12px; color: #94a3b8;">
        © ${new Date().getFullYear()} Raktdaan Healthcare Network • Secure Hospital Integration Desk
      </div>
    </div>
  `,

  hospitalApproval: (hospitalName, email, loginUrl) => `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      <div style="background: linear-gradient(135deg, #065f46 0%, #047857 100%); padding: 28px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">
          Hospital Registration Approved ✅
        </h1>
        <p style="color: #a7f3d0; margin: 6px 0 0 0; font-size: 13px;">Raktdaan LifeDrop Trauma & Clinical Network</p>
      </div>

      <div style="padding: 32px 28px; color: #1e293b; line-height: 1.6;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 18px; font-weight: 700;">Hello ${hospitalName},</h2>
        <p style="color: #475569; font-size: 15px;">
          Congratulations! Your hospital registration request has been <strong>approved</strong> by the Admin team.
        </p>

        <p style="color: #475569; font-size: 15px;">
          Your clinical console and emergency trauma desk are now fully activated. You can now access your Hospital Dashboard to coordinate emergency accident alerts and manage blood requests.
        </p>

        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <div style="font-size: 13px; color: #166534; font-weight: 600;">Account Login Details</div>
          <p style="margin: 6px 0 0 0; font-size: 14px; color: #0f172a;">
            <strong>Login Email:</strong> <span style="color: #047857;">${email}</span>
          </p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">
            Please log in using the secure password you created during registration.
          </p>
        </div>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${loginUrl}" style="display: inline-block; background-color: #059669; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 8px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);">
            Access Hospital Dashboard &rarr;
          </a>
        </div>

        <p style="font-size: 12px; color: #64748b;">
          Portal URL: <a href="${loginUrl}" style="color: #059669;">${loginUrl}</a>
        </p>

        <p style="font-size: 13px; color: #475569; margin-top: 24px;">
          Thank you for joining our mission to save lives.
        </p>
      </div>

      <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; text-align: center; font-size: 12px; color: #94a3b8;">
        © ${new Date().getFullYear()} Raktdaan Healthcare Network
      </div>
    </div>
  `,

  hospitalRejection: (hospitalName, reason) => `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: #1e293b; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">
          Hospital Registration Status Update
        </h1>
        <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 12px;">Raktdaan LifeDrop Network</p>
      </div>

      <div style="padding: 28px; color: #1e293b; line-height: 1.6;">
        <p>Hello <strong>${hospitalName}</strong>,</p>
        <p style="color: #475569;">
          Thank you for your interest in joining the Raktdaan Healthcare Network.
        </p>
        <p style="color: #475569;">
          After review, your hospital registration request could not be approved at this time.
        </p>

        ${
          reason
            ? `<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
                <strong style="color: #991b1b; font-size: 13px;">Reason from Administration:</strong>
                <p style="margin: 4px 0 0 0; color: #7f1d1d; font-size: 14px;">${reason}</p>
              </div>`
            : ""
        }

        <p style="color: #64748b; font-size: 13px;">
          If you believe this is an error or would like to provide updated credentials, please contact our administrative desk at support@raktdaan.online.
        </p>

        <p style="margin-top: 24px; color: #334155; font-size: 14px;">
          Regards,<br/>
          <strong>Raktdaan Administrative Team</strong>
        </p>
      </div>
    </div>
  `,
};


