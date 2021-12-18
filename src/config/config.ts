require("dotenv").config();

export let config = {
  serviceName: process.env.SERVICE_NAME || "WHITEBOARD_BK_SERVICE",
  mongodbURI: process.env.MONGO_DB_URI || "mongodb://localhost:27017/whiteboard",
  port: process.env.PORT || 8000,
  url: process.env.URL || "http://localhost:8000/v1/checkInviteLink/checkUrl?",
  getUrl: process.env.GETURL || "https://stupefied-northcutt-7084dd.netlify.app/#//whiteboard/",
  imgPath: process.env.IMG_PATH || "public/static/media/upload/images/",
  pdfPath: process.env.PDF_PATH || "public/static/media/upload/files/",
  uploadImgPath: process.env.UPLOAD_IMG_PATH || "http://localhost:8000/static/media/upload/images/",
  uploadPdfPath: process.env.UPLOAD_PDF_PATH || "http://localhost:8000/static/media/upload/files/",

  // Maximum upload file size
  size: process.env.SIZE || 1000000 * 15 * 10, // 1000000 Bytes = 1 MB || 1000000 * 15 * 10 = 150 MB

  // mail configs
  emailAuthKey: process.env.EMAIL_API_KEY || "",
  mailtrapSMTPHost: process.env.MAILTRAP_SMTP_HOST || "smtp.mailtrap.io",
  mailtrapAuthUser: process.env.MAILTRAP_AUTH_USER || "f207a9aac99331",
  mailtrapAuthPass: process.env.MAILTRAP_AUTH_PASS || "921bf7c51d1f47",

  senderEmailId: process.env.SENDER_EMAIL || "whiteboard@gmail.com",
  senderEmailPassword: process.env.SENDER_EMAIL_PASSWORD || "",
  senderName: process.env.SENDER_NAME || "WHITEBOARD ADMIN",
  mailProvider: process.env.MAIL_PROVIDER || "nodemailer"
};
