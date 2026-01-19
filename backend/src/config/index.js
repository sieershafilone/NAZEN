require('dotenv').config();

module.exports = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',

    jwt: {
        secret: process.env.JWT_SECRET || 'default_secret_change_me',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },

    razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID,
        keySecret: process.env.RAZORPAY_KEY_SECRET,
    },

    frontend: {
        url: process.env.FRONTEND_URL || 'http://localhost:3000',
    },

    gst: {
        defaultPercent: parseFloat(process.env.DEFAULT_GST_PERCENT) || 18,
    },

    twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    },

    smtp: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },

    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
        uploadDir: process.env.UPLOAD_DIR || './uploads',
    },

    gym: {
        name: process.env.GYM_NAME || 'Nazen – Powered by Being Strong',
        address: process.env.GYM_ADDRESS || '97XQ+CW3, Handwara, Jammu and Kashmir – 193221, India',
        phone: process.env.GYM_PHONE || '+91 1234567890',
        gstin: process.env.GYM_GSTIN || '',
    },
};
