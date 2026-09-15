const E = {
  blood:  '\uD83E\uDE78',   // 🩸
  check:  '\u2705',          // ✅
  heart:  '\u2764\uFE0F',   // ❤️
  party:  '\uD83C\uDF89',   // 🎉
  cal:    '\uD83D\uDCC5',   // 📅
  pin:    '\uD83D\uDCCD',   // 📍
  alarm:  '\u23F0',          // ⏰
  warn:   '\u26A0\uFE0F',   // ⚠️
  lock:   '\uD83D\uDD10',   // 🔐
  medal:  '\uD83C\uDFC5',   // 🏅
  trophy: '\uD83C\uDFC6',   // 🏆
  tent:   '\u26FA',          // ⛺
  siren:  '\uD83D\uDEA8',   // 🚨
  users:  '\uD83D\uDC65',   // 👥
  drop:   '\uD83D\uDCA7',   // 💧
  phone:  '\uD83D\uDCF1',   // 📱
  mail:   '\uD83D\uDCE7',   // 📧
}

// All message templates using E.emoji:

const messages = {

  enquiryConfirmation: (organizerName, campDate, area) =>
`${E.blood} *Raktdaan — Enquiry Received*

Namaste ${organizerName} ji!

Aapki blood donation camp request mil gayi hai.

${E.cal} Preferred date: ${campDate}
${E.pin} Area: ${area}

${E.check} Hamare admin 24-48 ghante mein review karenge.

Shukriya! ${E.heart}
_Raktdaan Team_`.trim(),

  enquiryApproved: (organizerName, email, tempPassword, campDate, venue) =>
`${E.party} *Raktdaan — Camp Approved!*

Hello ${organizerName} !

Your camp request has been approved!

${E.tent} *Camp Details:*
${E.cal} Date: ${campDate}
${E.pin} Venue: ${venue}

${E.lock} *Login Credentials:*
${E.mail} Email: ${email}
Password: *${tempPassword}*

${E.phone} Login: raktdaan.online/organizer-login

${E.warn} _Password must be changed._

_Raktdaan Team_`.trim(),

  enquiryRejected: (organizerName, reason) =>
`*Raktdaan — Camp Request Update*

Hello ${organizerName} !

Your camp request has been rejected.

Reason: ${reason}

You can request again.

_Raktdaan Team_`.trim(),

  donorRegistration: (donorName, campTitle, campDate, venue, timeSlot) =>
`${E.check} *Registration Confirmed!*

Namaste ${donorName} ji!

${E.tent} *Camp:* ${campTitle}
${E.cal} *Date:* ${campDate}
${E.pin} *Venue:* ${venue}
${E.alarm} *Your slot:* ${timeSlot}

*Remember:*
- Do not come on an empty stomach.
- Drink some water before coming.
- Bring proof of ID.

Reply *YES* to confirm
Reply *NO* to cancel

${E.blood} _Raktdaan_`.trim(),

  campReminder: (donorName, campTitle, campDate, venue) =>
`${E.alarm} *Camp tomorrow!*

Hello ${donorName} ji!

*${campTitle}* is tomorrow!

${E.cal} Date: ${campDate}
${E.pin} Venue: ${venue}

Reply *YES* — I am coming
Reply *NO* — I can't come

_Raktdaan_`.trim(),

  campComplete: (organizerName, campTitle, donors, units, livesSaved) =>
`${E.party} *The camp was a success!*

Hello ${organizerName} ji!

*${campTitle}* went very well!

${E.users} Donors came: *${donors}*
${E.blood} Units collected: *${units}*
${E.heart} Lives saved: *${livesSaved}*

Certificate is available on dashboard.
raktdaan.online/organizer-dashboard

Thank you! ${E.trophy}
_Raktdaan Team_`.trim(),

  donorCertificate: (donorName, campTitle, campDate, badge) =>
`${E.medal} *Blood Donation Certificate*

Hello ${donorName} ji!

*${campTitle}* Thank you for donating to Bloods!
${E.trophy} Badge: *${badge}*

You will be eligible again after 3 months.
_Raktdaan_`.trim(),

  urgentBlood: (bloodGroup, hospital, city, units) =>
`${E.siren} *URGENT — Blood Required!*

*${bloodGroup} blood* Need  right now.!

Hospital: ${hospital}
City: ${city}
Units needed: ${units}

If you can donate, reply with *DONATE*

_Raktdaan Emergency_`.trim(),

  campShare: (campTitle, campDate, venue, campId) =>
`${E.blood} *Blood Donation Camp!*

*${campTitle}*
${E.cal} ${campDate}
${E.pin} ${venue}

Join us and save a life! Register Now.r: raktdaan.online/camps/${campId}

_Raktdaan_`.trim(),

}

export default messages;
