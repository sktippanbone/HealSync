const twilio = require('twilio');
const dotenv = require('dotenv');

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendOtpSms = async (req, res) => {
    try {
        const { phone } = req.body;
        const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP

        // Store OTP in a temporary cache (use Redis for production)
        global.otpStore = global.otpStore || new Map();
        global.otpStore.set(phone, otp);

        // Send OTP via Twilio SMS
        await client.messages.create({
            body: `Your OTP is: ${otp}. It is valid for 5 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone,
        });

        res.json({ success: true, message: 'OTP sent successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { sendOtpSms };